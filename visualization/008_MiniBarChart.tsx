/**
 * MiniBarChart — pure SVG horizontal bar chart.
 * Zero runtime dependencies beyond React. Each data point renders a
 * pair of horizontal bars (baseline + optimized) with labels and values.
 *
 * Props:
 *  data        – array of { label, baseline, optimized, baselineColor?, optimizedColor? }
 *  legendLabels – optional { baseline?, optimized? } to override legend text
 *  fontMono    – CSS font-family for labels (default "monospace")
 */
export function MiniBarChart({
  data,
  legendLabels = { baseline: "Baseline", optimized: "Optimized" },
  fontMono = "monospace",
}: {
  data: {
    label: string;
    baseline: number;
    optimized: number;
    baselineColor?: string;
    optimizedColor?: string;
  }[];
  legendLabels?: { baseline?: string; optimized?: string };
  fontMono?: string;
}) {
  const maxVal = Math.max(...data.flatMap((d) => [d.baseline, d.optimized]), 1);
  const barH = 20;
  const gap = 12;
  const groupH = barH * 2 + 6;
  const chartH = data.length * (groupH + gap) - gap;
  const leftPad = 70;
  const rightPad = 20;
  const chartW = 280 - leftPad - rightPad;

  return (
    <svg
      viewBox={`0 0 280 ${chartH + 10}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((p) => (
        <line
          key={p}
          x1={leftPad}
          y1={chartH * (1 - p) + 5}
          x2={280 - rightPad}
          y2={chartH * (1 - p) + 5}
          stroke="#1c1c1c"
          strokeWidth={1}
        />
      ))}

      {/* Data groups */}
      {data.map((d, i) => {
        const y = i * (groupH + gap);
        const bw = chartW;
        return (
          <g key={i}>
            <text
              x={leftPad - 6}
              y={y + groupH / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#8a8a8a"
              fontSize={10}
              fontFamily={fontMono}
            >
              {d.label}
            </text>
            {/* Baseline bar */}
            <rect
              x={leftPad}
              y={y}
              width={(d.baseline / maxVal) * bw}
              height={barH}
              fill={d.baselineColor || "#3a3a3a"}
            />
            <text
              x={leftPad + (d.baseline / maxVal) * bw + 4}
              y={y + barH / 2}
              dominantBaseline="middle"
              fill="#8a8a8a"
              fontSize={9}
              fontFamily={fontMono}
            >
              {d.baseline}
            </text>
            {/* Optimized bar */}
            <rect
              x={leftPad}
              y={y + barH + 6}
              width={(d.optimized / maxVal) * bw}
              height={barH}
              fill={d.optimizedColor || "#ff6b2b"}
            />
            <text
              x={leftPad + (d.optimized / maxVal) * bw + 4}
              y={y + barH + 6 + barH / 2}
              dominantBaseline="middle"
              fill="#d4d4d4"
              fontSize={9}
              fontFamily={fontMono}
            >
              {d.optimized}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={leftPad} y={chartH + 4} width={8} height={8} fill="#3a3a3a" />
      <text
        x={leftPad + 12}
        y={chartH + 11}
        fill="#8a8a8a"
        fontSize={9}
        fontFamily={fontMono}
      >
        {legendLabels.baseline}
      </text>
      <rect
        x={leftPad + 70}
        y={chartH + 4}
        width={8}
        height={8}
        fill="#ff6b2b"
      />
      <text
        x={leftPad + 82}
        y={chartH + 11}
        fill="#8a8a8a"
        fontSize={9}
        fontFamily={fontMono}
      >
        {legendLabels.optimized}
      </text>
    </svg>
  );
}
