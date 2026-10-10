import { BarChart3, Grid3x3, BookOpen, TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ComparisonChart } from '@/components/charts/ComparisonChart';
import { ConfusionMatrix } from '@/components/charts/ConfusionMatrix';
import { MODELS, BEST_MODEL } from '@/lib/constants';
import { formatPercent, formatF1 } from '@/lib/utils';

export function ModelPerformance() {
  const categories = MODELS.map((m) => m.shortName);

  const accuracySeries = {
    name: 'Accuracy (%)',
    values: MODELS.map((m) => m.accuracy),
    color: '#1e3a5f',
  };
  const f1Series = {
    name: 'Macro F1 (×100)',
    values: MODELS.map((m) => m.macroF1 * 100),
    color: '#0d9488',
  };

  // Runner-up = best model other than BEST_MODEL (used for the comparison text)
  const runnerUp = [...MODELS]
    .filter((m) => m.key !== BEST_MODEL.key)
    .sort((a, b) => b.macroF1 - a.macroF1)[0];

  const metricCards = [
    {
      n: 1,
      title: 'Accuracy',
      badge: 'bg-navy-50 text-navy-700',
      text: `The percentage of all test heartbeats classified correctly. It can be misleading when some heartbeat types are much rarer than others: a model that always predicts "Normal" would still score high if most beats are normal.`,
    },
    {
      n: 2,
      title: 'Macro F1-Score',
      badge: 'bg-teal-50 text-teal-700',
      text: `The average F1-score across the five heartbeat classes, with every class weighted equally regardless of size. F1 combines precision (of the beats predicted as a class, how many were correct) and recall (of the true beats of a class, how many were found). A value closer to 1.0 means the model performs well across all classes, not just the majority one.`,
    },
    {
      n: 3,
      title: 'Class-wise Recall',
      badge: 'bg-slate-100 text-slate-700',
      text: `For each heartbeat type, recall is the fraction of true beats of that type the model found. In a screening context, recall for the abnormal classes (S, V, F) is especially important because missed abnormal beats are the costly error. Class Q (unclassifiable) is also reported but is not a confirmed abnormality. Per-class recall is not shown yet; it will be added with the confusion matrix.`,
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Comparison chart */}
      <Card>
        <CardHeader
          title="Model Comparison"
          subtitle="Test accuracy and macro F1-score across all trained models"
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <div className="px-6 pb-6">
          <ComparisonChart
            categories={categories}
            series={[accuracySeries, f1Series]}
            height={300}
          />
        </div>
      </Card>

      {/* Detailed metrics table */}
      <Card>
        <CardHeader
          title="Detailed Results"
          subtitle="Reported test metrics for each model"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <div className="px-6 pb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Accuracy and macro F1-score for each trained model
              </caption>
              <thead>
                <tr className="border-b border-slate-200">
                  <th scope="col" className="text-left py-3 px-4 font-semibold text-navy-700">Model</th>
                  <th scope="col" className="text-right py-3 px-4 font-semibold text-navy-700">Accuracy</th>
                  <th scope="col" className="text-right py-3 px-4 font-semibold text-navy-700">Macro F1</th>
                  <th scope="col" className="text-center py-3 px-4 font-semibold text-navy-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map((m) => (
                  <tr
                    key={m.key}
                    className={`border-b border-slate-50 last:border-0 ${
                      m.isBest ? 'bg-teal-50/40' : ''
                    }`}
                  >
                    <th scope="row" className="py-3.5 px-4 text-left font-normal">
                      <span className="font-medium text-navy-800">{m.name}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                    </th>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-lg font-bold text-navy-800">
                        {formatPercent(m.accuracy)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-lg font-bold text-navy-800">
                        {formatF1(m.macroF1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {m.isBest ? (
                        <Badge variant="success" size="sm">Best</Badge>
                      ) : (
                        <span className="text-xs text-slate-500" aria-label="Not the best model">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Confusion matrix */}
      <Card>
        <CardHeader
          title="Confusion Matrix"
         subtitle="Best model (Random Forest + Oversampling): actual test-set results"
          icon={<Grid3x3 className="w-5 h-5" />}
          action={<Badge variant="success" size="sm">Test Results</Badge>}
        />
        <div className="px-6 pb-6">
          <ConfusionMatrix
  matrix={[
    [18081, 20, 10, 5, 2],
    [191, 364, 0, 0, 1],
    [121, 1, 1306, 15, 5],
    [47, 0, 13, 102, 0],
    [72, 0, 4, 0, 1532],
  ]}
/>
          <p className="text-xs text-slate-500 mt-4 text-center max-w-2xl mx-auto">
  Actual test-set results from the trained Random Forest model.
  Rows represent actual heartbeat classes; columns represent predicted classes.
  Class order: N, S, V, F, Q.
</p>
        </div>
      </Card>

      {/* Metrics explained */}
      <Card>
        <CardHeader
          title="Understanding the Metrics"
          subtitle="Plain-language explanations of the evaluation metrics used in this project"
          icon={<BookOpen className="w-5 h-5" />}
        />
        <div className="px-6 pb-6 space-y-5">
          {metricCards.map((c) => (
            <div key={c.n} className="rounded-xl border border-slate-100 p-5">
              <h4 className="text-sm font-semibold text-navy-800 mb-2 flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${c.badge}`}
                >
                  {c.n}
                </span>
                {c.title}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">{c.text}</p>
            </div>
          ))}

          <div className="rounded-xl bg-teal-50 border border-teal-100 p-5">
            <h4 className="text-sm font-semibold text-teal-800 mb-2">
              Effect of Oversampling
            </h4>
            <p className="text-sm text-teal-700 leading-relaxed">
              The dataset is imbalanced: normal beats far outnumber abnormal ones. Random
              oversampling duplicates minority-class examples in the <strong>training set only</strong>{' '}
              so the model sees them more often. In this project, macro F1 rose from{' '}
              {formatF1(runnerUp.macroF1)} to {formatF1(BEST_MODEL.macroF1)}, and accuracy rose from{' '}
              {formatPercent(runnerUp.accuracy)} to {formatPercent(BEST_MODEL.accuracy)}. This
              suggests better balance across classes, but per-class recall is needed to confirm
              which classes improved.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}