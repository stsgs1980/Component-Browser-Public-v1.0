// --- source: Code-Snippets-Gallery / api-auth.ts ---
// Constant-time API key validator for mutation endpoints.
// Uses XOR-based comparison to prevent timing attacks.
// Fully generic — accepts the key at construction, no domain coupling.

/**
 * Create an API key validator with constant-time comparison.
 *
 * @param apiKey - The expected API key. Pass empty string for open mode (dev).
 * @returns Validator function that checks a Request object.
 *
 * @example
 * ```ts
 * const requireAuth = createApiKeyValidator(process.env.ADMIN_API_KEY || '');
 *
 * // In a Next.js route handler:
 * if (!requireAuth(request)) {
 *   return new Response('Unauthorized', { status: 401 });
 * }
 * ```
 */
export function createApiKeyValidator(apiKey: string) {
  /**
   * Validate API key from a Request.
   * Checks `Authorization: Bearer <key>` header and `?api_key=` query param.
   * Uses constant-time comparison to prevent timing attacks.
   */
  return function validateApiKey(request: Request): boolean {
    // No key configured = development mode, allow all
    if (!apiKey) return true;

    const authHeader = request.headers.get('authorization');
    const queryKey = new URL(request.url).searchParams.get('api_key');

    const providedKey =
      (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null) || queryKey;

    // Length check is safe — just short-circuits early on obviously wrong inputs
    if (!providedKey || providedKey.length !== apiKey.length) return false;

    // Constant-time comparison: XOR all bytes, check if result is all zeros
    let result = 0;
    for (let i = 0; i < providedKey.length; i++) {
      result |= providedKey.charCodeAt(i) ^ apiKey.charCodeAt(i);
    }
    return result === 0;
  };
}

/**
 * Convenience: validate a raw key string with constant-time comparison.
 * Useful outside of a Request context (e.g. middleware, WebSocket auth).
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
