import { NextResponse } from "next/server";
import { getProfileByEmail, getProfileById, updateProfileCustomSettings } from "../../../../lib/neon/db";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json({ success: false, error: "userId or email is required" }, { status: 400 });
    }

    let profile = null;
    if (userId) {
      profile = await getProfileById(userId);
    } else if (email) {
      profile = await getProfileByEmail(email);
    }

    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      custom_settings: profile.custom_settings || {},
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, customSettings } = body;

    if (!userId && !email) {
      return NextResponse.json({ success: false, error: "userId or email is required" }, { status: 400 });
    }

    let targetId = userId;
    if (!targetId && email) {
      const p = await getProfileByEmail(email);
      if (p) targetId = p.id;
    }

    if (!targetId) {
      return NextResponse.json({ success: false, error: "Profile could not be resolved" }, { status: 404 });
    }

    const updated = await updateProfileCustomSettings(targetId, customSettings || {});

    return NextResponse.json({
      success: true,
      profile: updated,
      custom_settings: updated.custom_settings,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
