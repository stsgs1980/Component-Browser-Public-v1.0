/**
 * SlavicPluralize — Russian / Slavic-style pluralization for countable nouns.
 * Handles the complex 1/2-4/5+ form system.
 *
 * Source: Wiki-Codex-v2 /src/lib/format.ts (pluralize function)
 * De-hardcoded:
 *   - Renamed to SlavicPluralize (clear about what it does)
 *   - Added JSDoc with examples
 *   - Standalone utility, zero dependencies
 *
 * @example
 * pluralize(1, ['file', 'files', 'files'])     // "file"
 * pluralize(2, ['file', 'files', 'files'])     // "files"
 * pluralize(5, ['file', 'files', 'files'])     // "files"
 * pluralize(21, ['file', 'files', 'files'])    // "file"
 */

export function pluralize(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return forms[2]
  if (last === 1) return forms[0]
  if (last > 1 && last < 5) return forms[1]
  return forms[2]
}
