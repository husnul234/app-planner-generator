import { NextResponse } from "next/server";
import { listProjects, saveProject, saveProjectDocument } from "../../../lib/neon/db";
import { uploadObject } from "../../../lib/neon/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await listProjects(30);
    return NextResponse.json({ success: true, projects });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, raw_idea, tech_stack, documents } = body;

    if (!name || !raw_idea) {
      return NextResponse.json(
        { success: false, error: "name and raw_idea are required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // 1. Save project in Neon Postgres
    const project = await saveProject({
      name,
      slug,
      raw_idea,
      tech_stack: Array.isArray(tech_stack) ? tech_stack : [],
      status: "ready",
    });

    // 2. Save documents in Neon Postgres & backup to Neon Object Storage
    const savedDocs = [];
    if (Array.isArray(documents)) {
      for (const doc of documents) {
        const saved = await saveProjectDocument({
          project_id: project.id,
          filename: doc.filename,
          file_slug: doc.file_slug || doc.filename.replace(/\.md$/, "").toLowerCase(),
          content: doc.content || "",
          word_count: (doc.content || "").split(/\s+/).filter(Boolean).length,
          status: "completed",
        });
        savedDocs.push(saved);

        // Upload to Neon Object Storage (assets/projects/{id}/{filename})
        try {
          const storageKey = `projects/${project.id}/${doc.filename}`;
          await uploadObject(storageKey, doc.content || "", "text/markdown");
        } catch (storageErr) {
          console.warn("Storage upload warning:", storageErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      project,
      documentsCount: savedDocs.length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
