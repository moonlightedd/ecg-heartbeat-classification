import type { HeartbeatClass } from '@/lib/types';
import { CLASS_LABELS } from '@/lib/constants';

interface ConfusionMatrixProps {
  // matrix[actual][predicted] = count
  // When null, renders a placeholder.
  matrix?: number[][];
  labels?: HeartbeatClass[];
  className?: string;
}

export function ConfusionMatrix({
  matrix = null,
  labels = ['N', 'S', 'V', 'F', 'Q'] as HeartbeatClass[],
  className = '',
}: ConfusionMatrixProps) {
  if (!matrix) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">Confusion matrix data not yet supplied</p>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          Once the model's confusion matrix is exported from the Python pipeline, it will be displayed here as a heatmap.
        </p>
      </div>
    );
  }

  const size = labels.length;
  const maxVal = Math.max(...matrix.flat(), 1);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="inline-block">
        {/* Predicted axis label */}
        <div className="text-center text-xs font-medium text-slate-500 mb-2">Predicted Class</div>
        <div className="flex">
          {/* Actual axis label */}
          <div className="flex items-center">
            <div
              className="text-xs font-medium text-slate-500"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Actual Class
            </div>
          </div>
          <div>
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="w-16"></th>
                  {labels.map((l) => (
                    <th key={l} className="w-20 px-2 pb-2 text-center">
                      <div className="flex flex-col items-center">
                        <span
                          className="w-3 h-3 rounded-sm mb-1"
                          style={{ backgroundColor: CLASS_LABELS.find((c) => c.code === l)?.color }}
                        />
                        <span className="text-sm font-semibold text-navy-800">{l}</span>
                        <span className="text-xs text-slate-400">
                          {CLASS_LABELS.find((c) => c.code === l)?.name}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labels.map((actualLabel, i) => (
                  <tr key={actualLabel}>
                    <td className="w-16 pr-2 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-navy-800">{actualLabel}</span>
                        <span className="text-xs text-slate-400">
                          {CLASS_LABELS.find((c) => c.code === actualLabel)?.name}
                        </span>
                      </div>
                    </td>
                    {labels.map((_, j) => {
                      const val = matrix[i]?.[j] ?? 0;
                      const intensity = val / maxVal;
                      const isDiagonal = i === j;
                      const bgColor = isDiagonal
                        ? `rgba(13, 148, 136, ${0.15 + intensity * 0.6})`
                        : `rgba(239, 68, 68, ${intensity * 0.35})`;
                      return (
                        <td key={j} className="p-1">
                          <div
                            className="w-20 h-20 rounded-lg flex items-center justify-center transition-all duration-300"
                            style={{ backgroundColor: bgColor }}
                            title={`Actual: ${actualLabel}, Predicted: ${labels[j]}, Count: ${val}`}
                          >
                            <span
                              className={`text-lg font-bold ${
                                isDiagonal ? 'text-teal-900' : 'text-red-900'
                              } ${intensity > 0.5 ? 'opacity-100' : 'opacity-70'}`}
                            >
                              {val}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
