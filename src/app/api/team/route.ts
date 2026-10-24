import { NextResponse } from "next/server";
import {
  listProfiles,
  createOrUpdateProfile,
  updateProfileRole,
  deleteProfile,
  listInvitations,
  createInvitation,
  deleteInvitation,
} from "../../../lib/neon/db";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  try {
    const [profiles, invitations] = await Promise.all([
      listProfiles(),
      listInvitations(),
    ]);
    return NextResponse.json({ success: true, profiles, invitations });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, role, full_name, credits_remaining } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "email is required" }, { status: 400 });
    }

    if (action === "invite") {
      const invitation = await createInvitation(email, role || "user");
      return NextResponse.json({ success: true, invitation });
    }

    // Default: Add or update team member directly
    const profile = await createOrUpdateProfile({
      email,
      role: role || "user",
      full_name,
      credits_remaining: credits_remaining ?? 20,
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, role, credits_remaining } = body;

    if (!id || !role) {
      return NextResponse.json({ success: false, error: "id and role are required" }, { status: 400 });
    }

    const updated = await updateProfileRole(id, role);
    return NextResponse.json({ success: true, profile: updated });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "profile" or "invitation"
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    if (type === "invitation") {
      await deleteInvitation(id);
      return NextResponse.json({ success: true, deletedInvitationId: id });
    }

    await deleteProfile(id);
    return NextResponse.json({ success: true, deletedProfileId: id });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
