/**
 * @file 005_BrutalistWidgets.tsx
 * @description A collection of reusable Brutalist UI React components.
 *
 * ## Design Rules (Brutalist Aesthetic)
 * - **No border-radius** — all corners are sharp (`border-radius: 0`).
 * - **No shadows** — flat, raw surfaces only (`box-shadow: none`).
 * - **Monospace font** — `'Courier New', Courier, monospace` throughout.
 * - **Black borders** — 2–4 px solid `#000` outlines on every interactive element.
 * - **High contrast** — black backgrounds with white text or white backgrounds with black text.
 *
 * ## CSS Animation Requirement
 * The `MarqueeTicker` component relies on a `@keyframes brutalist-marquee` animation.
 * If your project does **not** inject the inline `<style>` block that this component
 * renders automatically, you must add the following to your global stylesheet:
 *
 * ```css
 * @keyframes brutalist-marquee {
 *   0%   { transform: translateX(0); }
 *   100% { transform: translateX(-50%); }
 * }
 * ```
 *
 * The component injects this keyframe via a `<style>` tag on first mount, so
 * no external CSS is required for out-of-the-box usage.
 *
 * @module BrutalistWidgets
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const BASE_FONT = `'Courier New', Courier, monospace`;

/**
 * Convenience: merge local classNames.
 * Filters out falsy values.
 */
