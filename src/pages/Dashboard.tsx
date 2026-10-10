import { Trophy, TrendingUp, Target, HeartPulse, Activity, Database } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MODELS, BEST_MODEL, CLASS_LABELS } from '@/lib/constants';
import { formatPercent, formatF1 } from '@/lib/utils';
import type { PageKey } from '@/lib/types';

interface DashboardProps {
  onNavigate: (page: PageKey) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Hero section */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900 px-6 py-10 lg:px-10 lg:py-12">
          {/* Decorative ECG line */}
          <svg
            className="absolute top-0 right-0 w-full h-full opacity-10"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0,100 L100,100 L120,100 L130,60 L140,140 L150,80 L160,100 L300,100 L320,100 L330,50 L340,150 L350,90 L360,100 L500,100 L520,100 L530,70 L540,130 L550,100 L800,100"
              fill="none"
              stroke="#5eead4"
              strokeWidth="2"
            />
          </svg>

          <div className="relative max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center backdrop-blur-sm">
                <HeartPulse className="w-5 h-5 text-teal-400" />
              </div>
              <Badge variant="teal" size="md">
                <Activity className="w-3.5 h-3.5" />
                Machine Learning Demo
              </Badge>
            </div>
            <h1 className="text-2xl lg:text-4xl font-bold text-white leading-tight mb-3">
              Heartbeat Abnormality Classification from ECG Signals
            </h1>
            <p className="text-base lg:text-lg text-navy-100 leading-relaxed mb-6">
              An educational screening-support demonstration that classifies individual ECG heartbeat
              signals into five categories using machine learning. Upload a CSV of 187-value ECG
              signals to explore the classification pipeline.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('ecg-analysis')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 text-white font-medium text-sm hover:bg-teal-400 transition-all duration-200 shadow-lg shadow-teal-500/20"
              >
                <Activity className="w-4 h-4" />
                Try ECG Analysis
              </button>
              <button
                onClick={() => onNavigate('model-performance')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
              >
                <TrendingUp className="w-4 h-4" />
                View Performance
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Best model highlight */}
      <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-white">
        <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-navy-800">Best Reported Model</h3>
              <Badge variant="success" size="sm">Best Test Accuracy</Badge>
            </div>
            <p className="text-sm text-slate-600">
              {BEST_MODEL.name} — {formatPercent(BEST_MODEL.accuracy)} accuracy, macro F1-score{' '}
              {formatF1(BEST_MODEL.macroF1)}. Not clinically validated.
            </p>
          </div>
        </div>
      </Card>

      {/* Model metrics cards */}
      <div>
        <h3 className="text-lg font-semibold text-navy-800 mb-4">Model Test Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODELS.map((model) => (
            <Card key={model.key} hover className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-base font-semibold text-navy-800">{model.name}</h4>
                  {model.isBest && (
                    <div className="mt-1.5">
                      <Badge variant="success" size="sm">
                        <Trophy className="w-3 h-3" />
                        Best Performance
                      </Badge>
                    </div>
                  )}
                </div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    model.isBest ? 'bg-teal-50 text-teal-600' : 'bg-navy-50 text-navy-600'
                  }`}
                >
                  <Target className="w-5 h-5" />
                </div>
              </div>

              <p className="text-sm text-slate-500 mb-5 leading-relaxed">{model.description}</p>

              {/* Accuracy */}
              <div className="mb-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Accuracy
                  </span>
                  <span className="text-xl font-bold text-navy-800">
                    {formatPercent(model.accuracy)}
                  </span>
                </div>
                <ProgressBar
                  value={model.accuracy}
                  barClassName={model.isBest ? 'bg-teal-500' : 'bg-navy-600'}
                />
              </div>

              {/* Macro F1 */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Macro F1-Score
                  </span>
                  <span className="text-xl font-bold text-navy-800">
                    {formatF1(model.macroF1)}
                  </span>
                </div>
                <ProgressBar
                  value={model.macroF1 * 100}
                  barClassName={model.isBest ? 'bg-teal-500' : 'bg-navy-600'}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Class labels reference */}
      <Card>
        <CardHeader
          title="Heartbeat Classification Categories"
          subtitle="The five AAMI-standard classes used in this project"
          icon={<Database className="w-5 h-5" />}
        />
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {CLASS_LABELS.map((cls) => (
              <div
                key={cls.code}
                className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cls.color }}
                  />
                  <span className="text-sm font-bold text-navy-800">{cls.code}</span>
                  <span className="text-sm text-slate-600">{cls.name}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{cls.fullDescription}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

    </div>
  );
}
