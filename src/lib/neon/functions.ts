export interface FunctionHealthResult {
  status: "ok" | "error";
  baseUrl: string;
  durationMs: number;
  output?: string;
  error?: string;
}

export function getFunctionsBaseUrl(): string {
  return process.env.NEON_FUNCTION_HELLO_BASE_URL || "";
}

export async function invokeHelloFunction(): Promise<{
  status: number;
  data: string;
}> {
  const baseUrl = getFunctionsBaseUrl();
  if (!baseUrl) {
    throw new Error("NEON_FUNCTION_HELLO_BASE_URL is not configured in environment");
  }

  // Ensure trailing slash or endpoint path
  const url = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      "User-Agent": "AppPlanner/1.0",
    },
  });

  const text = await response.text();
  return {
    status: response.status,
    data: text.trim(),
  };
}

export async function checkFunctionHealth(): Promise<FunctionHealthResult> {
  const baseUrl = getFunctionsBaseUrl();
  const start = Date.now();

  try {
    if (!baseUrl) {
      throw new Error("NEON_FUNCTION_HELLO_BASE_URL is not set");
    }

    const result = await invokeHelloFunction();
    const duration = Date.now() - start;

    return {
      status: result.status >= 200 && result.status < 400 ? "ok" : "error",
      baseUrl,
      durationMs: duration,
      output: result.data,
    };
  } catch (error: unknown) {
    const duration = Date.now() - start;
    const err = error as Error;
    return {
      status: "error",
      baseUrl,
      durationMs: duration,
      error: err.message,
    };
  }
}
