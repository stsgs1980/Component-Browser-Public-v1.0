/**
 * Safe parsers / serializers for localStorage-backed state.
 *
 * Each parser validates the shape of the stored JSON at runtime so
 * corrupted data never reaches application state.
 */

export const parseNumberSet = (raw: string): Set<number> => {
  try {
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every((v) => typeof v === "number" && isFinite(v))
    ) {
      return new Set(parsed as number[]);
    }
  } catch {
    /* ignore */
  }
  return new Set<number>();
};

export const serializeNumberSet = (val: Set<number>) =>
  JSON.stringify(Array.from(val));

export const parseStringSet = (raw: string): Set<string> => {
  try {
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every((v) => typeof v === "string")
    ) {
      return new Set(parsed as string[]);
    }
  } catch {
    /* ignore */
  }
  return new Set<string>();
};

export const serializeStringSet = (val: Set<string>) =>
  JSON.stringify(Array.from(val));

export const parseString = (raw: string): string =>
  typeof raw === "string" ? raw : "";
