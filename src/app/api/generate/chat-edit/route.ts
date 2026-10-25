import { NextResponse } from "next/server";
import { getActiveGeminiKeys } from "@/lib/neon/db";
import { executeGeminiWithKeyPool } from "@/lib/ai/gemini-pool";

export const dynamic = "force-dynamic";
export const runtime = "edge";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      filename,
      currentContent,
      userMessage,
      chatHistory = [],
      appName,
      problem,
      features,
      userId,
    } = body;

    if (!filename || !currentContent || !userMessage) {
      return NextResponse.json(
        { success: false, error: "filename, currentContent, dan userMessage wajib diisi" },
        { status: 400 }
      );
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

    // 2. Build system instruction & context
    const systemPrompt = `Anda adalah Principal Software Architect dan AI Co-Pilot untuk platform AppPlanner (setara dengan Cursor AI, VS Code Copilot, dan Lovable IDE).
Tugas Anda adalah merevisi, memperbaiki, menambahkan, atau mengoptimalkan dokumen arsitektur teknis bernama "${filename}" berdasarkan instruksi developer melalui chat.

ATURAN UTAMA:
1. Pahami konteks aplikasi: Nama aplikasi "${appName || "Aplikasi"}", domain masalah, dan dokumen terkait.
2. Lakukan perubahan secara presisi, profesional, dan komprehensif. Jangan gunakan placeholder ringkas atau memotong kode/dokumen dengan elipsis '...'!
3. Format output HARUS berupa JSON valid persis dengan struktur berikut:
{
  "explanation": "Penjelasan ringkas dan profesional dalam bahasa Indonesia mengenai apa saja yang diubah atau ditambahkan (1-3 kalimat).",
  "revisedContent": "Seluruh isi dokumen Markdown yang telah direvisi secara LENGKAP dan siap pakai."
}
Pastikan hanya mengembalikan JSON valid tanpa teks pengantar di luar blok JSON.`;

    // Format chat history summary for prompt
    const historyText = Array.isArray(chatHistory) && chatHistory.length > 0
      ? chatHistory
          .slice(-6)
          .map((m: ChatMessage) => `${m.role === "user" ? "User" : "Architect"}: ${m.content}`)
          .join("\n")
      : "Belum ada riwayat sebelumnya.";

    const prompt = `Proyek: ${appName || "Aplikasi"}
Masalah/Konteks: ${problem || "-"}
Fitur Utama: ${Array.isArray(features) ? features.join(", ") : "-"}
Dokumen yang Sedang Direvisi: "${filename}"

Riwayat Percakapan Terakhir:
${historyText}

Konten Dokumen "${filename}" Saat Ini:
\`\`\`markdown
${currentContent}
\`\`\`

Instruksi Revisi Terbaru dari Developer:
"${userMessage}"

Mohon respon dengan JSON valid sesuai instruksi sistem:
{
  "explanation": "Penjelasan ringkas perubahan...",
  "revisedContent": "Isi dokumen Markdown lengkap setelah revisi..."
}`;

    // 3. Execute Gemini with Key Pool
    const aiResult = await executeGeminiWithKeyPool({
      prompt,
      systemPrompt,
      keys: geminiKeys,
    });

    if (!aiResult.success || !aiResult.text) {
      return NextResponse.json(
        {
          success: false,
          error: aiResult.error || "Gagal memproses revisi dengan AI",
          triedAttempts: aiResult.triedAttempts,
        },
        { status: 500 }
      );
    }

    // 4. Parse AI Response
    let explanation = "Dokumen berhasil diperbarui sesuai instruksi Anda.";
    let revisedContent = currentContent;

    const rawText = aiResult.text.trim();

    // Clean JSON markdown code blocks if wrapped in ```json ... ```
    let cleanJson = rawText;
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    try {
      const parsed = JSON.parse(cleanJson);
      if (parsed.revisedContent && typeof parsed.revisedContent === "string") {
        revisedContent = parsed.revisedContent.trim();
        if (parsed.explanation && typeof parsed.explanation === "string") {
          explanation = parsed.explanation.trim();
        }
      } else {
        // Fallback: If returned object doesn't have revisedContent
        revisedContent = rawText;
      }
    } catch {
      // If direct JSON parse fails, check if we can regex extract
      const explanationMatch = rawText.match(/"explanation"\s*:\s*"([^"]+)"/);
      if (explanationMatch) {
        explanation = explanationMatch[1];
      }

      // If text looks like pure markdown replacement
      if (rawText.length > 100 && !rawText.startsWith("{")) {
        revisedContent = rawText;
      } else {
        // Fallback
        revisedContent = rawText;
      }
    }

    return NextResponse.json({
      success: true,
      explanation,
      revisedContent,
      meta: {
        modelUsed: aiResult.usedModel,
        tokensEstimate: aiResult.tokensUsedEstimate,
        keyMasked: aiResult.usedKeyMasked,
      },
    });
  } catch (error: unknown) {
    console.error("Chat edit error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Terjadi kesalahan pada server",
      },
      { status: 500 }
    );
  }
}
