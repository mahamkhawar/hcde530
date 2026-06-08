import { useEffect, useRef, useState } from 'react';
import { Project, SessionRecord, ClickEvent } from './types';
import { getProject, saveProject } from './storage';
import {
  Copy,
  Check,
  Circle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Download,
} from 'lucide-react';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
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
  if (misclicks === 0) return { summary: 'Correct on first click', allCorrect: true };
  return {
    summary: `${misclicks} misclick${misclicks !== 1 ? 's' : ''} before correct target`,
    allCorrect: false,
  };
}

interface Props {
  project: Project;
  activeSessionId: string;
  onProjectChange: (p: Project) => void;
  onNewSession: (updatedProject: Project, newSessionId: string) => void;
}

export default function SessionHub({
  project,
  activeSessionId,
  onProjectChange,
  onNewSession,
}: Props) {
  const activeSession = project.sessions.find((s) => s.id === activeSessionId) ?? null;

  const [label, setLabel] = useState(activeSession?.participantLabel ?? '');
  const [copied, setCopied] = useState<'participant' | 'moderator' | null>(null);
  const [liveProject, setLiveProject] = useState<Project | null>(null);
  const isLive = activeSession?.status === 'active';
  const isComplete = activeSession?.status === 'complete';
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync label when activeSession changes (e.g. after new session)
  useEffect(() => {
    setLabel(activeSession?.participantLabel ?? '');
  }, [activeSessionId]);

  // Poll live data when session is active
  useEffect(() => {
    if (isLive) {
      pollRef.current = setInterval(async () => {
        const p = await getProject(project.id);
        if (p) setLiveProject(p);
      }, 2000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
      if (isComplete) {
        getProject(project.id).then((p) => p && setLiveProject(p));
      }
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isLive, isComplete, project.id]);

  const liveSession =
    liveProject?.sessions.find((s) => s.id === activeSessionId) ?? activeSession;

  const base = `${window.location.origin}${window.location.pathname}`;
  const participantLink = `${base}?session=${activeSessionId}&role=participant`;
  const moderatorLink = `${base}?session=${activeSessionId}&role=moderator`;

  function copyLink(which: 'participant' | 'moderator') {
    navigator.clipboard.writeText(which === 'participant' ? participantLink : moderatorLink);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  }

  async function updateLabel(newLabel: string) {
    setLabel(newLabel);
    const updated = {
      ...project,
      sessions: project.sessions.map((s) =>
        s.id === activeSessionId ? { ...s, participantLabel: newLabel } : s
      ),
    };
    onProjectChange(updated);
    await saveProject(updated);
  }

  async function startSession() {
    const updated = {
      ...project,
      sessions: project.sessions.map((s) =>
        s.id === activeSessionId
          ? { ...s, startTime: Date.now(), status: 'active' as const }
          : s
      ),
    };
    await saveProject(updated);
    onProjectChange(updated);
  }

  async function endSession() {
    const now = Date.now();
    const p = (await getProject(project.id)) ?? project;
    const updated = {
      ...p,
      sessions: p.sessions.map((s) =>
        s.id === activeSessionId
          ? { ...s, endTime: now, status: 'complete' as const }
          : s
      ),
    };
    await saveProject(updated);
    onProjectChange(updated);
    setLiveProject(updated);
  }

  async function handleNewSession() {
    const completedCount = project.sessions.filter((s) => s.status === 'complete').length;
    const newSess: SessionRecord = {
      id: uid(),
      participantLabel: `P${completedCount + 1}`,
      createdAt: Date.now(),
      startTime: null,
      endTime: null,
      status: 'pending',
      clickLog: [],
    };
    const updated = {
      ...project,
      sessions: [...project.sessions.filter((s) => s.status !== 'pending'), newSess],
    };
    await saveProject(updated);
    setLiveProject(null);
    onNewSession(updated, newSess.id);
  }

  const clickLog = liveSession?.clickLog ?? [];
  const errorCount = clickLog.filter((c) => !c.correct).length;
  const correctClicks = clickLog.filter((c) => c.correct);
  const currentStepIndex = Math.min(correctClicks.length, project.goldenPath.length - 1);
  const elapsed =
    liveSession?.startTime
      ? (liveSession.endTime ?? Date.now()) - liveSession.startTime
      : 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      {/* Participant label + links */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Participant label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => updateLabel(e.target.value)}
            disabled={isLive || isComplete}
            placeholder="e.g. P1, Participant 2"
            className="w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <LinkRow
            label="Participant link"
            link={participantLink}
            copied={copied === 'participant'}
            onCopy={() => copyLink('participant')}
          />
        </div>

        {!isLive && !isComplete && (
          <button
            onClick={startSession}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Start session
          </button>
        )}
      </div>

      {/* Live feed */}
      {(isLive || isComplete) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isComplete ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Circle className="w-2.5 h-2.5 fill-red-500 text-red-500 animate-pulse" />
              )}
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                {isComplete ? 'Session complete' : 'Live'}
              </span>
              {elapsed > 0 && (
                <span className="flex items-center gap-1 text-gray-400 text-xs font-mono ml-2">
                  <Clock className="w-3 h-3" />
                  {formatMs(elapsed)}
                </span>
              )}
            </div>
            {isLive && (
              <button
                onClick={endSession}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-500 transition-colors"
              >
                End session
              </button>
            )}
            {isComplete && (
              <button
                onClick={handleNewSession}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New session
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Current step"
              value={
                isComplete
                  ? 'Done'
                  : `${currentStepIndex + 1} / ${project.goldenPath.length}`
              }
            />
            <StatCard label="Misclicks" value={String(errorCount)} highlight={errorCount > 0} />
            <StatCard label="Total clicks" value={String(clickLog.length)} />
          </div>

          {/* Current step */}
          {isLive && project.goldenPath[currentStepIndex] && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Participant is on
              </p>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {currentStepIndex + 1}
                </span>
                <p className="text-gray-900 font-medium text-sm">
                  {project.goldenPath[currentStepIndex].label || 'Unlabeled step'}
                </p>
              </div>
            </div>
          )}

          {/* Inline report after session ends */}
          {isComplete && liveSession && (
            <InlineReport project={project} session={liveSession} />
          )}

          {/* Click log (live) */}
          {isLive && clickLog.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Click log ({clickLog.length})
              </p>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Step', 'Time', 'Result'].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-widest"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...clickLog].reverse().slice(0, 20).map((click, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-2 text-gray-700 text-xs">
                          {project.goldenPath[click.stepIndex]?.label ||
                            `Step ${click.stepIndex + 1}`}
                        </td>
                        <td className="px-4 py-2 text-gray-500 text-xs font-mono">
                          {formatMs(click.timestamp)}
                        </td>
                        <td className="px-4 py-2">
                          {click.correct ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              Correct
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              Misclick
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {isLive && clickLog.length === 0 && (
            <div className="text-center py-8">
              <Circle className="w-6 h-6 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Waiting for first click…</p>
              <p className="text-gray-300 text-xs mt-0.5">Updates every 2 seconds.</p>
            </div>
          )}

          {/* Live dashboard link — visible once session is active */}
          {isLive && (
            <div className="pt-6 border-t border-gray-100 space-y-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-0.5">Share live dashboard</p>
                <p className="text-xs text-gray-400">Anyone with this link can follow along in real time.</p>
              </div>
              <LinkRow
                label="Live dashboard"
                link={moderatorLink}
                copied={copied === 'moderator'}
                onCopy={() => copyLink('moderator')}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InlineReport({
  project,
  session,
}: {
  project: Project;
  session: SessionRecord;
}) {
  const { clickLog, startTime, endTime } = session;
  const duration = endTime && startTime ? endTime - startTime : 0;
  const totalErrors = clickLog.filter((c) => !c.correct).length;

  function downloadCSV() {
    const dateStr = new Date(session.createdAt).toISOString().slice(0, 10);
    const projectSlug = project.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    const labelSlug = session.participantLabel.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const filename = `${projectSlug}_${labelSlug}_${dateStr}.csv`;

    const header = 'step_number,step_label,timestamp,time_elapsed_seconds,x,y,correct,error_type';
    const rows = clickLog.map((c) => {
      const lbl = (project.goldenPath[c.stepIndex]?.label ?? '').replace(/"/g, '""');
      const elapsed = startTime ? ((c.timestamp) / 1000).toFixed(1) : '0.0';
      const errorType = c.correct ? '' : 'misclick';
      return `${c.stepIndex + 1},"${lbl}",${startTime ? startTime + c.timestamp : c.timestamp},${elapsed},${c.x.toFixed(2)},${c.y.toFixed(2)},${c.correct},${errorType}`;
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5 pt-4 border-t border-gray-200">
      {/* Header row with finalized badge */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Session report — {session.participantLabel}
        </p>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-medium text-green-700">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Report finalized
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Time on task</p>
          <p className="text-xl font-bold text-gray-900">{formatMs(duration)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Total errors</p>
          <p className={`text-xl font-bold ${totalErrors > 0 ? 'text-red-500' : 'text-gray-900'}`}>
            {totalErrors}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{totalErrors === 0 ? 'Perfect run' : `${totalErrors} misclick${totalErrors !== 1 ? 's' : ''}`}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Total clicks</p>
          <p className="text-xl font-bold text-gray-900">{clickLog.length}</p>
        </div>
      </div>

      <div className="space-y-2">
        {project.goldenPath.map((step, index) => {
          const { summary, allCorrect } = describeStep(index, clickLog);
          return (
            <div
              key={step.stepId}
              className="bg-white border border-gray-200 rounded-xl px-5 py-3 flex items-center gap-4"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  allCorrect ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'
                }`}
              >
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">
                  {step.label || `Step ${index + 1}`}
                </p>
                <p className={`text-xs mt-0.5 ${allCorrect ? 'text-green-600' : 'text-red-500'}`}>
                  {summary}
                </p>
              </div>
              {allCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Download CSV — bottom of report */}
      <div className="pt-2">
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </div>
    </div>
  );
}

function LinkRow({
  label,
  link,
  copied,
  onCopy,
}: {
  label: string;
  link: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 font-medium w-32 flex-shrink-0">{label}</span>
      <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-gray-700 truncate">
        {link}
      </code>
      <button
        onClick={onCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
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
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-4">
      <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${highlight ? 'text-red-500' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}
