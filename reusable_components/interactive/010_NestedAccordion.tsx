/**
 * 010_NestedAccordion — Two-level expandable accordion component
 *
 * Supports four visual variants (`default`, `brutalist`, `retro`, `scifi`)
 * that change border treatment, font, colors, and chevron character.
 * Zero external dependencies — only React `useState`.
 *
 * @example
 * ```tsx
 * const sections = [
 *   {
 *     id: 's1',
 *     title: 'Design Tokens',
 *     items: [
 *       { id: 's1-1', title: 'Colors', description: 'Brand palette and semantic tokens.' },
 *       { id: 's1-2', title: 'Spacing', description: '4 px base grid with responsive scale.' },
 *     ],
 *   },
 * ];
 *
 * <NestedAccordion sections={sections} style="brutalist" accentColor="#ff0050" />
 * ```
 */

import React, { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single leaf item within a section. */
export interface AccordionItem {
  id: string;
  title: string;
  description: string;
}

/** A top-level section that contains leaf items. */
export interface AccordionSection {
  id: string;
  title: string;
  items: AccordionItem[];
}

/** Visual variant for the accordion. */
export type AccordionStyle = "default" | "brutalist" | "retro" | "scifi";

export interface NestedAccordionProps {
  /** Array of sections, each containing expandable items. */
  sections: AccordionSection[];

  /** Max-height of each item content area (CSS value). @default '200px' */
  maxHeight?: string;

  /** Max-height of each section's item list area (CSS value). @default '600px' */
  sectionMaxHeight?: string;

  /** Visual variant. @default 'default' */
  style?: AccordionStyle;

  /** Accent colour applied to chevrons, borders, and highlights. @default '#3b82f6' */
  accentColor?: string;

  /** Extra class names forwarded to the root `<div>`. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Style presets
// ---------------------------------------------------------------------------

interface StylePreset {
  root: React.CSSProperties;
  sectionButton: React.CSSProperties;
  sectionTitle: React.CSSProperties;
  itemButton: React.CSSProperties;
  itemTitle: React.CSSProperties;
  description: React.CSSProperties;
  chevron: string;           // character used for expand/collapse indicator
  chevronRotate: string;     // rotation when open
  divider: React.CSSProperties;
}

function getPreset(
  variant: AccordionStyle,
  accent: string,
): StylePreset {
  const baseFont: React.CSSProperties = {
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  const monoFont: React.CSSProperties = {
    fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  };

  switch (variant) {
    case "brutalist":
      return {
        root: { ...baseFont, border: `3px solid ${accent}` },
        sectionButton: {
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "0.08em",
          borderBottom: `3px solid ${accent}`,
          padding: "12px 16px",
          background: "transparent",
          textAlign: "left" as const,
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.875rem",
          color: "inherit",
        },
        sectionTitle: { fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "inherit" },
        itemButton: {
          fontWeight: 700,
          borderBottom: `2px dashed ${accent}`,
          padding: "10px 16px 10px 32px",
          background: "transparent",
          textAlign: "left" as const,
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.8125rem",
          color: "inherit",
        },
        itemTitle: { fontSize: "0.8125rem", fontWeight: 700, color: accent },
        description: { fontSize: "0.75rem", lineHeight: 1.55, color: "inherit", opacity: 0.75, padding: "6px 16px 12px 32px" },
        chevron: "▼",
        chevronRotate: "180deg",
        divider: { border: "none", height: 0 },
      };

    case "retro":
      return {
        root: { ...monoFont, border: `1px solid ${accent}`, backgroundColor: "rgba(0,0,0,0.02)" },
        sectionButton: {
          fontWeight: 700,
          borderBottom: `1px solid ${accent}`,
          padding: "10px 16px",
          background: "transparent",
          textAlign: "left" as const,
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.8125rem",
          color: accent,
        },
        sectionTitle: { ...monoFont, fontSize: "0.8125rem", fontWeight: 700, color: accent },
        itemButton: {
          borderBottom: "1px dotted rgba(0,0,0,0.15)",
          padding: "8px 16px 8px 28px",
          background: "transparent",
          textAlign: "left" as const,
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.75rem",
          color: "inherit",
        },
        itemTitle: { ...monoFont, fontSize: "0.75rem", fontWeight: 600, color: "inherit" },
        description: { ...monoFont, fontSize: "0.6875rem", lineHeight: 1.5, color: "inherit", opacity: 0.7, padding: "4px 16px 10px 28px" },
        chevron: "▸",
        chevronRotate: "90deg",
        divider: { border: "none", height: 0 },
      };

    case "scifi":
      return {
        root: { ...monoFont, border: `1px solid ${accent}`, backgroundColor: "rgba(0,0,0,0.85)", color: "#0f0" },
        sectionButton: {
          fontWeight: 600,
          borderBottom: `1px solid ${accent}`,
          padding: "10px 16px",
          background: "transparent",
          textAlign: "left" as const,
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.8125rem",
          color: accent,
        },
        sectionTitle: { ...monoFont, fontSize: "0.8125rem", fontWeight: 600, color: accent, textShadow: `0 0 6px ${accent}` },
        itemButton: {
          borderBottom: `1px solid rgba(0,255,0,0.15)`,
          padding: "8px 16px 8px 28px",
          background: "transparent",
          textAlign: "left" as const,
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.75rem",
          color: "#0f0",
        },
        itemTitle: { ...monoFont, fontSize: "0.75rem", fontWeight: 600, color: "#0f0" },
        description: { ...monoFont, fontSize: "0.6875rem", lineHeight: 1.5, color: "#0f0", opacity: 0.6, padding: "4px 16px 10px 28px" },
        chevron: "⟐",
        chevronRotate: "180deg",
        divider: { border: "none", height: 0 },
      };

    default:
      return {
        root: { ...baseFont, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8 },
        sectionButton: {
          fontWeight: 600,
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          padding: "12px 16px",
          background: "transparent",
          textAlign: "left" as const,
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.875rem",
          color: "inherit",
        },
        sectionTitle: { fontSize: "0.875rem", fontWeight: 600, color: "inherit" },
        itemButton: {
          fontWeight: 500,
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          padding: "10px 16px 10px 28px",
          background: "transparent",
          textAlign: "left" as const,
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.8125rem",
          color: "inherit",
        },
        itemTitle: { fontSize: "0.8125rem", fontWeight: 500, color: "inherit" },
        description: { fontSize: "0.75rem", lineHeight: 1.55, color: "inherit", opacity: 0.7, padding: "4px 16px 10px 28px" },
        chevron: "›",
        chevronRotate: "90deg",
        divider: { border: "none", height: 0 },
      };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const NestedAccordion: React.FC<NestedAccordionProps> = ({
  sections,
  maxHeight = "200px",
  sectionMaxHeight = "600px",
  style: variant = "default",
  accentColor = "#3b82f6",
  className,
}) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const preset = getPreset(variant, accentColor);

  // --- Section toggle ---
  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  // --- Item toggle ---
  const toggleItem = useCallback((itemId: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  return (
    <div className={className} style={preset.root}>
      {sections.map((section) => {
        const sectionOpen = openSections.has(section.id);

        return (
          <div key={section.id}>
            {/* Section header */}
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              aria-expanded={sectionOpen}
              style={preset.sectionButton}
            >
              <span style={preset.sectionTitle}>{section.title}</span>
              <span
                style={{
                  display: "inline-block",
                  transform: sectionOpen ? preset.chevronRotate : "rotate(0deg)",
                  transition: "transform 0.25s ease",
                  fontSize: "0.75rem",
                  lineHeight: 1,
                }}
              >
                {preset.chevron}
              </span>
            </button>

            {/* Section items */}
            <div
              style={{
                maxHeight: sectionOpen ? sectionMaxHeight : "0px",
                overflow: "hidden",
                transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {section.items.map((item) => {
                const itemOpen = openItems.has(item.id);

                return (
                  <div key={item.id}>
                    {/* Item header */}
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      aria-expanded={itemOpen}
                      style={preset.itemButton}
                    >
                      <span style={preset.itemTitle}>{item.title}</span>
                      <span
                        style={{
                          display: "inline-block",
                          transform: itemOpen ? preset.chevronRotate : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                          fontSize: "0.625rem",
                          lineHeight: 1,
                        }}
                      >
                        {preset.chevron}
                      </span>
                    </button>

                    {/* Item description */}
                    <div
                      style={{
                        maxHeight: itemOpen ? maxHeight : "0px",
                        overflow: "hidden",
                        transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <p style={preset.description}>{item.description}</p>
                    </div>

                    <hr style={preset.divider} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NestedAccordion;
