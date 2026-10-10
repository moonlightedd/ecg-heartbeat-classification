import { useMemo } from 'react';

interface WaveformChartProps {
  data: number[];
  className?: string;
  color?: string;
  animate?: boolean;
  height?: number;
  label?: string;
}

// Renders an ECG waveform as a responsive SVG path.
// Auto-scales to the min/max of the input data.
export function WaveformChart({
  data,
  className = '',
  color = '#0d9488',
  animate = false,
  height = 200,
  label,
}: WaveformChartProps) {
  const width = 800;
  const padding = { top: 20, right: 16, bottom: 28, left: 48 };

  const { pathD, areaD, minVal, maxVal, gridLines } = useMemo(() => {
    if (data.length === 0) {
      return { pathD: '', areaD: '', minVal: 0, maxVal: 0, gridLines: [] as number[] };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const points = data.map((v, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + chartH - ((v - min) / range) * chartH;
      return { x, y };
    });

    const path = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ');

    const area =
      path +
      ` L ${padding.left + chartW} ${padding.top + chartH}` +
      ` L ${padding.left} ${padding.top + chartH} Z`;

    const grid: number[] = [];
    for (let i = 0; i <= 4; i++) {
      grid.push(min + (range * i) / 4);
    }

    return { pathD: path, areaD: area, minVal: min, maxVal: max, gridLines: grid };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-slate-400 text-sm ${className}`}
        style={{ height }}
      >
        No waveform data
      </div>
    );
  }

  const gradientId = `waveform-grad-${label ?? 'default'}`;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: 'auto' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((val, i) => {
          const chartH = height - padding.top - padding.bottom;
          const y = padding.top + chartH - (i / 4) * chartH;
          return (
            <g key={i}>
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
                {val.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Waveform line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          className={animate ? 'animate-draw-line' : ''}
          style={animate ? { strokeDasharray: '2000' } : undefined}
        />

        {/* X-axis label */}
        <text
          x={width / 2}
          y={height - 4}
          textAnchor="middle"
          className="fill-slate-400"
          fontSize="11"
        >
          Sample index (0–{data.length - 1})
        </text>
      </svg>
    </div>
  );
}
