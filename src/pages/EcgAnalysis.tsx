import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Activity,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FlaskConical,
  Server,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WaveformChart } from '@/components/charts/WaveformChart';
import { BarChart } from '@/components/charts/BarChart';
import { CLASS_LABELS, ECG_VALUE_COUNT } from '@/lib/constants';
import { parseCsv, generateSampleCsv, downloadFile, type ParsedCsvResult } from '@/lib/csv';
import { isLiveMode, predictBatch, mapPredictions } from '@/lib/api';
import { formatPercent } from '@/lib/utils';
import type { HeartbeatClass, PredictionSummary } from '@/lib/types';

interface EcgAnalysisProps {
  onNavigate?: (page: 'dashboard' | 'ecg-analysis' | 'model-performance' | 'about') => void;
}

type UploadState = 'idle' | 'parsed' | 'predicting' | 'has-predictions' | 'error';

export function EcgAnalysis({}: EcgAnalysisProps) {
  const [csvResult, setCsvResult] = useState<ParsedCsvResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRow, setSelectedRow] = useState(0);
  const [predictions, setPredictions] = useState<PredictionSummary | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const liveMode = isLiveMode();

  const handleFileContent = useCallback((text: string, name: string) => {
    const result = parseCsv(text);
    setCsvResult(result);
    setFileName(name);
    setPredictions(null);
    setSelectedRow(0);

    if (result.errors.length > 0 && result.rows.length === 0) {
      setUploadState('error');
      setErrorMessage(result.errors[0]);
    } else {
      setUploadState('parsed');
      setErrorMessage(result.errors.length > 0 ? `${result.errors.length} row(s) had errors and were skipped.` : '');
    }
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        handleFileContent(text, file.name);
      };
      reader.onerror = () => {
        setUploadState('error');
        setErrorMessage('Could not read the file. Please try again.');
      };
      reader.readAsText(file);
    },
    [handleFileContent]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDownloadSample = () => {
    const csv = generateSampleCsv(10);
    downloadFile(csv, 'sample_ecg_data.csv');
  };

  const handleDownloadResults = () => {
    if (!predictions || !csvResult) return;
    const header = 'row_index,predicted_class,label,confidence,source\n';
    const rows = predictions.results.map((r) => {
      const labelInfo = CLASS_LABELS.find((c) => c.code === r.predictedClass);
      return `${r.rowIndex},${r.predictedClass},${labelInfo?.name ?? ''},${r.confidence ?? 'N/A'},${r.source}`;
    });
    downloadFile(header + rows.join('\n'), 'ecg_prediction_results.csv');
  };

  const handlePredict = async () => {
    if (!csvResult || csvResult.rows.length === 0) return;

    setUploadState('predicting');

    if (liveMode) {
      // Live mode: call the real backend via api.ts
      // This path is only reached when VITE_API_URL is configured.
      try {
        const response = await predictBatch(csvResult.rows);
        const results = mapPredictions(csvResult.rows, response, 'live');
        const counts = computeCounts(results.map((r) => r.predictedClass));
        setPredictions({ counts, total: results.length, results, source: 'live' });
        setUploadState('has-predictions');
      } catch (err) {
        setUploadState('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'Prediction request failed.'
        );
      }
    } else {
      // Demo mode: no real predictions. Show the demo state clearly.
      // We do NOT fabricate predicted classes. Instead, we show a demo
      // placeholder that tells the user to connect the backend.
      await new Promise((r) => setTimeout(r, 800)); // brief UI transition
      setUploadState('has-predictions');
      setPredictions(null); // null = demo placeholder, no fake data
    }
  };

  const handleReset = () => {
    setCsvResult(null);
    setFileName('');
    setUploadState('idle');
    setErrorMessage('');
    setPredictions(null);
    setSelectedRow(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const rows = csvResult?.rows ?? [];
  const currentRow = rows[selectedRow];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Status indicator */}
      <div className="flex items-center gap-3 flex-wrap">
        {liveMode ? (
          <Badge variant="success" size="md">
            <Server className="w-3.5 h-3.5" />
            Backend Connected — Live Mode
          </Badge>
        ) : (
          <Badge variant="warning" size="md">
            <FlaskConical className="w-3.5 h-3.5" />
            Demo Mode — Backend Not Connected
          </Badge>
        )}
      </div>

      {/* Upload section */}
      {uploadState === 'idle' && (
        <Card>
          <CardHeader
            title="Upload ECG Data"
            subtitle="Upload a CSV file containing ECG heartbeat signals for classification"
            icon={<Upload className="w-5 h-5" />}
            action={
              <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleDownloadSample}>
                Sample CSV
              </Button>
            }
          />
          <div className="px-6 pb-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
                px-6 py-16 text-center
                ${
                  dragOver
                    ? 'border-teal-400 bg-teal-50/50 scale-[1.01]'
                    : 'border-slate-300 bg-slate-50/50 hover:border-navy-400 hover:bg-navy-50/30'
                }
              `}
            >
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                    dragOver ? 'bg-teal-100 text-teal-600' : 'bg-navy-100 text-navy-600'
                  }`}
                >
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-base font-semibold text-navy-800">
                    Drop your CSV file here, or click to browse
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Each row must contain {ECG_VALUE_COUNT} numerical ECG values
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FileText className="w-3.5 h-3.5" />
                  <span>.csv format · comma or semicolon separated</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>

            {/* Requirements */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-semibold text-navy-700 mb-1">Format</p>
                <p className="text-xs text-slate-500">
                  CSV file with {ECG_VALUE_COUNT} numeric values per row
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-semibold text-navy-700 mb-1">No Header Required</p>
                <p className="text-xs text-slate-500">
                  If a header row is present, it will be skipped automatically
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-semibold text-navy-700 mb-1">Privacy</p>
                <p className="text-xs text-slate-500">
                  Files are processed in-browser and not stored persistently
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error state */}
      {uploadState === 'error' && (
        <Card className="border-red-200">
          <div className="px-6 py-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-red-800 mb-1">
                  File Validation Error
                </h3>
                <p className="text-sm text-red-700 mb-4">{errorMessage}</p>
                {csvResult && csvResult.errors.length > 1 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-red-600 hover:text-red-700 font-medium">
                      View all {csvResult.errors.length} errors
                    </summary>
                    <ul className="mt-2 space-y-1 text-red-600 text-xs pl-4">
                      {csvResult.errors.slice(0, 20).map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                      {csvResult.errors.length > 20 && (
                        <li className="text-slate-400">
                          ...and {csvResult.errors.length - 20} more
                        </li>
                      )}
                    </ul>
                  </details>
                )}
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Parsed state — show waveform and predict button */}
      {(uploadState === 'parsed' || uploadState === 'predicting' || uploadState === 'has-predictions') &&
        csvResult &&
        csvResult.rows.length > 0 && (
          <>
            {/* File summary */}
            <Card>
              <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-800">{fileName}</p>
                    <p className="text-xs text-slate-500">
                      {csvResult.rowCount} valid row(s) · {ECG_VALUE_COUNT} values per row
                      {errorMessage && ` · ${errorMessage}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    Upload Different File
                  </Button>
                  {uploadState === 'parsed' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={
                        uploadState === 'predicting' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Activity className="w-4 h-4" />
                        )
                      }
                      onClick={handlePredict}
                    >
                      {liveMode ? 'Run Classification' : 'Run Demo Classification'}
                    </Button>
                  )}
                  {uploadState === 'predicting' && (
                    <Button variant="primary" size="sm" disabled>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Waveform viewer */}
            <Card>
              <CardHeader
                title="ECG Waveform Viewer"
                subtitle={`Row ${selectedRow + 1} of ${rows.length}`}
                icon={<Activity className="w-5 h-5" />}
                action={
                  rows.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedRow((s) => Math.max(0, s - 1))}
                        disabled={selectedRow === 0}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-navy-700" />
                      </button>
                      <span className="text-sm text-slate-500 min-w-[60px] text-center">
                        {selectedRow + 1} / {rows.length}
                      </span>
                      <button
                        onClick={() => setSelectedRow((s) => Math.min(rows.length - 1, s + 1))}
                        disabled={selectedRow === rows.length - 1}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-navy-700" />
                      </button>
                    </div>
                  )
                }
              />
              <div className="px-6 pb-6">
                <WaveformChart
                  data={currentRow}
                  color="#0d9488"
                  animate
                  height={240}
                  label={`row-${selectedRow}`}
                />
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-semibold text-amber-900">
                    ECG Waveform Markers
                  </p>
                  <p className="mt-1 text-xs text-amber-800">
                    P*, Q*, R*, S* and T* are estimated waveform markers
                    for visualization only and are not clinically validated.
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
  <div className="flex items-center gap-2">
    <Activity className="h-5 w-5 text-teal-600" />
    <h3 className="font-semibold text-navy-800">
      R–R Interval Analysis
    </h3>
  </div>

  <p className="mt-2 text-sm text-slate-600">
    Time between two consecutive R peaks.
  </p>

  <p className="mt-3 text-2xl font-bold text-navy-800">
    — ms
  </p>

  <p className="mt-1 text-xs text-slate-500">
    A continuous ECG signal with two detectable R peaks
    is required to calculate the interval.
  </p>
</div>
                {/* Prediction for current row (only if predictions exist) */}
                {predictions && predictions.results[selectedRow] && (
                  <div className="mt-5 rounded-xl bg-slate-50 border border-slate-100 p-4 animate-fade-in">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Predicted Class
                        </span>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                CLASS_LABELS.find(
                                  (c) => c.code === predictions.results[selectedRow].predictedClass
                                )?.color,
                            }}
                          />
                          <span className="text-lg font-bold text-navy-800">
                            {predictions.results[selectedRow].predictedClass}
                          </span>
                          <span className="text-sm text-slate-600">
                            {CLASS_LABELS.find(
                              (c) => c.code === predictions.results[selectedRow].predictedClass
                            )?.name}
                          </span>
                        </div>
                      </div>
                      {predictions.results[selectedRow].confidence !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-500">Confidence</span>
                          <Badge variant="navy" size="sm">
                            {formatPercent(predictions.results[selectedRow].confidence! * 100, 1)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Prediction results */}
            {uploadState === 'has-predictions' && (
              <>
                {predictions ? (
                  /* Real predictions available */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Summary table */}
                    <Card>
                      <CardHeader
                        title="Prediction Summary"
                        subtitle={`${predictions.total} signals classified`}
                        icon={<FileText className="w-5 h-5" />}
                        action={
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Download className="w-3.5 h-3.5" />}
                            onClick={handleDownloadResults}
                          >
                            Download CSV
                          </Button>
                        }
                      />
                      <div className="px-6 pb-6">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-100">
                                <th className="text-left py-2 px-3 font-medium text-slate-500">Class</th>
                                <th className="text-left py-2 px-3 font-medium text-slate-500">Label</th>
                                <th className="text-right py-2 px-3 font-medium text-slate-500">Count</th>
                                <th className="text-right py-2 px-3 font-medium text-slate-500">Percent</th>
                              </tr>
                            </thead>
                            <tbody>
                              {CLASS_LABELS.map((cls) => {
                                const count = predictions.counts[cls.code] ?? 0;
                                const pct = predictions.total > 0 ? (count / predictions.total) * 100 : 0;
                                return (
                                  <tr key={cls.code} className="border-b border-slate-50 last:border-0">
                                    <td className="py-2.5 px-3">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: cls.color }}
                                        />
                                        <span className="font-semibold text-navy-800">{cls.code}</span>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-600">{cls.name}</td>
                                    <td className="py-2.5 px-3 text-right font-medium text-navy-800">
                                      {count}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-slate-600">
                                      {pct.toFixed(1)}%
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Card>

                    {/* Distribution chart */}
                    <Card>
                      <CardHeader
                        title="Class Distribution"
                        subtitle="Predicted class counts across all uploaded signals"
                        icon={<Activity className="w-5 h-5" />}
                      />
                      <div className="px-6 pb-6">
                        <BarChart
                          data={CLASS_LABELS.map((cls) => ({
                            label: cls.code,
                            value: predictions.counts[cls.code] ?? 0,
                            color: cls.color,
                          }))}
                          height={240}
                        />
                      </div>
                    </Card>
                  </div>
                ) : (
                  /* Demo placeholder — no fake predictions */
                  <Card className="border-amber-200 bg-amber-50/30">
                    <div className="px-6 py-10 text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 mb-4">
                        <FlaskConical className="w-7 h-7 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-navy-800 mb-2">
                        Predictions Available After Backend Integration
                      </h3>
                      <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6">
                        The {csvResult.rowCount} uploaded ECG signal(s) have been validated and are
                        ready for classification. To produce actual predictions, connect the Python
                        model backend by setting the <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">VITE_API_URL</code> environment variable.
                        The integration point is in <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">src/lib/api.ts</code>.
                      </p>
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <div className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm text-slate-600">
                          <span className="font-medium text-navy-700">{csvResult.rowCount}</span> valid
                          signal(s) ready
                        </div>
                        <div className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm text-slate-600">
                          <span className="font-medium text-navy-700">{ECG_VALUE_COUNT}</span> values
                          per row
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button variant="outline" size="md" onClick={handleReset}>
                          Upload Different File
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}
          </>
        )}

    </div>
  );
}

function computeCounts(classes: HeartbeatClass[]): Record<HeartbeatClass, number> {
  const counts: Record<HeartbeatClass, number> = { N: 0, S: 0, V: 0, F: 0, Q: 0 };
  for (const cls of classes) {
    counts[cls]++;
  }
  return counts;
}
