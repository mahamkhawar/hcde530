import { useEffect, useRef, useState } from 'react';
import { Project, GoldenPathStep, Hotspot } from './types';
import { X, GripVertical, Target } from 'lucide-react';

interface Props {
  project: Project;
  onUpdate: (p: Project) => void;
}

interface DrawState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

function normalizeRect(s: DrawState): Hotspot {
  return {
    x: Math.min(s.startX, s.endX),
    y: Math.min(s.startY, s.endY),
    width: Math.abs(s.endX - s.startX),
    height: Math.abs(s.endY - s.startY),
  };
}

export default function HotspotEditor({ project, onUpdate }: Props) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    project.goldenPath[0]?.stepId ?? null
  );
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // Drawing state — use refs so window handlers always see fresh values
  const isDrawingRef = useRef(false);
  const drawStartRef = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const [preview, setPreview] = useState<Hotspot | null>(null);

  // Keep selectedStepId accessible in window handlers without stale closure
  const selectedStepIdRef = useRef(selectedStepId);
  useEffect(() => {
    selectedStepIdRef.current = selectedStepId;
  }, [selectedStepId]);

  // Keep onUpdate accessible in window handlers
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  });

  useEffect(() => {
    function getCoords(e: MouseEvent): { x: number; y: number } | null {
      if (!imgRef.current) return null;
      const rect = imgRef.current.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
        y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
      };
    }

    function onMouseMove(e: MouseEvent) {
      if (!isDrawingRef.current) return;
      const c = getCoords(e);
      if (!c) return;
      setPreview(
        normalizeRect({ startX: drawStartRef.current.x, startY: drawStartRef.current.y, endX: c.x, endY: c.y })
      );
    }

    function onMouseUp(e: MouseEvent) {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      const c = getCoords(e);
      setPreview(null);
      if (!c || !selectedStepIdRef.current) return;
      const rect = normalizeRect({
        startX: drawStartRef.current.x,
        startY: drawStartRef.current.y,
        endX: c.x,
        endY: c.y,
      });
      if (rect.width < 1 || rect.height < 1) return;
      const p = projectRef.current;
      onUpdateRef.current({
        ...p,
        goldenPath: p.goldenPath.map((s) =>
          s.stepId === selectedStepIdRef.current ? { ...s, hotspot: rect } : s
        ),
      });
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  function handleImgMouseDown(e: React.MouseEvent) {
    if (!imgRef.current) return;
    e.preventDefault();
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    drawStartRef.current = { x, y };
    isDrawingRef.current = true;
    setPreview(null);
  }

  function updateLabel(stepId: string, label: string) {
    onUpdate({
      ...project,
      goldenPath: project.goldenPath.map((s) => (s.stepId === stepId ? { ...s, label } : s)),
    });
  }

  function clearHotspot(stepId: string) {
    onUpdate({
      ...project,
      goldenPath: project.goldenPath.map((s) => (s.stepId === stepId ? { ...s, hotspot: null } : s)),
    });
  }

  function deleteStep(stepId: string) {
    const updated = project.goldenPath.filter((s) => s.stepId !== stepId);
    onUpdate({ ...project, goldenPath: updated });
    if (selectedStepId === stepId) {
      setSelectedStepId(updated[0]?.stepId ?? null);
    }
  }

  function reorderSteps(fromIndex: number, toIndex: number) {
    const steps = [...project.goldenPath];
    const [item] = steps.splice(fromIndex, 1);
    steps.splice(toIndex, 0, item);
    onUpdate({ ...project, goldenPath: steps });
  }

  const steps = project.goldenPath;
  const selectedStep = steps.find((s) => s.stepId === selectedStepId) ?? null;
  const selectedScreen = project.screens.find((s) => s.id === selectedStep?.screenId) ?? null;
  const activeHotspot = preview ?? selectedStep?.hotspot ?? null;

  return (
    <div className="flex" style={{ height: 'calc(100vh - 65px)' }}>
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Golden path
          </p>
          <span className="text-xs text-gray-400">
            {steps.length} step{steps.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {steps.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-8 px-4">
              No steps defined. Go back to step 1 and add screens.
            </p>
          )}
          {steps.map((step, index) => {
            const screen = project.screens.find((s) => s.id === step.screenId);
            const isSelected = step.stepId === selectedStepId;
            return (
              <div
                key={step.stepId}
                draggable
                onDragStart={() => setDraggingIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(index);
                }}
                onDrop={() => {
                  if (draggingIndex !== null && draggingIndex !== index) {
                    reorderSteps(draggingIndex, index);
                  }
                  setDraggingIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDraggingIndex(null);
                  setDragOverIndex(null);
                }}
                onClick={() => setSelectedStepId(step.stepId)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors select-none ${
                  isSelected
                    ? 'bg-gray-100 border border-gray-200'
                    : dragOverIndex === index
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                } ${draggingIndex === index ? 'opacity-40' : ''}`}
              >
                <GripVertical className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 cursor-grab" />
                <span className="text-xs text-gray-400 font-mono w-4 flex-shrink-0 text-right">
                  {index + 1}
                </span>
                {screen && (
                  <img
                    src={screen.imageDataUrl}
                    className="w-9 h-6 object-cover rounded border border-gray-100 flex-shrink-0"
                    alt=""
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate">
                    {step.label || 'Unlabeled step'}
                  </p>
                  {step.hotspot ? (
                    <p className="text-xs text-green-600 font-medium">Hotspot set</p>
                  ) : (
                    <p className="text-xs text-amber-500">No hotspot</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteStep(step.stepId);
                  }}
                  className="p-0.5 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 space-y-1">
          <p className="font-medium text-gray-500">How to define a hotspot</p>
          <p>Select a step, then click and drag on the screen to draw the correct click target.</p>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
        {selectedStep && selectedScreen ? (
          <>
            {/* Step toolbar */}
            <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-4 flex-shrink-0">
              <Target className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={selectedStep.label}
                onChange={(e) => updateLabel(selectedStep.stepId, e.target.value)}
                placeholder="Step label (e.g. Click the Sign Up button)"
                className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none placeholder-gray-400"
              />
              {selectedStep.hotspot && !preview ? (
                <button
                  onClick={() => clearHotspot(selectedStep.stepId)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  Clear hotspot
                </button>
              ) : !selectedStep.hotspot && !preview ? (
                <span className="text-xs text-amber-500 font-medium flex-shrink-0">
                  Draw a rectangle on the image
                </span>
              ) : null}
            </div>

            {/* Image canvas */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8">
              <div
                className="relative inline-block select-none"
                onMouseDown={handleImgMouseDown}
                style={{ cursor: 'crosshair' }}
              >
                <img
                  ref={imgRef}
                  src={selectedScreen.imageDataUrl}
                  alt={selectedScreen.label}
                  className="max-w-full block rounded-lg shadow-xl"
                  style={{ maxHeight: 'calc(100vh - 220px)' }}
                  draggable={false}
                />

                {/* Saved hotspot (green) */}
                {selectedStep.hotspot && !preview && (
                  <div
                    className="absolute border-2 border-green-500 bg-green-500/15 rounded pointer-events-none"
                    style={{
                      left: `${selectedStep.hotspot.x}%`,
                      top: `${selectedStep.hotspot.y}%`,
                      width: `${selectedStep.hotspot.width}%`,
                      height: `${selectedStep.hotspot.height}%`,
                    }}
                  />
                )}

                {/* Drawing preview (blue) */}
                {preview && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500/15 rounded pointer-events-none"
                    style={{
                      left: `${preview.x}%`,
                      top: `${preview.y}%`,
                      width: `${preview.width}%`,
                      height: `${preview.height}%`,
                    }}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Select a step from the sidebar to edit.</p>
          </div>
        )}
      </div>
    </div>
  );
}
