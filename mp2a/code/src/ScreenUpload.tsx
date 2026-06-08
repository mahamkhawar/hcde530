import { useRef, useState } from 'react';
import { Project, Screen } from './types';
import { Upload, X, GripVertical } from 'lucide-react';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface Props {
  project: Project;
  onUpdate: (p: Project) => void;
}

export default function ScreenUpload({ project, onUpdate }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  function handleFiles(files: FileList) {
    const readers: Promise<Screen>[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      readers.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: uid(),
              imageDataUrl: e.target?.result as string,
              label: file.name.replace(/\.[^.]+$/, ''),
            });
          };
          reader.readAsDataURL(file);
        })
      );
    }
    Promise.all(readers).then((screens) => {
      onUpdate({ ...project, screens: [...project.screens, ...screens] });
    });
  }

  function removeScreen(id: string) {
    onUpdate({
      ...project,
      screens: project.screens.filter((s) => s.id !== id),
      goldenPath: project.goldenPath.filter((step) => step.screenId !== id),
    });
  }

  function updateScreenLabel(id: string, label: string) {
    onUpdate({
      ...project,
      screens: project.screens.map((s) => (s.id === id ? { ...s, label } : s)),
    });
  }

  function reorder(fromIndex: number, toIndex: number) {
    const screens = [...project.screens];
    const [item] = screens.splice(fromIndex, 1);
    screens.splice(toIndex, 0, item);
    onUpdate({ ...project, screens });
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-7">
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Project name
        </label>
        <input
          type="text"
          value={project.name}
          onChange={(e) => onUpdate({ ...project, name: e.target.value })}
          placeholder="e.g. Checkout flow — v2"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Screens
        </label>
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2.5" />
          <p className="text-sm text-gray-500 font-medium">
            Drop PNG or JPG files here, or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-1">Multiple files supported</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      </div>

      {project.screens.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            {project.screens.length} screen{project.screens.length !== 1 ? 's' : ''} — drag to
            reorder
          </p>
          <div className="space-y-2">
            {project.screens.map((screen, index) => (
              <div
                key={screen.id}
                draggable
                onDragStart={() => setDraggingIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(index);
                }}
                onDrop={() => {
                  if (draggingIndex !== null && draggingIndex !== index) {
                    reorder(draggingIndex, index);
                  }
                  setDraggingIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDraggingIndex(null);
                  setDragOverIndex(null);
                }}
                className={`flex items-center gap-3 bg-white border rounded-xl px-3 py-2.5 transition-all ${
                  dragOverIndex === index ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                } ${draggingIndex === index ? 'opacity-40' : 'opacity-100'}`}
              >
                <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab active:cursor-grabbing" />
                <img
                  src={screen.imageDataUrl}
                  alt={screen.label}
                  className="w-14 h-9 object-cover rounded border border-gray-100 flex-shrink-0"
                />
                <input
                  type="text"
                  value={screen.label}
                  onChange={(e) => updateScreenLabel(screen.id, e.target.value)}
                  className="flex-1 text-sm text-gray-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded px-1 py-0.5"
                />
                <span className="text-xs text-gray-300 font-mono flex-shrink-0">{index + 1}</span>
                <button
                  onClick={() => removeScreen(screen.id)}
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
