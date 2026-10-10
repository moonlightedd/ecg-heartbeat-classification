import { useMemo } from 'react';

interface ComparisonSeries {
  name: string;
  values: number[];
  color: string;
}

interface ComparisonChartProps {
  categories: string[];
  series: ComparisonSeries[];
  height?: number;
  className?: string;
}

// Grouped bar chart for comparing metrics across models.
export function ComparisonChart({
  categories,
  series,
  height = 280,
  className = '',
}: ComparisonChartProps) {
  const padding = { top: 30, right: 20, bottom: 50, left: 60 };
  const width = 720;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const { maxVal, groupWidth, barWidth } = useMemo(() => {
    const max = Math.max(...series.flatMap((s) => s.values), 1);
    const groupW = chartW / categories.length;
    const bw = Math.min(36, (groupW - 16) / series.length);
    return { maxVal: max * 1.1, groupWidth: groupW, barWidth: bw };
  }, [series, categories, chartW]);

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ minWidth: width > 600 ? width : '100%', height: 'auto' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Y-axis grid + labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = padding.top + chartH - frac * chartH;
          const val = frac * maxVal;
          return (
            <g key={frac}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400"
                fontSize="11"
              >
                {val.toFixed(val < 10 ? 2 : 0)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {categories.map((cat, ci) => {
          const groupX = padding.left + ci * groupWidth + groupWidth / 2;
          const totalBarsW = series.length * barWidth + (series.length - 1) * 4;
          const startX = groupX - totalBarsW / 2;

          return (
            <g key={ci}>
              {series.map((s, si) => {
                const val = s.values[ci];
                const barH = (val / maxVal) * chartH;
                const x = startX + si * (barWidth + 4);
                const y = padding.top + chartH - barH;

                return (
                  <g key={si}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barH}
                      rx="4"
                      fill={s.color}
                      className="transition-all duration-700 ease-out"
                    >
                      <animate
                        attributeName="height"
                        from="0"
                        to={barH}
                        dur="0.7s"
                        fill="freeze"
                      />
                      <animate
                        attributeName="y"
                        from={padding.top + chartH}
                        to={y}
                        dur="0.7s"
                        fill="freeze"
                      />
                    </rect>
                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      textAnchor="middle"
                      className="fill-navy-800 font-semibold"
                      fontSize="11"
                    >
                      {val.toFixed(val < 10 ? 2 : 1)}
                    </text>
                  </g>
                );
              })}
              <text
                x={groupX}
                y={height - 16}
                textAnchor="middle"
                className="fill-slate-600 font-medium"
                fontSize="13"
              >
                {cat}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
        {series.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
            <span className="text-sm text-slate-600">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
