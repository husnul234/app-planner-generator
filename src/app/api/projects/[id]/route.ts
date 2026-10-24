import { NextResponse } from "next/server";
import { getProjectById, getProjectDocuments, updateProject, deleteProject } from "../../../../lib/neon/db";
import { deleteFolder } from "../../../../lib/neon/storage";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }
    const documents = await getProjectDocuments(id);
    return NextResponse.json({ success: true, project, documents });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateProject(id, body);
    return NextResponse.json({ success: true, project: updated });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 1. Delete from Neon Postgres
    await deleteProject(id);
    // 2. Delete all documents in Neon Object Storage
    try {
      await deleteFolder(`projects/${id}/`);
    } catch (storageErr) {
      console.warn("Storage cleanup warning:", storageErr);
    }
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
