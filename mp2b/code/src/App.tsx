import { useState } from 'react';
import Dashboard from './Dashboard';
import SetupMode from './SetupMode';
import ParticipantMode from './ParticipantMode';
import ModeratorMode from './ModeratorMode';
import ReportView from './ReportView';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session');
  const role = params.get('role');

  const [view, setView] = useState<'dashboard' | 'setup' | 'report'>('dashboard');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [reportSessionId, setReportSessionId] = useState<string | null>(null);

  if (sessionId && role === 'participant') {
    return <ParticipantMode sessionId={sessionId} />;
  }
  if (sessionId && role === 'moderator') {
    return <ModeratorMode sessionId={sessionId} />;
  }

  if (view === 'setup' && projectId) {
    return <SetupMode projectId={projectId} onBack={() => setView('dashboard')} />;
  }
  if (view === 'report' && projectId && reportSessionId) {
    return (
      <ReportView
        projectId={projectId}
        sessionId={reportSessionId}
        onBack={() => setView('dashboard')}
      />
    );
  }

  return (
    <Dashboard
      onOpenSetup={(id) => { setProjectId(id); setView('setup'); }}
      onViewReport={(pId, sId) => { setProjectId(pId); setReportSessionId(sId); setView('report'); }}
    />
  );
}
