import { supabase } from './supabase';
import { Project, SessionRecord } from './types';

type Row = {
  id: string;
  name: string;
  created_at: number;
  screens: Project['screens'];
  golden_path: Project['goldenPath'];
  sessions: SessionRecord[];
};

function rowToProject(row: Row): Project {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    screens: row.screens,
    goldenPath: row.golden_path,
    sessions: row.sessions ?? [],
  };
}

function projectToRow(p: Project): Row {
  return {
    id: p.id,
    name: p.name,
    created_at: p.createdAt,
    screens: p.screens,
    golden_path: p.goldenPath,
    sessions: p.sessions,
  };
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(rowToProject);
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToProject(data);
}

export async function getProjectBySessionId(
  sessionId: string
): Promise<{ project: Project; sessionRecord: SessionRecord } | null> {
  const projects = await getProjects();
  for (const project of projects) {
    const sessionRecord = project.sessions.find((s) => s.id === sessionId);
    if (sessionRecord) return { project, sessionRecord };
  }
  return null;
}

export async function saveProject(project: Project): Promise<void> {
  await supabase
    .from('projects')
    .upsert(projectToRow(project), { onConflict: 'id' });
}

export async function deleteProject(id: string): Promise<void> {
  await supabase.from('projects').delete().eq('id', id);
}
