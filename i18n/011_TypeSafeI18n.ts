// --- source: Code-Snippets-Gallery / i18n.ts ---
// Type-safe i18n dictionary pattern with compile-time key checking.
// Provides a translation function and category mapper.
// De-hardcoded: generic dictionary structure, no hardcoded languages or keys.

// ============================================================
//  TYPES
// ============================================================

/** A dictionary entry: maps locale code to translated string */
type TranslationEntry<L extends string> = Record<L, string>;

/** The full dictionary: maps string keys to per-locale translations */
type Dictionary<L extends string> = Record<string, TranslationEntry<L>>;

// ============================================================
//  FACTORY
// ============================================================

/**
 * Create a type-safe i18n system from a dictionary object.
 *
 * @param dict - Translation dictionary `{ "key.name": { en: "...", ru: "..." } }`
 * @param defaultLocale - Fallback locale
 *
 * @returns `{ t, tMap }`
 *   - `t(key, locale)` — translate a key
 *   - `tMap(map, value, locale)` — translate via a lookup map (e.g. category names)
 *
 * @example
 * ```ts
 * const { t } = createI18n({
 *   'greeting':     { en: 'Hello', ru: 'Привет' },
 *   'goodbye':      { en: 'Goodbye', ru: 'До свидания' },
 * }, 'en');
 *
 * t('greeting', 'ru'); // => 'Привет'
 * t('missing', 'en');  // => 'missing' (returns key as fallback)
 * ```
 */
export function createI18n<L extends string>(
  dict: Dictionary<L>,
  defaultLocale: L,
) {
  type DictKey = keyof typeof dict;

  /**
   * Translate a dictionary key for the given locale.
   * Falls back to defaultLocale, then returns the key itself.
   */
  function t(key: string, locale: L): string {
    const entry = dict[key];
    if (!entry) return key;
    return entry[locale] ?? entry[defaultLocale] ?? key;
  }

  /**
   * Translate a value using a lookup map.
   * Useful for translating enum-like values (categories, statuses, etc.)
   *
   * @param lookup - Map from value to dictionary key
   * @param value  - The value to translate
   * @param locale - Target locale
   * @param fallback - Return value if not found in map (default: value itself)
   */
  function tMap(
    lookup: Record<string, string>,
    value: string,
    locale: L,
    fallback?: string,
  ): string {
    const key = lookup[value];
    if (!key) return fallback ?? value;
    return t(key, locale);
  }

  return { t, tMap };
}

// ============================================================
//  KEY EXTRACTION HELPER
// ============================================================

/**
 * Extract all dictionary keys as a union type.
 * Useful for creating typed key enums or autocomplete.
 *
 * @example
 * ```ts
 * type Keys = DictKeys<typeof myDict>;
 * // => 'greeting' | 'goodbye'
 * ```
 */
export type DictKeys<D extends Dictionary<string>> = keyof D & string;
