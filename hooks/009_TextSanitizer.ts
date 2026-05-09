/**
 * TextSanitizer — configurable text sanitization pipeline.
 * Strips emoji ranges and/or non-allowed Unicode characters.
 * Returns { text, removed } tuples for audit logging.
 *
 * Source: Wiki-Codex-v2 /src/lib/sanitize.ts
 * De-hardcoded:
 *   - Configurable allowed character ranges (not just Cyrillic)
 *   - Configurable emoji regex
 *   - Pipeline steps are composable (use only what you need)
 */

// Default emoji ranges: common emoticons, symbols, dingbats, supplemental
const DEFAULT_EMOJI_REGEX =
  /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FEFF}]|[\u{1F900}-\u{1F9FF}]|[\u{2702}-\u{27B0}]/gu

export interface SanitizeResult {
  text: string
  removed: number
}

export interface TextSanitizerOptions {
  /** Regex for characters to strip in the emoji pass (default: common emoji ranges) */
  emojiRegex?: RegExp
  /** Regex for characters to KEEP in the final pass. Use negated character class. */
  allowedRegex?: RegExp
  /** Label for console warnings (default: 'content') */
  label?: string
}

/**
 * Create a sanitizer with custom configuration.
 * Returns composable pipeline functions.
 */
export function createTextSanitizer(options: TextSanitizerOptions = {}) {
  const { emojiRegex = DEFAULT_EMOJI_REGEX, allowedRegex, label = 'content' } = options

  /** Strip emoji ranges from text */
  function stripEmojis(text: string): SanitizeResult {
    const before = text.length
    const clean = text.replace(emojiRegex, '')
    return { text: clean, removed: before - clean.length }
  }

  /** Keep only characters matching allowedRegex (negated class). Strips everything else. */
  function filterByCharset(text: string): SanitizeResult {
    if (!allowedRegex) return { text, removed: 0 }
    const before = text.length
    const clean = text.replace(allowedRegex, '')
    return { text: clean, removed: before - clean.length }
  }

  /** Full pipeline: strip emojis → filter by charset */
  function sanitize(text: string): SanitizeResult {
    const step1 = stripEmojis(text)
    const step2 = filterByCharset(step1.text)
    return { text: step2.text, removed: step1.removed + step2.removed }
  }

  /** Sanitize a field with console.warn on changes */
  function sanitizeField(text: string, fieldLabel?: string): string {
    const { text: clean, removed } = sanitize(text)
    if (removed > 0) {
      console.warn(`[sanitize] ${removed} character(s) stripped from "${fieldLabel ?? label}"`)
    }
    return clean
  }

  return { stripEmojis, filterByCharset, sanitize, sanitizeField }
}

// --- Preset configurations ---

/** ASCII-only sanitizer (printable ASCII + control chars) */
export const asciiSanitizer = createTextSanitizer({
  allowedRegex: /[^\x09\x0A\x0D\x20-\x7E]/g,
})

/** ASCII + Cyrillic sanitizer (for Russian text apps) */
export const cyrillicSanitizer = createTextSanitizer({
  allowedRegex: /[^\x09\x0A\x0D\x20-\x7E\u0400-\u04FF]/g,
})

/** Emoji-only stripper (keeps all text, removes only emoji) */
export const emojiStripper = createTextSanitizer()
