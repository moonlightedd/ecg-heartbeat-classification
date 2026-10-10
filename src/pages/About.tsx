import {
  HeartPulse,
  Database,
  Code2,
  ShieldAlert,
  Layers,
  Server,
  FileText,
  Github,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CLASS_LABELS, ECG_VALUE_COUNT, BEST_MODEL } from '@/lib/constants';
import { formatPercent, formatF1 } from '@/lib/utils';

export function About() {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Project overview */}
      <Card>
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-navy-700 to-navy-900 px-6 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-teal-400" />
            </div>
            <Badge variant="teal" size="md">College ML Project</Badge>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Heartbeat Abnormality Classification from ECG Signals
          </h3>
          <p className="text-sm text-navy-100 leading-relaxed max-w-2xl">
            This project demonstrates how machine learning can be used to classify individual ECG
            heartbeat signals into five categories based on the AAMI standard. It is an educational
            screening-support tool, not a medical device.
          </p>
        </div>
        <div className="px-6 py-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            The system processes ECG signals represented as {ECG_VALUE_COUNT}-dimensional feature
            vectors and assigns each signal to one of five heartbeat classes. Three models were trained
            and evaluated, with the best-performing model achieving{' '}
            <span className="font-semibold text-navy-800">
              {formatPercent(BEST_MODEL.accuracy)} accuracy
            </span>{' '}
            and a macro F1-score of{' '}
            <span className="font-semibold text-navy-800">{formatF1(BEST_MODEL.macroF1)}</span>.
          </p>
        </div>
      </Card>

      {/* Tech stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-700">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-navy-800">Frontend Stack</h4>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              React + TypeScript
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Tailwind CSS for styling
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Custom SVG charts (no charting library)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Vite build tooling
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-navy-800">Backend Integration</h4>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The Python model backend is not yet connected. The integration point is clearly separated
            in the code and ready to be activated.
          </p>
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
            <p className="text-xs font-mono text-slate-500">
              Integration: <span className="text-navy-700">src/lib/api.ts</span>
            </p>
            <p className="text-xs font-mono text-slate-500 mt-1">
              Config: <span className="text-navy-700">VITE_API_URL</span> environment variable
            </p>
          </div>
        </Card>
      </div>

      {/* Dataset info */}
      <Card>
        <CardHeader
          title="Dataset & Classes"
          subtitle="ECG heartbeat signals classified into five AAMI-standard categories"
          icon={<Database className="w-5 h-5" />}
        />
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
            {CLASS_LABELS.map((cls) => (
              <div
                key={cls.code}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cls.color }}
                  />
                  <span className="text-sm font-bold text-navy-800">{cls.code}</span>
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">{cls.name}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{cls.fullDescription}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-navy-700">Input format:</span> Each heartbeat is
              represented as a vector of {ECG_VALUE_COUNT} numerical values derived from the ECG
              signal. The CSV upload expects one heartbeat per row.
            </p>
          </div>
        </div>
      </Card>

      {/* Architecture overview */}
      <Card>
        <CardHeader
          title="Project Architecture"
          subtitle="How the frontend is organized for future backend integration"
          icon={<Layers className="w-5 h-5" />}
        />
        <div className="px-6 pb-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
              <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center text-navy-700 flex-shrink-0 text-xs font-bold">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-navy-800">CSV Upload & Validation</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Files are parsed and validated entirely in the browser. No data is stored
                  persistently — uploaded files exist only in memory for the current session.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
              <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center text-navy-700 flex-shrink-0 text-xs font-bold">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-navy-800">Prediction Request</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Validated signals are sent to the Python backend API for classification. In demo
                  mode (no backend), the UI shows a clearly-labeled placeholder instead of fake results.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
              <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center text-navy-700 flex-shrink-0 text-xs font-bold">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-navy-800">Results Visualization</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Predictions are displayed as per-row class labels, a summary table with counts and
                  percentages, a bar chart, and a downloadable CSV report.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Key principles */}
      <Card>
        <CardHeader
          title="Ethical & Technical Principles"
          icon={<ShieldAlert className="w-5 h-5" />}
        />
        <div className="px-6 pb-6 space-y-3">
          {[
            'Predictions are never fabricated. In demo mode, the UI shows placeholder states instead of fake classification results.',
            'The confusion matrix section uses a placeholder until real matrix data is supplied from the training pipeline.',
            'Model confidence scores are only displayed when the backend provides them — they are never invented.',
            'Uploaded ECG files are not stored persistently and exist only in browser memory.',
            'The disclaimer is always visible: this is an educational tool, not a medical device.',
          ].map((principle, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{principle}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
