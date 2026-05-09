/**
 * ComplexityBadge — color-coded O-notation badge.
 * Automatically classifies the complexity string as bad / medium / good
 * and applies the corresponding accent color.
 */
export function ComplexityBadge({
  label,
  complexity,
}: {
  label: string;
  complexity: string;
}) {
  const isBad =
    complexity.includes("n\u00B3") ||
    complexity === "O(n\u00D7m)" ||
    complexity === "O(n) sequential" ||
    complexity === "O(n) + contention";
  const isMedium =
    complexity === "O(n)" ||
    complexity === "O(n) avg" ||
    complexity === "O(n\u00B2)";

  const color = isBad
    ? { border: "rgba(248,113,113,0.3)", text: "#f87171" }
    : isMedium
      ? { border: "rgba(251,191,36,0.3)", text: "#fbbf24" }
      : { border: "rgba(74,222,128,0.3)", text: "#4ade80" };

  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium"
      style={{
        fontFamily: "monospace",
        padding: "2px 8px",
        border: `1px solid ${color.border}`,
        borderRadius: 4,
        color: color.text,
      }}
    >
      {label}: {complexity}
    </span>
  );
}
