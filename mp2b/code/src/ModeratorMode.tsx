import { useEffect, useState } from 'react';
import { getProjectBySessionId } from './storage';
import { Project, SessionRecord } from './types';
import { Circle, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  sessionId: string;
}

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export default function ModeratorMode({ sessionId }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjectBySessionId(sessionId).then((result) => {
      setProject(result?.project ?? null);
      setSession(result?.sessionRecord ?? null);
      setLoading(false);
    });

    const interval = setInterval(() => {
      getProjectBySessionId(sessionId).then((result) => {
        if (result) {
          setProject(result.project);
          setSession(result.sessionRecord);
        }
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading session…</p>
      </div>
    );
  }

  if (!project || !session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Session not found.</p>
      </div>
    );
  }

  const clickLog = session.clickLog ?? [];
  const isComplete = session.status === 'complete';
  const isActive = session.status === 'active';

  const correctClicks = clickLog.filter((c) => c.correct);
  const currentStepIndex = Math.min(correctClicks.length, project.goldenPath.length - 1);
  const errorCount = clickLog.filter((c) => !c.correct).length;
  const elapsed = session.startTime
    ? (session.endTime ?? Date.now()) - session.startTime
    : 0;
  const currentStep = project.goldenPath[currentStepIndex];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {isComplete ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            ) : isActive ? (
              <Circle className="w-2.5 h-2.5 fill-red-500 text-red-500 animate-pulse" />
            ) : (
              <Circle className="w-2.5 h-2.5 text-gray-600" />
            )}
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {isComplete ? 'Complete' : isActive ? 'Live' : 'Waiting'}
            </span>
            {session.participantLabel && (
              <span className="text-xs text-gray-500 ml-1">· {session.participantLabel}</span>
            )}
          </div>
          <p className="text-white font-semibold">{project.name}</p>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono">{formatMs(elapsed)}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Current step"
            value={
              isComplete
                ? 'Done'
                : !isActive
                ? '—'
                : `${currentStepIndex + 1} / ${project.goldenPath.length}`
            }
          />
          <StatCard label="Misclicks" value={String(errorCount)} highlight={errorCount > 0} />
          <StatCard label="Total clicks" value={String(clickLog.length)} />
        </div>

        {!isComplete && isActive && currentStep && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Participant is on
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-900 border border-blue-700 flex items-center justify-center text-xs font-bold text-blue-300 flex-shrink-0">
                  {currentStepIndex + 1}
                </span>
                <p className="text-white font-medium">{currentStep.label || 'Unlabeled step'}</p>
              </div>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="bg-green-950 border border-green-800 rounded-xl px-5 py-5 flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold">Session complete</p>
              <p className="text-green-400 text-sm mt-0.5">
                All {project.goldenPath.length} steps completed in {formatMs(elapsed)}.
              </p>
            </div>
          </div>
        )}

        {clickLog.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Click log ({clickLog.length})
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['Step', 'Time', 'Result', 'Position'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...clickLog].reverse().map((click, i) => {
                    const stepLabel = project.goldenPath[click.stepIndex]?.label;
                    return (
                      <tr key={i} className="border-b border-gray-800/50 last:border-0">
                        <td className="px-4 py-2 text-gray-300 text-xs">
                          {stepLabel || `Step ${click.stepIndex + 1}`}
                        </td>
                        <td className="px-4 py-2 text-gray-500 text-xs font-mono">
                          {formatMs(click.timestamp)}
                        </td>
                        <td className="px-4 py-2">
                          {click.correct ? (
                            <span className="inline-flex items-center gap-1 text-green-400 text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              Correct
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 text-xs font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              Misclick
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-gray-600 text-xs font-mono">
                          {click.x.toFixed(1)}%, {click.y.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isActive && !isComplete && (
          <div className="text-center py-12">
            <Circle className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Waiting for session to begin.</p>
            <p className="text-gray-600 text-xs mt-1">This page refreshes every 2 seconds.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-4">
      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${highlight ? 'text-red-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
