import { NextResponse } from "next/server";
import { BLUEPRINT_DOCUMENTS, ProjectMeta } from "../../../lib/generator/templates";
import { saveProject, saveProjectDocument } from "../../../lib/neon/db";
import { uploadObject } from "../../../lib/neon/storage";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const meta: ProjectMeta = {
      appName: body.appName || "AppPlanner SaaS",
      category: body.category || "Developer Tool & SaaS Architecture",
      tagline: body.tagline || "Solusi terstandarisasi perencanaan blueprint aplikasi lengkap.",
      problem: body.problem || "Inefisiensi alur kerja perencanaan arsitektur",
      targetAudience: body.targetAudience || "Software Engineers, Product Managers & Founders",
      coreFeatures: Array.isArray(body.coreFeatures) && body.coreFeatures.length > 0
        ? body.coreFeatures
        : [
            "Wizard Interaktif 7 Tahap",
            "Generator 11 Dokumen Blueprint",
            "Infrastruktur Neon Serverless",
            "Ekspor ZIP & Markdown Instan",
          ],
      techStack: Array.isArray(body.techStack) && body.techStack.length > 0
        ? body.techStack
        : ["Next.js 15", "Neon Postgres", "Neon Object Storage", "TailwindCSS"],
      dbType: body.dbType || "Neon PostgreSQL",
      selectedModel: body.selectedModel || "Google Gemini 2.0 Flash",
    };

    // Generate 11 documents
    const documents = BLUEPRINT_DOCUMENTS.map((doc) => {
      const content = doc.defaultContent(meta);
      return {
        filename: doc.filename,
        file_slug: doc.file_slug,
        title: doc.title,
        description: doc.description,
        content,
        wordCount: content.split(/\s+/).filter(Boolean).length,
      };
    });

    // Optionally save to Neon Postgres & Storage
    let savedProjectId: string | null = null;
    if (body.saveToDatabase !== false) {
      try {
        const slug = meta.appName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        const project = await saveProject({
          name: meta.appName,
          slug,
          raw_idea: meta.problem,
          tech_stack: meta.techStack,
          status: "ready",
        });

        savedProjectId = project.id;

        // Save each document
        for (const d of documents) {
          await saveProjectDocument({
            project_id: project.id,
            filename: d.filename,
            file_slug: d.file_slug,
            content: d.content,
            word_count: d.wordCount,
            status: "completed",
          });

          // Upload to Neon Object Storage
          try {
            await uploadObject(`projects/${project.id}/${d.filename}`, d.content, "text/markdown");
          } catch (storageErr) {
            console.warn("Storage upload warning:", storageErr);
          }
        }
      } catch (dbErr) {
        console.warn("Database save warning:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      projectId: savedProjectId,
      meta,
      documentsCount: documents.length,
      documents,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
