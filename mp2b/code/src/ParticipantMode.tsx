import { useEffect, useRef, useState } from 'react';
import { getProjectBySessionId, saveProject } from './storage';
import { Project, SessionRecord, ClickEvent } from './types';

interface Props {
  sessionId: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  correct: boolean;
}

export default function ParticipantMode({ sessionId }: Props) {
  const [projectData, setProjectData] = useState<{
    project: Project;
    sessionRecord: SessionRecord;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const imgRef = useRef<HTMLImageElement>(null);
  const clickLogRef = useRef<ClickEvent[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const rippleIdRef = useRef(0);
  const projectDataRef = useRef<typeof projectData>(null);

  useEffect(() => {
    getProjectBySessionId(sessionId).then((result) => {
      setProjectData(result);
      projectDataRef.current = result;
      startTimeRef.current = Date.now();
      setLoading(false);
    });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading session…</p>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Session not found. Please check your link.</p>
      </div>
    );
  }

  const { project, sessionRecord } = projectData;

  if (project.goldenPath.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm">This session has no steps defined.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-950 border border-green-800 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-green-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-white text-lg font-semibold">Task complete</p>
          <p className="text-gray-500 text-sm mt-1.5">Thank you for your participation.</p>
        </div>
      </div>
    );
  }

  const currentStep = project.goldenPath[stepIndex];
  const currentScreen = project.screens.find((s) => s.id === currentStep?.screenId);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!imgRef.current || !currentStep?.hotspot || !projectDataRef.current) return;
    const { project: p, sessionRecord: sr } = projectDataRef.current;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const { hotspot } = currentStep;
    const correct =
      x >= hotspot.x &&
      x <= hotspot.x + hotspot.width &&
      y >= hotspot.y &&
      y <= hotspot.y + hotspot.height;

    const event: ClickEvent = {
      timestamp: Date.now() - startTimeRef.current,
      x,
      y,
      stepIndex,
      correct,
    };
    clickLogRef.current.push(event);

    const imgRect = imgRef.current.getBoundingClientRect();
    const id = ++rippleIdRef.current;
    const rx = e.clientX - imgRect.left;
    const ry = e.clientY - imgRect.top;
    setRipples((prev) => [...prev, { id, x: rx, y: ry, correct }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);

    const isLastStep = stepIndex >= p.goldenPath.length - 1;
    const updatedSessions = p.sessions.map((s) =>
      s.id === sr.id
        ? {
            ...s,
            clickLog: [...clickLogRef.current],
            ...(correct && isLastStep
              ? { endTime: Date.now(), status: 'complete' as const }
              : {}),
          }
        : s
    );
    saveProject({ ...p, sessions: updatedSessions });

    if (correct) {
      if (isLastStep) {
        setDone(true);
      } else {
        setStepIndex((i) => i + 1);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center overflow-hidden">
      {currentScreen && (
        <div className="relative" onClick={handleClick} style={{ cursor: 'default' }}>
          <img
            ref={imgRef}
            src={currentScreen.imageDataUrl}
            alt=""
            className="block"
            style={{ maxWidth: '100vw', maxHeight: '100vh' }}
            draggable={false}
          />
          {ripples.map((r) => (
            <div
              key={r.id}
              className="absolute pointer-events-none"
              style={{ left: r.x - 16, top: r.y - 16 }}
            >
              <div
                className={`w-8 h-8 rounded-full animate-ping ${
                  r.correct ? 'bg-green-400/50' : 'bg-red-400/50'
                }`}
              />
            </div>
          ))}
        </div>
      )}

      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {project.goldenPath.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i < stepIndex
                ? 'w-2 h-2 bg-green-500'
                : i === stepIndex
                ? 'w-2 h-2 bg-white'
                : 'w-1.5 h-1.5 bg-gray-700 mt-0.5'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
