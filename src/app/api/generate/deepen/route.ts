import { NextResponse } from "next/server";
import { getActiveGeminiKeys } from "@/lib/neon/db";
import { executeGeminiWithKeyPool } from "@/lib/ai/gemini-pool";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { filename, currentContent, appName, problem, features, userId, customInstructions } = body;

    if (!filename || !currentContent) {
      return NextResponse.json({ success: false, error: "filename and currentContent are required" }, { status: 400 });
    }

    // 1. Fetch available Gemini keys
    let geminiKeys: string[] = [];
    if (Array.isArray(body.geminiKeys) && body.geminiKeys.length > 0) {
      geminiKeys = body.geminiKeys;
    } else {
      try {
        geminiKeys = await getActiveGeminiKeys(userId);
      } catch (err) {
        console.warn("Could not fetch user keys:", err);
      }
    }

    if (geminiKeys.length === 0 && process.env.GEMINI_API_KEY) {
      geminiKeys.push(process.env.GEMINI_API_KEY);
    }

    if (geminiKeys.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Kunci API Gemini tidak ditemukan. Silakan tambahkan Kunci BYOK Gemini Anda di menu 'Kunci BYOK' terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    // 2. Build prompt for deepening the document
    const systemPrompt = `Anda adalah Lead Technical Architect AI untuk AppPlanner.
Tugas Anda adalah memperdalam, memperkaya, dan membuat dokumen blueprint arsitektur menjadi jauh lebih komprehensif, mendalam, dan siap produksi (production-grade).
Pertahankan format Markdown yang rapi dan profesional.`;

    const prompt = `Bertindaklah sebagai Senior Software Architect & Lead Engineer.
Perdalam dan kembangkan dokumen "${filename}" berikut untuk aplikasi "${appName || "Proyek Aplikasi"}":

Konteks Aplikasi:
- Nama Aplikasi: ${appName || "-"}
- Masalah yang Diselesaikan: ${problem || "-"}
- Fitur Utama: ${Array.isArray(features) ? features.join(", ") : "-"}
${customInstructions ? `- Instruksi Tambahan Khusus: ${customInstructions}` : ""}

Konten Dokumen Saat Ini:
\`\`\`markdown
${currentContent}
\`\`\`

INSTRUKSI PENGEMBANGAN DOKUMEN:
1. Lengkapi bagian-bagian yang masih terlalu ringkas atau kurang mendalam.
2. Tambahkan spesifikasi teknis riil, edge case, konstrain data, dan langkah implementasi yang konkret.
3. Jika ini skema database, tambahkan tabel relasi pendukung, DDL SQL, konstrain, dan indeks performa.
4. Jika ini wireframe, tambahkan sketsa ASCII layout untuk layar-layar penting lainnya dan state interaksi.
5. Jika ini API spec, tambahkan endpoint pendukung, skema request/response JSON yang lengkap, dan kode status HTTP.
6. Berikan seluruh dokumen yang telah diperkaya dan disempurnakan secara lengkap dari awal hingga akhir dalam format Markdown murni.`;

    const aiGen = await executeGeminiWithKeyPool({
      prompt,
      systemPrompt,
      keys: geminiKeys,
    });

    if (!aiGen.success || !aiGen.text) {
      return NextResponse.json(
        { success: false, error: aiGen.error || "Gagal memperdalam dokumen dengan AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      filename,
      deepenedContent: aiGen.text,
      usedModel: aiGen.usedModel,
      usedKey: aiGen.usedKeyMasked,
      tokensUsed: aiGen.tokensUsedEstimate,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
