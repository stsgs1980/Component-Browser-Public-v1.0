"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Generic hydration-safe persisted state backed by localStorage.
 *
 * Both server & client start with `initialValue` so there is no
 * hydration mismatch. On mount the hook reads from localStorage and
 * updates the state in a requestAnimationFrame to avoid layout thrash.
 *
 * Includes runtime validation of parsed localStorage data via the
 * provided `parse` function.
 */
export function usePersisted<T>(
  key: string,
  initialValue: T,
  parse: (raw: string) => T,
  serialize: (val: T) => string
): [T, (next: T) => void] {
  const [value, setValue] = useState(initialValue);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        requestAnimationFrame(() => {
          setValue(parse(saved));
        });
      }
    } catch {
      /* ignore */
    }
  }, [key, parse]);

  const setAndPersist = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, serialize(next));
      } catch {
        /* ignore */
      }
    },
    [key, serialize]
  );

  return [value, setAndPersist];
}
