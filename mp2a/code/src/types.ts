export interface Screen {
  id: string;
  imageDataUrl: string;
  label: string;
}

export interface Hotspot {
  x: number;       // % of image width
  y: number;       // % of image height
  width: number;   // % of image width
  height: number;  // % of image height
}

export interface GoldenPathStep {
  stepId: string;
  screenId: string;
  label: string;
  hotspot: Hotspot | null;
}

export interface ClickEvent {
  timestamp: number;
  x: number;       // % of image width
  y: number;       // % of image height
  stepIndex: number;
  correct: boolean;
}

export interface SessionRecord {
  id: string;
  participantLabel: string;
  createdAt: number;
  startTime: number | null;
  endTime: number | null;
  status: 'pending' | 'active' | 'complete';
  clickLog: ClickEvent[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  screens: Screen[];
  goldenPath: GoldenPathStep[];
  sessions: SessionRecord[];
}
