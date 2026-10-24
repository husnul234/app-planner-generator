import { NextResponse } from "next/server";
import {
  getProjectById,
  updateProjectDocumentContent,
  createCustomProjectDocument,
  deleteProjectDocument,
} from "../../../../../lib/neon/db";
import { uploadObject, deleteObject } from "../../../../../lib/neon/storage";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await req.json();
    const { docId, filename, content } = body;

    if (!docId || content === undefined) {
      return NextResponse.json(
        { success: false, error: "docId and content are required" },
        { status: 400 }
      );
    }

    // 1. Update Neon Postgres
    const updated = await updateProjectDocumentContent(docId, content);

    // 2. Sync to Neon Object Storage
    if (filename) {
      try {
        await uploadObject(`projects/${projectId}/${filename}`, content, "text/markdown");
      } catch (storageErr) {
        console.warn("Storage sync warning:", storageErr);
      }
    }

    return NextResponse.json({ success: true, document: updated });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await req.json();
    const { filename, content } = body;

    if (!filename || !content) {
      return NextResponse.json(
        { success: false, error: "filename and content are required" },
        { status: 400 }
      );
    }

    // 1. Create in Neon Postgres
    const created = await createCustomProjectDocument({
      project_id: projectId,
      filename,
      content,
    });

    // 2. Upload to Neon Object Storage
    try {
      await uploadObject(`projects/${projectId}/${filename}`, content, "text/markdown");
    } catch (storageErr) {
      console.warn("Storage sync warning:", storageErr);
    }

    return NextResponse.json({ success: true, document: created });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("docId");
    const filename = searchParams.get("filename");

    if (!docId) {
      return NextResponse.json({ success: false, error: "docId is required" }, { status: 400 });
    }

    await deleteProjectDocument(docId);

    if (filename) {
      try {
        await deleteObject(`projects/${projectId}/${filename}`);
      } catch (e) {
        console.warn("Storage delete warning:", e);
      }
    }

    return NextResponse.json({ success: true, deletedDocId: docId });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
