import { useState, useRef, useEffect } from 'react';
import { Project, GoldenPathStep, SessionRecord } from './types';
import { getProject, saveProject } from './storage';
import ScreenUpload from './ScreenUpload';
import HotspotEditor from './HotspotEditor';
import SessionHub from './SessionHub';
import { ArrowLeft } from 'lucide-react';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface Props {
  projectId: string;
  onBack: () => void;
}

export default function SetupMode({ projectId, onBack }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getProject(projectId).then((p) => {
      setProject(p);
      setLoading(false);
    });
  }, [projectId]);

  function updateProject(updated: Project) {
    setProject(updated);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveProject(updated);
    }, 400);
  }

  function goToStep2() {
    if (!project) return;
    let updated = project;
    if (project.goldenPath.length === 0 && project.screens.length > 0) {
      const steps: GoldenPathStep[] = project.screens.map((screen) => ({
        stepId: uid(),
        screenId: screen.id,
        label: screen.label,
        hotspot: null,
      }));
      updated = { ...project, goldenPath: steps };
      updateProject(updated);
    }
    setStep(2);
  }

  function goToStep3() {
    if (!project) return;
    const completedCount = project.sessions.filter((s) => s.status === 'complete').length;
    const newSession: SessionRecord = {
      id: uid(),
      participantLabel: `P${completedCount + 1}`,
      createdAt: Date.now(),
      startTime: null,
      endTime: null,
      status: 'pending',
      clickLog: [],
    };
    // Replace any pending session with the new one, keep active/complete
    const sessions = [
      ...project.sessions.filter((s) => s.status !== 'pending'),
      newSession,
    ];
    const updated = { ...project, sessions };
    saveProject(updated);
    setProject(updated);
    setActiveSessionId(newSession.id);
    setStep(3);
  }

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading project…</p>
      </div>
    );
  }

  const canGoToStep2 = project.screens.length > 0 && project.name.trim().length > 0;
  const canGoToStep3 =
    project.goldenPath.length > 0 && project.goldenPath.every((s) => s.hotspot !== null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <button
              onClick={() => setStep(1)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                step === 1 ? 'bg-gray-900 text-white' : 'hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              1 · Upload screens
            </button>
            <span>→</span>
            <button
              onClick={canGoToStep2 ? goToStep2 : undefined}
              disabled={!canGoToStep2}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors disabled:opacity-30 ${
                step === 2
                  ? 'bg-gray-900 text-white'
                  : 'hover:text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed'
              }`}
            >
              2 · Define golden path
            </button>
            <span>→</span>
            <button
              onClick={canGoToStep3 ? goToStep3 : undefined}
              disabled={!canGoToStep3}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors disabled:opacity-30 ${
                step === 3
                  ? 'bg-gray-900 text-white'
                  : 'hover:text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed'
              }`}
            >
              3 · Session in progress
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {step === 1 && (
              <button
                onClick={goToStep2}
                disabled={!canGoToStep2}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Next →
              </button>
            )}
            {step === 2 && (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={goToStep3}
                  disabled={!canGoToStep3}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Continue →
                </button>
              </>
            )}
            {step === 3 && (
              <button
                onClick={() => setStep(2)}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Step helper text */}
      <div className="bg-white border-b border-gray-100 px-6 py-2.5">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-gray-400">
            {step === 1 && 'Upload the screens from your prototype in the order a participant would encounter them. You can reorder them by dragging.'}
            {step === 2 && 'Draw a hotspot on each screen to mark the correct click target. This is what the tool will measure participant clicks against.'}
            {step === 3 && 'Share the participant link when you\'re ready to begin. Start the session once your participant has the link open.'}
          </p>
        </div>
      </div>

      <div className="flex-1">
        {step === 1 && <ScreenUpload project={project} onUpdate={updateProject} />}
        {step === 2 && <HotspotEditor project={project} onUpdate={updateProject} />}
        {step === 3 && activeSessionId && (
          <SessionHub
            project={project}
            activeSessionId={activeSessionId}
            onProjectChange={(p) => setProject(p)}
            onNewSession={(updatedProject, newSessionId) => {
              setProject(updatedProject);
              setActiveSessionId(newSessionId);
            }}
          />
        )}
      </div>
    </div>
  );
}
