"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Copy, Check, Code2 } from "lucide-react";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 text-center text-[#666] text-xs animate-pulse">
        Loading syntax highlighting\u2026
      </div>
    ),
  }
);

const HighlightedCodeDynamic = dynamic(
  () =>
    import(
      "react-syntax-highlighter/dist/esm/styles/prism"
    ).then((mod) => {
      const oneDark = mod.oneDark;
      return function CodeInner({ code, language }: { code: string; language: string }) {
        return (
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: "1rem",
              background: "#0d0d0d",
              fontSize: "0.8rem",
              lineHeight: "1.5",
              fontFamily: "monospace",
            }}
            showLineNumbers
            lineNumberStyle={{ color: "#666666", minWidth: "2.5em" }}
          >
            {code}
          </SyntaxHighlighter>
        );
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 text-center text-[#666] text-xs animate-pulse">
        Loading syntax highlighting\u2026
      </div>
    ),
  }
);

/**
 * CodeBlock — syntax-highlighted code panel with copy button.
 * Uses react-syntax-highlighter (Prism) loaded dynamically to keep
 * the initial bundle small. Supports any Prism language.
 */
export function CodeBlock({
  code,
  title,
  language = "rust",
  variant = "optimized",
  variantLabels = { baseline: "Baseline", optimized: "Optimized" },
}: {
  code: string;
  title: string;
  /** Prism language identifier (e.g. "rust", "typescript", "python"). */
  language?: string;
  /** Visual variant controlling the badge shown in the header. */
  variant?: "baseline" | "optimized";
  /** Override badge labels. */
  variantLabels?: { baseline?: string; optimized?: string };
}) {
  const [copied, setCopied] = useState(false);
  const lineCount = code.split("\n").length;
  const charCount = code.length;
  const tokenEstimate = Math.round(charCount / 4);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden border border-[#262626]" style={{ borderRadius: 4 }}>
      {/* Header */}
      <div
        className="px-4 py-2 flex items-center justify-between border-b border-[#262626]"
        style={{ background: "#0f0f0f" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="size-3.5 text-[#8a8a8a] shrink-0" />
          <span className="text-xs text-[#8a8a8a] truncate" style={{ fontFamily: "monospace" }}>
            {title}
          </span>
          <span className="text-[10px] text-[#666666]" style={{ fontFamily: "monospace" }}>
            {lineCount} lines &middot; ~{tokenEstimate} tokens
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="text-[#8a8a8a] hover:text-[#d4d4d4] transition-colors p-1"
          >
            {copied ? (
              <Check className="size-3.5 text-[#4ade80]" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
          <span
            className="text-[10px] font-medium uppercase tracking-wider"
            style={{
              fontFamily: "monospace",
              padding: "2px 8px",
              borderRadius: 4,
              ...(variant === "baseline"
                ? { color: "#f87171", background: "#f8717118" }
                : { color: "#4ade80", background: "#4ade8018" }),
            }}
          >
            {variant === "baseline"
              ? variantLabels.baseline
              : variantLabels.optimized}
          </span>
        </div>
      </div>

      {/* Code area */}
      <div className="max-h-[480px] overflow-auto" style={{ background: "#0d0d0d" }}>
        <HighlightedCodeDynamic code={code} language={language} />
      </div>
    </div>
  );
}
