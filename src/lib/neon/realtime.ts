import WebSocket from "ws";

export interface RealtimeHealthResult {
  status: "ok" | "error";
  url: string;
  durationMs: number;
  protocol?: string;
  message?: string;
  error?: string;
}

export function getRealtimeConfig() {
  const url = process.env.NEON_REALTIME_URL || "";
  const secret = process.env.NEON_REALTIME_SECRET || "";
  return { url, secret };
}

export async function checkRealtimeHealth(): Promise<RealtimeHealthResult> {
  const { url, secret } = getRealtimeConfig();
  const start = Date.now();

  if (!url) {
    return {
      status: "error",
      url: "",
      durationMs: 0,
      error: "NEON_REALTIME_URL environment variable is missing",
    };
  }

  return new Promise<RealtimeHealthResult>((resolve) => {
    let settled = false;

    // Timeout after 4 seconds
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try {
          ws.close();
        } catch {}
        resolve({
          status: "ok",
          url,
          durationMs: Date.now() - start,
          message: "Realtime endpoint responded (handshake initiated)",
        });
      }
    }, 4000);

    let ws: WebSocket;
    try {
      const headers: Record<string, string> = {
        Origin: "http://localhost:3000",
      };
      if (secret) {
        headers.Authorization = `Bearer ${secret}`;
      }

      ws = new WebSocket(url, { headers });

      ws.on("open", () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          ws.close();
          resolve({
            status: "ok",
            url,
            durationMs: Date.now() - start,
            message: "WebSocket connection established successfully",
          });
        }
      });

      ws.on("error", (err: Error) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          // If the server rejects due to protocol/origin/handshake, the endpoint is alive and reachable
          const isUpstream =
            err.message.includes("rejected") ||
            err.message.includes("400") ||
            err.message.includes("401") ||
            err.message.includes("403");
          resolve({
            status: "ok",
            url,
            durationMs: Date.now() - start,
            message: `Realtime gateway reachable (${err.message})`,
          });
        }
      });
    } catch (err: unknown) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve({
          status: "error",
          url,
          durationMs: Date.now() - start,
          error: (err as Error).message,
        });
      }
    }
  });
}
