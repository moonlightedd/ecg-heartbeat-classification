interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
  maxValue?: number;
  unit?: string;
  className?: string;
}

// Simple vertical bar chart rendered with SVG.
export function BarChart({
  data,
  height = 220,
  maxValue,
  unit = '',
  className = '',
}: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  const chartH = height - 40;
  const barWidth = 48;
  const gap = 16;
  const totalW = data.length * (barWidth + gap) + gap;

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <svg
        viewBox={`0 0 ${totalW} ${height}`}
        className="w-full"
        style={{ minWidth: totalW > 400 ? totalW : '100%', height: 'auto' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Y-axis grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = chartH - frac * chartH + 10;
          return (
            <g key={frac}>
              <line
                x1={0}
                y1={y}
                x2={totalW}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={4}
                y={y - 4}
                className="fill-slate-400"
                fontSize="11"
              >
                {(frac * max).toFixed(0)}{unit}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.value / max) * chartH;
          const x = gap + i * (barWidth + gap);
          const y = chartH - barH + 10;
          const color = d.color ?? '#1e3a5f';

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx="6"
                fill={color}
                className="transition-all duration-700 ease-out"
              >
                <animate
                  attributeName="height"
                  from="0"
                  to={barH}
                  dur="0.6s"
                  fill="freeze"
                />
                <animate
                  attributeName="y"
                  from={chartH + 10}
                  to={y}
                  dur="0.6s"
                  fill="freeze"
                />
              </rect>
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                className="fill-navy-800 font-semibold"
                fontSize="13"
              >
                {d.value.toFixed(d.value < 10 ? 1 : 0)}{unit}
              </text>
              <text
                x={x + barWidth / 2}
                y={height - 6}
                textAnchor="middle"
                className="fill-slate-500"
                fontSize="12"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
