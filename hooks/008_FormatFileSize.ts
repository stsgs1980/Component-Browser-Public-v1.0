/**
 * FormatFileSize — converts bytes to human-readable string with SI suffixes.
 *
 * Source: Wiki-Codex-v2 /src/lib/format.ts (formatFileSize function)
 * De-hardcoded:
 *   - Locale-configurable unit labels (default: English 'B', 'KB', 'MB'...)
 *   - Configurable base (default: 1024 for binary, use 1000 for SI decimal)
 *   - Configurable decimal places (default: 1)
 */

export interface FormatFileSizeOptions {
  /** Unit labels for [B, K, M, G, T, P, E] */
  units?: string[]
  /** Base divisor: 1024 for binary (KiB), 1000 for SI decimal (kB) (default: 1024) */
  base?: number
  /** Decimal places (default: 1) */
  decimals?: number
  /** Zero-value label (default: '0 B') */
  zeroLabel?: string
}

const DEFAULT_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB']

export function formatFileSize(bytes: number, options: FormatFileSizeOptions = {}): string {
  const {
    units = DEFAULT_UNITS,
    base = 1024,
    decimals = 1,
    zeroLabel,
  } = options

  if (bytes === 0) return zeroLabel ?? `0 ${units[0]}`

  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1,
  )

  const value = parseFloat((bytes / Math.pow(base, i)).toFixed(decimals))
  return `${value} ${units[i]}`
}