function cx(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// 1. BrutalistTabs
// ---------------------------------------------------------------------------

/**
 * Shape of a single tab descriptor.
 */
interface BrutalistTabItem {
  /** Unique key identifying the tab */
  key: string;
  /** Display label */
  label: string;
}

/**
 * Props for {@link BrutalistTabs}.
 */
interface BrutalistTabsProps {
  /** Array of tab definitions */
  tabs: BrutalistTabItem[];
  /** Key of the initially active tab (defaults to first tab) */
  defaultTab?: string;
  /** Additional class names for the outer wrapper */
  className?: string;
  /** Additional class names for the content panel */
  contentClassName?: string;
  /** Render prop receiving the active tab key */
  children?: (activeTab: string) => React.ReactNode;
}

/**
 * Tab system with black/white inversion — active tab inverts its colour scheme
 * while inactive tabs remain on the opposite background.
 *
 * @example
 * ```tsx
 * <BrutalistTabs
 *   tabs={[{ key: 'a', label: 'Alpha' }, { key: 'b', label: 'Beta' }]}
 *   defaultTab="a"
 * >
 *   {(active) => <p>Active tab: {active}</p>}
 * </BrutalistTabs>
 * ```
 */
export function BrutalistTabs({
  tabs,
  defaultTab,
  className,
  contentClassName,
  children,
}: BrutalistTabsProps): React.ReactElement {
  const [active, setActive] = useState<string>(
    () => defaultTab ?? tabs[0]?.key ?? ""
  );

  return (
    <div
      className={cx("brutalist-tabs", className)}
      style={{
        fontFamily: BASE_FONT,
        border: "2px solid #000",
        background: "#fff",
      }}
    >
      {/* Tab bar */}
      <div
        className="brutalist-tabs__bar"
        style={{
          display: "flex",
          borderBottom: "2px solid #000",
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              style={{
                fontFamily: BASE_FONT,
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "uppercase" as const,
                padding: "10px 20px",
                border: "none",
                borderRight:
                  tab !== tabs[tabs.length - 1] ? "2px solid #000" : "none",
                borderRadius: 0,
                outline: "none",
                boxShadow: "none",
                cursor: "pointer",
                background: isActive ? "#000" : "#fff",
                color: isActive ? "#fff" : "#000",
                letterSpacing: "1px",
                transition: "background 0.1s, color 0.1s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <div
        className={cx("brutalist-tabs__content", contentClassName)}
        style={{
          padding: "20px",
          fontFamily: BASE_FONT,
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#000",
          background: "#fff",
        }}
      >
        {children?.(active)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. MarqueeTicker
// ---------------------------------------------------------------------------

/** Keyframe CSS injected once at module level. */
const MARQUEE_KEYFRAME_CSS = `
@keyframes brutalist-marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
`;

/**
 * Props for {@link MarqueeTicker}.
 */
interface MarqueeTickerProps {
  /** The text to scroll */
  text: string;
  /** Duration in seconds for one full scroll cycle (default 10) */
  speed?: number;
  /** Background colour (default `#000`) */
  bgColor?: string;
  /** Text colour (default `#fff`) */
  textColor?: string;
  /** Additional class names for the outer wrapper */
  className?: string;
}

/**
 * Animated marquee ticker using CSS `@keyframes brutalist-marquee`.
 *
 * The text is duplicated to create a seamless infinite loop. The keyframe
 * translates the inner track `-50%` so the duplicate fills the gap.
 *
 * @example
 * ```tsx
 * <MarqueeTicker text="BREAKING NEWS — " speed={8} />
 * ```
 */
export function MarqueeTicker({
  text,
  speed = 10,
  bgColor = "#000",
  textColor = "#fff",
  className,
}: MarqueeTickerProps): React.ReactElement {
  // Inject the keyframe stylesheet once.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "brutalist-marquee-keyframe-style";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = MARQUEE_KEYFRAME_CSS;
    document.head.appendChild(style);
  }, []);

  const doubled = `${text}\u00a0\u00a0\u2022\u00a0\u00a0${text}`;

  return (
    <div
      className={cx("brutalist-marquee", className)}
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap" as const,
        background: bgColor,
        border: "2px solid #000",
        fontFamily: BASE_FONT,
        fontSize: "16px",
        fontWeight: 700,
        textTransform: "uppercase" as const,
        letterSpacing: "2px",
        lineHeight: "1.8",
      }}
      aria-live="off"
      role="marquee"
    >
      <div
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          animation: `brutalist-marquee ${speed}s linear infinite`,
          color: textColor,
          paddingLeft: "100%",
        }}
      >
        {doubled}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. BrutalistGuestbook
// ---------------------------------------------------------------------------

/**
 * Props for {@link BrutalistGuestbook}.
 */
interface BrutalistGuestbookProps {
  /** Heading shown above the list (default `"Guestbook"`) */
  title?: string;
  /** Seed entries to pre-populate the list */
  initialEntries?: string[];
  /** Placeholder text for the input field (default `"Leave a message…"`) */
  placeholder?: string;
  /** Label for the submit button (default `"Submit"`) */
  submitLabel?: string;
  /** Additional class names for the outer wrapper */
  className?: string;
}

/**
 * Guestbook form with input validation and deduplication.
 *
 * - Empty / whitespace-only submissions are rejected.
 * - Duplicate entries (case-insensitive, trimmed) are rejected.
 * - Entries are numbered sequentially.
 *
 * @example
 * ```tsx
 * <BrutalistGuestbook
 *   title="Visitor Log"
 *   initialEntries={["Hello world"]}
 *   submitLabel="Sign"
 * />
 * ```
 */
export function BrutalistGuestbook({
  title = "Guestbook",
  initialEntries = [],
  placeholder = "Leave a message\u2026",
  submitLabel = "Submit",
  className,
}: BrutalistGuestbookProps): React.ReactElement {
  const [entries, setEntries] = useState<string[]>(initialEntries);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const trimmed = input.trim();

      if (!trimmed) {
        setError("Entry cannot be empty.");
        return;
      }

      if (entries.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
        setError("This entry already exists.");
        return;
      }

      setEntries((prev) => [...prev, trimmed]);
      setInput("");
      inputRef.current?.focus();
    },
    [input, entries]
  );

  return (
    <div
      className={cx("brutalist-guestbook", className)}
      style={{
        fontFamily: BASE_FONT,
        border: "3px solid #000",
        background: "#fff",
        padding: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#000",
          color: "#fff",
          padding: "14px 20px",
          fontSize: "16px",
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "2px",
        }}
      >
        {title}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          borderTop: "3px solid #000",
          borderBottom: "3px solid #000",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          style={{
            flex: 1,
            fontFamily: BASE_FONT,
            fontSize: "14px",
            padding: "12px 16px",
            border: "none",
            outline: "none",
            borderRadius: 0,
            boxShadow: "none",
            background: "#fff",
            color: "#000",
          }}
        />
        <button
          type="submit"
          style={{
            fontFamily: BASE_FONT,
            fontSize: "14px",
            fontWeight: 700,
            textTransform: "uppercase" as const,
            padding: "12px 24px",
            border: "none",
            borderLeft: "3px solid #000",
            borderRadius: 0,
            outline: "none",
            boxShadow: "none",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
            letterSpacing: "1px",
          }}
        >
          {submitLabel}
        </button>
      </form>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          style={{
            background: "#fff",
            color: "#000",
            padding: "8px 20px",
            fontSize: "13px",
            fontWeight: 700,
            borderTop: "2px solid #000",
            borderBottom: "2px solid #000",
            letterSpacing: "1px",
          }}
        >
          &#9888; {error}
        </div>
      )}

      {/* Entry list */}
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          maxHeight: "260px",
          overflowY: "auto",
        }}
      >
        {entries.map((entry, index) => (
          <li
            key={`${entry}-${index}`}
            style={{
              display: "flex",
              alignItems: "baseline",
              padding: "10px 20px",
              borderTop: "2px solid #000",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                marginRight: "12px",
                minWidth: "28px",
                color: "#000",
              }}
            >
              {String(index + 1).padStart(2, "0")}.
            </span>
            <span style={{ color: "#000" }}>{entry}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. BrutalistAccordion
// ---------------------------------------------------------------------------

/**
 * Shape of a single accordion item.
 */
interface BrutalistAccordionItem {
  /** Unique identifier */
  id: string;
  /** Summary / title */
  title: string;
  /** Expanded body text */
  description: string;
  /** Optional number displayed as a large prefix */
  number?: string;
  /** Background colour for the optional tag badge */
  tagColor?: string;
  /** Text for the optional tag badge */
  tagLabel?: string;
}

/**
 * Props for {@link BrutalistAccordion}.
 */
interface BrutalistAccordionProps {
  /** Array of expandable items */
  items: BrutalistAccordionItem[];
  /** Additional class names for the outer wrapper */
  className?: string;
}

/**
 * Expandable accordion rows in a brutalist style.
 *
 * Only one item can be expanded at a time. Each row features a
 * large number prefix and an optional coloured tag badge.
 *
 * @example
 * ```tsx
 * <BrutalistAccordion
 *   items={[
 *     { id: "1", title: "Section One", description: "Details here.", number: "01" },
 *     { id: "2", title: "Section Two", description: "More details.", number: "02", tagColor: "#ff0", tagLabel: "New" },
 *   ]}
 * />
 * ```
 */
export function BrutalistAccordion({
  items,
  className,
}: BrutalistAccordionProps): React.ReactElement {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = useCallback(
    (id: string) =>
      setExpandedId((prev) => (prev === id ? null : id)),
    []
  );

  return (
    <div
      className={cx("brutalist-accordion", className)}
      style={{
        fontFamily: BASE_FONT,
        border: "3px solid #000",
        background: "#fff",
      }}
    >
      {items.map((item, idx) => {
        const isOpen = expandedId === item.id;
        const isLast = idx === items.length - 1;

        return (
          <div key={item.id}>
            {/* Header row */}
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                padding: "16px 20px",
                border: "none",
                borderBottom: isOpen ? "none" : "2px solid #000",
                borderLeft: isLast && !isOpen ? "none" : "none",
                borderRadius: 0,
                outline: "none",
                boxShadow: "none",
                background: isOpen ? "#000" : "#fff",
                color: isOpen ? "#fff" : "#000",
                cursor: "pointer",
                textAlign: "left" as const,
                fontFamily: BASE_FONT,
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "1px",
                gap: "14px",
              }}
            >
              {item.number && (
                <span
                  style={{
                    fontSize: "28px",
                    lineHeight: 1,
                    fontWeight: 900,
                    opacity: 0.85,
                    flexShrink: 0,
                  }}
                >
                  {item.number}
                </span>
              )}
              <span style={{ flex: 1 }}>{item.title}</span>
              {item.tagLabel && (
                <span
                  style={{
                    fontSize: "11px",
                    padding: "3px 8px",
                    border: "2px solid",
                    borderColor: isOpen ? "#fff" : "#000",
                    background: item.tagColor ?? "#ff0",
                    color: "#000",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    flexShrink: 0,
                  }}
                >
                  {item.tagLabel}
                </span>
              )}
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 900,
                  transition: "transform 0.2s",
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                  flexShrink: 0,
                }}
              >
                +
              </span>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div
                style={{
                  padding: "20px",
                  background: "#fff",
                  borderTop: "2px solid #000",
                  borderBottom: "2px solid #000",
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: "#000",
                }}
              >
                {item.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. BrutalistNestedAccordion
// ---------------------------------------------------------------------------

/**
 * Shape of a child item inside a nested accordion.
 */
interface BrutalistNestedItem {
  /** Unique identifier */
  id: string;
  /** Summary title */
  title: string;
  /** Expanded description */
  description: string;
}

/**
 * Props for {@link BrutalistNestedAccordion}.
 */
interface BrutalistNestedAccordionProps {
  /** Top-level sections, each containing nested items */
  sections: {
    /** Section id */
    id: string;
    /** Section title */
    title: string;
    /** Items within this section */
    items: BrutalistNestedItem[];
  }[];
  /** Additional class names for the outer wrapper */
  className?: string;
}

/**
 * Two-level nested accordion (sections → items).
 *
 * Expanding a section reveals its children; expanding a child reveals its
 * description. Multiple sections can be open simultaneously, but within a
 * section only one child is expanded at a time.
 *
 * @example
 * ```tsx
 * <BrutalistNestedAccordion
 *   sections={[
 *     {
 *       id: "cat-a",
 *       title: "Category A",
 *       items: [
 *         { id: "a1", title: "Item A-1", description: "Details A-1" },
 *         { id: "a2", title: "Item A-2", description: "Details A-2" },
 *       ],
 *     },
 *   ]}
 * />
 * ```
 */
export function BrutalistNestedAccordion({
  sections,
  className,
}: BrutalistNestedAccordionProps): React.ReactElement {
  // Track open state per section and per child
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [openChildren, setOpenChildren] = useState<Record<string, string | null>>({});

  const toggleSection = useCallback((id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleChild = useCallback((sectionId: string, childId: string) => {
    setOpenChildren((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === childId ? null : childId,
    }));
  }, []);

  return (
    <div
      className={cx("brutalist-nested-accordion", className)}
      style={{
        fontFamily: BASE_FONT,
        border: "3px solid #000",
        background: "#fff",
      }}
    >
      {sections.map((section, sIdx) => {
        const isSectionOpen = openSections.has(section.id);
        const isLastSection = sIdx === sections.length - 1;

        return (
          <div key={section.id}>
            {/* Section header */}
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              aria-expanded={isSectionOpen}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                padding: "14px 20px",
                border: "none",
                borderBottom: isSectionOpen ? "none" : "2px solid #000",
                borderRadius: 0,
                outline: "none",
                boxShadow: "none",
                background: isSectionOpen ? "#000" : "#fff",
                color: isSectionOpen ? "#fff" : "#000",
                cursor: "pointer",
                textAlign: "left" as const,
                fontFamily: BASE_FONT,
                fontSize: "15px",
                fontWeight: 900,
                textTransform: "uppercase" as const,
                letterSpacing: "2px",
                gap: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  transition: "transform 0.2s",
                  transform: isSectionOpen ? "rotate(90deg)" : "rotate(0deg)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              >
                &#9654;
              </span>
              <span style={{ flex: 1 }}>{section.title}</span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  opacity: 0.6,
                  flexShrink: 0,
                }}
              >
                [{section.items.length}]
              </span>
            </button>

            {/* Nested items */}
            {isSectionOpen && (
              <div
                style={{
                  borderLeft: "4px solid #000",
                  background: isLastSection ? "#fff" : "#fff",
                }}
              >
                {section.items.map((child, cIdx) => {
                  const isChildOpen = openChildren[section.id] === child.id;
                  const isLastChild = cIdx === section.items.length - 1;

                  return (
                    <div key={child.id}>
                      {/* Child header */}
                      <button
                        type="button"
                        onClick={() => toggleChild(section.id, child.id)}
                        aria-expanded={isChildOpen}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          padding: "12px 16px 12px 32px",
                          border: "none",
                          borderBottom: isChildOpen ? "none" : "1px solid #000",
                          borderRadius: 0,
                          outline: "none",
                          boxShadow: "none",
                          background: isChildOpen ? "#eee" : "#fff",
                          color: "#000",
                          cursor: "pointer",
                          textAlign: "left" as const,
                          fontFamily: BASE_FONT,
                          fontSize: "13px",
                          fontWeight: 700,
                          textTransform: "uppercase" as const,
                          letterSpacing: "1px",
                          gap: "10px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 900,
                            transition: "transform 0.2s",
                            transform: isChildOpen ? "rotate(45deg)" : "rotate(0deg)",
                            flexShrink: 0,
                          }}
                        >
                          +
                        </span>
                        <span style={{ flex: 1 }}>{child.title}</span>
                      </button>

                      {/* Child description */}
                      {isChildOpen && (
                        <div
                          style={{
                            padding: "14px 16px 14px 56px",
                            background: "#fff",
                            borderBottom: isLastChild ? "none" : "1px solid #000",
                            fontSize: "13px",
                            lineHeight: 1.7,
                            color: "#000",
                          }}
                        >
                          {child.description}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Bottom border for the nested block */}
                {!isLastSection && (
                  <div
                    style={{
                      borderTop: "2px solid #000",
                    }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. BrutalistElement — Custom HTML element wrapper enforcing constraints
// ---------------------------------------------------------------------------

/**
 * Props for {@link BrutalistElement}.
 */
interface BrutalistElementProps {
  /** The HTML element to render (default `"div"`) */
  as?: keyof React.JSX.IntrinsicElements;
  /** Child content */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Inline styles (merged with brutalist constraints) */
  style?: React.CSSProperties;
  /** Accessible role */
  role?: string;
  /** HTML id */
  id?: string;
  /** HTML `lang` attribute */
  lang?: string;
}

/**
 * Generic wrapper that enforces brutalist design constraints on any HTML
 * element. Overrides are **never** applied — border-radius, box-shadow,
 * and font-family are always forced to brutalist values.
 *
 * Useful for ensuring third-party content or dynamic sections remain
 * consistent with the overall brutalist aesthetic.
 *
 * @example
 * ```tsx
 * <BrutalistElement as="section" className="my-section">
 *   <p>This content is guaranteed to look brutalist.</p>
 * </BrutalistElement>
 * ```
 */
export function BrutalistElement({
  as: Tag = "div",
  children,
  className,
  style,
  role,
  id,
  lang,
}: BrutalistElementProps): React.ReactElement {
  const mergedStyle = useMemo<React.CSSProperties>(() => {
    // Destructure out the properties we want to enforce so the spread
    // cannot override them.
    const {
      borderRadius: _br,
      boxShadow: _bs,
      fontFamily: _ff,
      ...restStyle
    } = style ?? {};
    void _br; void _bs; void _ff;
    return {
      ...restStyle,
      border: "2px solid #000",
      background: "#fff",
      color: "#000",
      // Enforce constraints — these always win
      borderRadius: 0,
      boxShadow: "none",
      fontFamily: BASE_FONT,
    };
  }, [style]);

  return (
    <Tag
      id={id}
      lang={lang}
      role={role}
      className={cx("brutalist-element", className)}
      style={mergedStyle}
    >
      {children}
    </Tag>
  );
}
