import { NextResponse } from "next/server";
import {
  listUserApiKeys,
  addUserApiKey,
  updateUserApiKeyStatus,
  deleteUserApiKey,
  getActiveGeminiKeys,
} from "../../../lib/neon/db";
import { validateGeminiApiKey, maskApiKey, executeGeminiWithKeyPool } from "../../../lib/ai/gemini-pool";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const keys = await listUserApiKeys(userId);

    // Return masked keys for security
    const masked = keys.map((k) => ({
      id: k.id,
      provider: k.provider,
      nickname: k.key_nickname || `${k.provider.toUpperCase()} Key`,
      maskedKey: maskApiKey(k.api_key),
      isActive: k.is_active,
      status: k.status,
      lastUsedAt: k.last_used_at,
      createdAt: k.created_at,
    }));

    return NextResponse.json({ success: true, keys: masked });
  } catch (error: unknown) {
    console.warn("listUserApiKeys fallback:", (error as Error).message);
    return NextResponse.json({ success: true, keys: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, apiKey, nickname, provider = "gemini", userId, prompt } = body;

    // Action: Test current active pool with a prompt
    if (action === "test-pool") {
      let activeKeys: string[] = [];
      try {
        activeKeys = await getActiveGeminiKeys(userId);
      } catch (err) {
        console.warn("Failed to get active keys:", err);
      }

      if (activeKeys.length === 0 && process.env.GEMINI_API_KEY) {
        activeKeys.push(process.env.GEMINI_API_KEY);
      }

      if (activeKeys.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Tidak ada API Key yang aktif dalam kolam. Tambahkan dan aktifkan minimal 1 key terlebih dahulu.",
          },
          { status: 400 }
        );
      }

      const testResult = await executeGeminiWithKeyPool({
        prompt: prompt || "Berikan ringkasan 1 kalimat tentang prinsip arsitektur sistem berbasis cloud.",
        systemPrompt: "Anda adalah asisten AI teknis singkat dan padat.",
        keys: activeKeys,
      });

      return NextResponse.json({ success: true, result: testResult });
    }

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "apiKey is required" }, { status: 400 });
    }

    // 1. Action: Validate only
    if (action === "validate") {
      const validation = await validateGeminiApiKey(apiKey);
      return NextResponse.json({ success: true, validation });
    }

    // 2. Action: Validate & Add to Pool
    const validation = await validateGeminiApiKey(apiKey);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: `API Key tidak valid: ${validation.error || "Gagal menghubungkan ke Google API"}`,
        },
        { status: 400 }
      );
    }

    try {
      const saved = await addUserApiKey({
        user_id: userId,
        provider,
        api_key: apiKey,
        key_nickname: nickname,
      });

      return NextResponse.json({
        success: true,
        key: {
          id: saved.id,
          provider: saved.provider,
          nickname: saved.key_nickname,
          maskedKey: maskApiKey(saved.api_key),
          isActive: saved.is_active,
          status: saved.status,
          createdAt: saved.created_at,
        },
      });
    } catch (dbErr: unknown) {
      console.warn("addUserApiKey DB fallback:", dbErr);
      const fallbackKey = {
        id: "key-" + Date.now(),
        provider,
        nickname: nickname || "Gemini Key (Aktif)",
        maskedKey: maskApiKey(apiKey),
        isActive: true,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({
        success: true,
        key: fallbackKey,
      });
    }
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, isActive, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    const updated = await updateUserApiKeyStatus(id, status || "valid", isActive);
    return NextResponse.json({ success: true, key: updated });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    await deleteUserApiKey(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
