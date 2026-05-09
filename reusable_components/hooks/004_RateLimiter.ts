// --- source: Code-Snippets-Gallery / rate-limit.ts ---
// In-memory sliding-window rate limiter with automatic GC cleanup.
// Fully generic — no domain-specific data. Ready to drop into any API route.

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const entries = new Map<string, RateLimitEntry>();

/**
 * Check if a request should be rate-limited.
 * Returns `true` if the request exceeds the limit.
 *
 * @param key         - Unique identifier (e.g. IP address, user ID, API key)
 * @param maxRequests - Maximum requests allowed within the window
 * @param windowMs    - Sliding window duration in milliseconds
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = entries.get(key);

  if (!entry || now >= entry.resetTime) {
    entries.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > maxRequests;
}

/**
 * Get remaining requests for a given key within the current window.
 *
 * @param key         - Unique identifier
 * @param maxRequests - Maximum requests allowed within the window
 * @param windowMs    - Sliding window duration in milliseconds
 * @returns Number of remaining requests (0 if already rate-limited)
 */
export function getRateLimitRemaining(
  key: string,
  maxRequests: number,
  windowMs: number,
): number {
  const now = Date.now();
  const entry = entries.get(key);

  if (!entry || now >= entry.resetTime) return maxRequests;
  return Math.max(0, maxRequests - entry.count);
}

/**
 * Get time until the rate limit resets for a given key.
 * Returns 0 if the key has no active rate limit.
 */
export function getRateLimitResetIn(
  key: string,
): number {
  const entry = entries.get(key);
  if (!entry) return 0;
  const remaining = entry.resetTime - Date.now();
  return Math.max(0, remaining);
}

/**
 * Reset the rate limit for a specific key.
 */
export function resetRateLimit(key: string): void {
  entries.delete(key);
}

// Periodic cleanup to prevent memory leaks (configurable interval)
if (typeof globalThis !== 'undefined') {
  const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of entries) {
      if (now >= entry.resetTime) entries.delete(key);
    }
  }, CLEANUP_INTERVAL);
}
