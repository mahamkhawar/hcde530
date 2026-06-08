import { useState, useEffect } from 'react';
import { Project, SessionRecord } from './types';
import { getProjects, saveProject, deleteProject as deleteProjectFromStorage } from './storage';
import { Plus, Clock, ArrowRight, Trash2, ChevronDown, ChevronUp, Flower2 } from 'lucide-react';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface Props {
  onOpenSetup: (id: string) => void;
  onViewReport: (projectId: string, sessionId: string) => void;
}

export default function Dashboard({ onOpenSetup, onViewReport }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects().then((p) => {
      setProjects(p);
      setLoading(false);
    });
  }, []);

  async function createProject() {
    const project: Project = {
      id: uid(),
      name: 'Untitled project',
      createdAt: Date.now(),
      screens: [],
      goldenPath: [],
      sessions: [],
    };
    await saveProject(project);
    setProjects((prev) => [project, ...prev]);
    onOpenSetup(project.id);
  }

  async function removeProject(id: string) {
    await deleteProjectFromStorage(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading projects…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
              <Flower2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Wallflower</h1>
              <p className="text-sm text-gray-400 mt-0.5">Usability testing partner</p>
            </div>
          </div>
          <button
            onClick={createProject}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New project
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Welcome section — always visible */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Wallflower</h2>
          <p className="text-base text-gray-500 mt-2">Usability testing, without the manual work.</p>
          <div className="grid grid-cols-3 gap-8 mt-8">
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Set up</p>
              <p className="text-sm text-gray-500 leading-relaxed">Upload your prototype screens, define the expected path, and set clickable targets for each step.</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Run</p>
              <p className="text-sm text-gray-500 leading-relaxed">Send participants a session link. Their clicks are captured automatically as they move through your prototype.</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Report</p>
              <p className="text-sm text-gray-500 leading-relaxed">When the session ends, get an instant breakdown of correct steps, misclicks, and time on task — ready to export.</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6">No plugins. No recordings. Just structured click data.</p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium text-sm">No projects yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Create a project to upload screens and run a usability test.
            </p>
            <button
              onClick={createProject}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New project
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Recent projects
            </p>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => onOpenSetup(project.id)}
                onViewReport={onViewReport}
                onDelete={() => removeProject(project.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProjectCard({
  project,
  onEdit,
  onViewReport,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onViewReport: (projectId: string, sessionId: string) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const completedSessions = project.sessions.filter((s) => s.status === 'complete');
  const stepCount = project.goldenPath.length;
  const screenCount = project.screens.length;
  const hasCompletedSessions = completedSessions.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
      <div className="px-5 py-4 flex items-center gap-4 group">
        {screenCount > 0 ? (
          <div className="flex -space-x-1.5 flex-shrink-0">
            {project.screens.slice(0, 3).map((s) => (
              <img
                key={s.id}
                src={s.imageDataUrl}
                className="w-8 h-8 rounded object-cover border-2 border-white"
                alt=""
              />
            ))}
            {screenCount > 3 && (
              <div className="w-8 h-8 rounded border-2 border-white bg-gray-100 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-gray-500">+{screenCount - 3}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">{project.name}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock className="w-3 h-3" />
              {date}
            </span>
            {stepCount > 0 && (
              <span className="text-gray-400 text-xs">
                {stepCount} step{stepCount !== 1 ? 's' : ''}
              </span>
            )}
            {completedSessions.length > 0 && (
              <span className="text-green-600 text-xs font-medium">
                {completedSessions.length} session{completedSessions.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {hasCompletedSessions && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
            >
              View sessions
              {expanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
          <button
            onClick={onEdit}
            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {stepCount > 0 ? 'Edit' : 'Set up'}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {expanded && hasCompletedSessions && (
        <div className="border-t border-gray-100">
          {completedSessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onViewReport={() => onViewReport(project.id, session.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionRow({
  session,
  onViewReport,
}: {
  session: SessionRecord;
  onViewReport: () => void;
}) {
  const date = new Date(session.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const errorCount = session.clickLog.filter((c) => !c.correct).length;

  return (
    <div className="px-5 py-3 flex items-center gap-4 bg-gray-50 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-semibold text-gray-600">
          {session.participantLabel.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{session.participantLabel}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {date}
          {errorCount > 0 && (
            <span className="ml-2 text-red-400">
              {errorCount} misclick{errorCount !== 1 ? 's' : ''}
            </span>
          )}
          {errorCount === 0 && session.clickLog.length > 0 && (
            <span className="ml-2 text-green-500">Perfect run</span>
          )}
        </p>
      </div>
      <button
        onClick={onViewReport}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
      >
        View report
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
