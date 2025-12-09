export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface TTSItem {
  id: string;
  text: string;
  date: string; // ISO string
  voice: string;
  duration?: number; // In seconds
}

export type VoiceName = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum AppStatus {
  IDLE = 'idle',
  GENERATING = 'generating',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ERROR = 'error',
}
