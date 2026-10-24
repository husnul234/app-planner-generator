export interface AuthHealthResult {
  status: "ok" | "error";
  baseUrl: string;
  jwksUrl: string;
  durationMs: number;
  keysCount?: number;
  error?: string;
}

export function getAuthConfig() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL || "";
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL || "";
  return { baseUrl, jwksUrl };
}

export async function getAuthJwks(): Promise<{ keys: unknown[] }> {
  const { jwksUrl } = getAuthConfig();
  if (!jwksUrl) {
    throw new Error("NEON_AUTH_JWKS_URL is not set");
  }

  const res = await fetch(jwksUrl, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch JWKS: HTTP ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

export async function checkAuthHealth(): Promise<AuthHealthResult> {
  const { baseUrl, jwksUrl } = getAuthConfig();
  const start = Date.now();

  try {
    if (!jwksUrl) {
      throw new Error("NEON_AUTH_JWKS_URL environment variable is missing");
    }

    const jwks = await getAuthJwks();
    const duration = Date.now() - start;

    return {
      status: "ok",
      baseUrl,
      jwksUrl,
      durationMs: duration,
      keysCount: Array.isArray(jwks.keys) ? jwks.keys.length : 0,
    };
  } catch (error: unknown) {
    const duration = Date.now() - start;
    const err = error as Error;
    return {
      status: "error",
      baseUrl,
      jwksUrl,
      durationMs: duration,
      error: err.message,
    };
  }
}
