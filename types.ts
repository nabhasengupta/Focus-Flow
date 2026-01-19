export interface Task {
  id: string;
  title: string;
  context?: string; // Meeting notes or context
  dueDate: string | null; // ISO string
  isCompleted: boolean;
  hasMeeting: boolean;
  meetLink?: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum ViewState {
  TASKS = 'TASKS',
  COACH = 'COACH',
  CALENDAR = 'CALENDAR'
}

export enum AudioState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR'
}