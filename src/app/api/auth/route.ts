import { NextResponse } from "next/server";
import { getProfileByEmail, getProfileById, createOrUpdateProfile } from "../../../lib/neon/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const id = searchParams.get("id");

    if (id) {
      const profile = await getProfileById(id);
      return NextResponse.json({ success: true, profile });
    }

    if (email) {
      const profile = await getProfileByEmail(email);
      return NextResponse.json({ success: true, profile });
    }

    return NextResponse.json({ success: false, error: "email or id parameter required" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, fullName, role } = body;

    // Quick login for development / demonstration
    if (action === "quick-login") {
      const targetEmail = role === "admin" ? "admin@appplanner.ai" : "user@appplanner.ai";
      let profile = await getProfileByEmail(targetEmail);

      if (!profile) {
        profile = await createOrUpdateProfile({
          email: targetEmail,
          full_name: role === "admin" ? "Super Admin" : "Indie Vibecoder",
          role: role === "admin" ? "admin" : "user",
          credits_remaining: role === "admin" ? 50000 : 10000,
        });
      }

      return NextResponse.json({ success: true, profile });
    }

    // Standard Login
    if (action === "login") {
      if (!email || !email.trim()) {
        return NextResponse.json({ success: false, error: "Email wajib diisi" }, { status: 400 });
      }

      const profile = await getProfileByEmail(email.trim());
      if (!profile) {
        return NextResponse.json(
          {
            success: false,
            error: "Akun dengan email ini belum terdaftar. Silakan registrasi terlebih dahulu.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, profile });
    }

    // Standard Register
    if (action === "register") {
      if (!email || !email.trim()) {
        return NextResponse.json({ success: false, error: "Email wajib diisi" }, { status: 400 });
      }

      const existing = await getProfileByEmail(email.trim());
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Email sudah terdaftar. Silakan gunakan menu Masuk." },
          { status: 400 }
        );
      }

      const profile = await createOrUpdateProfile({
        email: email.trim(),
        full_name: fullName?.trim() || email.split("@")[0],
        role: role === "admin" ? "admin" : "user",
        credits_remaining: role === "admin" ? 50000 : 10000,
      });

      return NextResponse.json({ success: true, profile });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
