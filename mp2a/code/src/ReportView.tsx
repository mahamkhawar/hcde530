import { useEffect, useState } from 'react';
import { getProject } from './storage';
import { Project, ClickEvent } from './types';
import { ArrowLeft, Download, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface Props {
  projectId: string;
  sessionId: string;
  onBack: () => void;
}

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  return `${m}m ${sec}s`;
}

function describeStep(
  stepIndex: number,
  clicks: ClickEvent[]
): { summary: string; allCorrect: boolean } {
  const stepClicks = clicks.filter((c) => c.stepIndex === stepIndex);
  const misclicks = stepClicks.filter((c) => !c.correct).length;
  const completed = stepClicks.some((c) => c.correct);

  if (!completed) {
    return {
      summary: `Not completed${misclicks > 0 ? ` (${misclicks} misclick${misclicks !== 1 ? 's' : ''})` : ''}`,
      allCorrect: false,
    };
  }
  if (misclicks === 0) {
    return { summary: 'Correct on first click', allCorrect: true };
  }
  return {
    summary: `${misclicks} misclick${misclicks !== 1 ? 's' : ''} before correct target`,
    allCorrect: false,
  };
}

export default function ReportView({ projectId, sessionId, onBack }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProject(projectId).then((p) => {
      setProject(p);
      setLoading(false);
    });
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading report…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium">No completed session</p>
          <p className="text-gray-400 text-sm mt-1">Run a session first to generate a report.</p>
          <button
            onClick={onBack}
            className="mt-4 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const session = project.sessions.find((s) => s.id === sessionId);

  if (!session?.endTime) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium">No completed session</p>
          <p className="text-gray-400 text-sm mt-1">Run a session first to generate a report.</p>
          <button
            onClick={onBack}
            className="mt-4 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const { goldenPath, name } = project;
  const { clickLog, startTime, endTime } = session;
  const duration = (endTime ?? 0) - (startTime ?? 0);
  const totalDecisions = clickLog.length;
  const totalErrors = clickLog.filter((c) => !c.correct).length;

  const sessionDate = new Date(startTime ?? session.createdAt).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  function exportCSV() {
    const header = 'step,step_label,timestamp_ms,x_pct,y_pct,correct';
    const rows = clickLog.map((c) => {
      const label = (goldenPath[c.stepIndex]?.label ?? '').replace(/"/g, '""');
      return `${c.stepIndex + 1},"${label}",${c.timestamp},${c.x.toFixed(2)},${c.y.toFixed(2)},${c.correct}`;
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '-').toLowerCase()}-session.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">
              {name}{session.participantLabel ? ` — ${session.participantLabel}` : ''}
            </p>
            <p className="text-xs text-gray-400">{sessionDate}</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Summary
          </p>
          <div className="grid grid-cols-3 gap-3">
            <SummaryCard
              icon={<Clock className="w-4 h-4 text-gray-500" />}
              label="Time on task"
              value={formatMs(duration)}
            />
            <SummaryCard
              icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
              label="Total errors"
              value={String(totalErrors)}
              sub={totalErrors === 0 ? 'Perfect run' : `${totalErrors} misclick${totalErrors !== 1 ? 's' : ''}`}
              highlight={totalErrors > 0}
            />
            <SummaryCard
              icon={<CheckCircle2 className="w-4 h-4 text-gray-500" />}
              label="Total decisions"
              value={String(totalDecisions)}
              sub="clicks recorded"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            What the participant did
          </p>
          <div className="space-y-2">
            {goldenPath.map((step, index) => {
              const { summary, allCorrect } = describeStep(index, clickLog);
              return (
                <div
                  key={step.stepId}
                  className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-start gap-4"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      allCorrect ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {step.label || `Step ${index + 1}`}
                    </p>
                    <p className={`text-sm mt-0.5 ${allCorrect ? 'text-green-600' : 'text-red-500'}`}>
                      {summary}
                    </p>
                  </div>
                  {allCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Click log
          </p>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Step', 'Time', 'Result', 'Position'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clickLog.map((click, i) => {
                  const step = goldenPath[click.stepIndex];
                  return (
                    <tr key={i} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-2.5 text-gray-700 text-xs">
                        {step?.label || `Step ${click.stepIndex + 1}`}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs font-mono">
                        {formatMs(click.timestamp)}
                      </td>
                      <td className="px-4 py-2.5">
                        {click.correct ? (
                          <span className="text-green-600 text-xs font-medium">Correct</span>
                        ) : (
                          <span className="text-red-500 text-xs font-medium">Misclick</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">
                        {click.x.toFixed(1)}%, {click.y.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{label}</p>
      </div>
      <p className={`text-2xl font-bold tabular-nums ${highlight ? 'text-red-500' : 'text-gray-900'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
