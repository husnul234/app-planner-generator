import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "../../../../lib/neon/db";
import { checkAuthHealth } from "../../../../lib/neon/auth";
import { checkStorageHealth } from "../../../../lib/neon/storage";
import { checkFunctionHealth } from "../../../../lib/neon/functions";
import { checkRealtimeHealth } from "../../../../lib/neon/realtime";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  const timestamp = new Date().toISOString();

  const [dbResult, authResult, storageResult, functionResult, realtimeResult] =
    await Promise.allSettled([
      checkDatabaseHealth(),
      checkAuthHealth(),
      checkStorageHealth(),
      checkFunctionHealth(),
      checkRealtimeHealth(),
    ]);

  const services = {
    postgres:
      dbResult.status === "fulfilled"
        ? dbResult.value
        : { status: "error", error: String(dbResult.reason) },
    auth:
      authResult.status === "fulfilled"
        ? authResult.value
        : { status: "error", error: String(authResult.reason) },
    storage:
      storageResult.status === "fulfilled"
        ? storageResult.value
        : { status: "error", error: String(storageResult.reason) },
    functions:
      functionResult.status === "fulfilled"
        ? functionResult.value
        : { status: "error", error: String(functionResult.reason) },
    realtime:
      realtimeResult.status === "fulfilled"
        ? realtimeResult.value
        : { status: "error", error: String(realtimeResult.reason) },
  };

  const isHealthy = Object.values(services).every((s) => s.status === "ok");

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp,
      branch: process.env.NEON_BRANCH || "production",
      services,
    },
    { status: isHealthy ? 200 : 207 }
  );
}
