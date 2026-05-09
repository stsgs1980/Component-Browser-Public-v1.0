import { GitCompareArrows, Plus, Minus } from "lucide-react";

/**
 * CodeDiff — line-by-line diff viewer.
 * Performs a naive side-by-side diff of two code strings and renders
 * added / removed / context lines with line numbers and +/- indicators.
 */
export function CodeDiff({
  baseline,
  optimized,
  title,
}: {
  baseline: string;
  optimized: string;
  title: string;
}) {
  const bLines = baseline.split("\n");
  const oLines = optimized.split("\n");
  const maxLines = Math.max(bLines.length, oLines.length);

  const diffLines: {
    type: "context" | "added" | "removed";
    line: string;
    num: number;
  }[] = [];

  for (let i = 0; i < maxLines; i++) {
    if (i < bLines.length && i < oLines.length) {
      if (bLines[i] === oLines[i]) {
        diffLines.push({ type: "context", line: oLines[i], num: i + 1 });
      } else {
        diffLines.push({ type: "removed", line: bLines[i], num: i + 1 });
        diffLines.push({ type: "added", line: oLines[i], num: i + 1 });
      }
    } else if (i < bLines.length) {
      diffLines.push({ type: "removed", line: bLines[i], num: i + 1 });
    } else {
      diffLines.push({ type: "added", line: oLines[i], num: i + 1 });
    }
  }

  const addedCount = diffLines.filter((d) => d.type === "added").length;
  const removedCount = diffLines.filter((d) => d.type === "removed").length;

  return (
    <div
      className="overflow-hidden border border-[#262626]"
      style={{ borderRadius: 4 }}
    >
      {/* Header */}
      <div
        className="px-4 py-2 flex items-center justify-between border-b border-[#262626]"
        style={{ background: "#0f0f0f" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <GitCompareArrows className="size-3.5 text-[#8a8a8a] shrink-0" />
          <span
            className="text-xs text-[#8a8a8a] truncate"
            style={{ fontFamily: "monospace" }}
          >
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="flex items-center gap-1 text-[10px]"
            style={{
              fontFamily: "monospace",
              color: "#4ade80",
              background: "#4ade8010",
              padding: "2px 6px",
              borderRadius: 2,
            }}
          >
            <Plus className="size-2.5" />
            {addedCount}
          </span>
          <span
            className="flex items-center gap-1 text-[10px]"
            style={{
              fontFamily: "monospace",
              color: "#f87171",
              background: "#f8717110",
              padding: "2px 6px",
              borderRadius: 2,
            }}
          >
            <Minus className="size-2.5" />
            {removedCount}
          </span>
        </div>
      </div>

      {/* Diff lines */}
      <div
        className="max-h-[480px] overflow-auto"
        style={{ background: "#0d0d0d" }}
      >
        <div
          className="text-[11px]"
          style={{ fontFamily: "monospace", lineHeight: 1.6 }}
        >
          {diffLines.map((d, i) => (
            <div
              key={i}
              className="flex items-start px-3"
              style={{
                background:
                  d.type === "added"
                    ? "#4ade8010"
                    : d.type === "removed"
                      ? "#f8717110"
                      : "transparent",
              }}
            >
              <span
                className="w-8 shrink-0 text-right select-none mr-3 text-[10px]"
                style={{ color: "#666666" }}
              >
                {d.num}
              </span>
              <span
                className="w-4 shrink-0 text-center select-none mr-3"
                style={{
                  color:
                    d.type === "added"
                      ? "#4ade80"
                      : d.type === "removed"
                        ? "#f87171"
                        : "#666666",
                }}
              >
                {d.type === "added" ? "+" : d.type === "removed" ? "\u2212" : " "}
              </span>
              <span
                className="flex-1 whitespace-pre"
                style={{
                  color:
                    d.type === "added"
                      ? "#4ade80cc"
                      : d.type === "removed"
                        ? "#f8717199"
                        : "#8a8a8a",
                  textDecoration: d.type === "removed" ? "line-through" : "none",
                }}
              >
                {d.line}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
