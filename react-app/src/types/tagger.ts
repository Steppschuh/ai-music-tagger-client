export type FileStatus = "pending" | "analyzing" | "completed" | "error";

export interface QueuedFile {
  id: string;
  file: File;
  name: string;
  status: FileStatus;
  result?: TagResult;
  error?: string;
}

export interface TagResult {
  genre: string;
  subGenre: string;
  mood: string;
  bpm: number;
  key: string;
  energy: number; // 1-10
  insight: string; // fun AI comment
}

export type AppView = "start" | "processing" | "results";

export interface ProcessingState {
  currentFileIndex: number;
  totalFiles: number;
  percentage: number;
  estimatedTimeRemaining: string;
  currentFileName: string;
  lastInsight: string | null;
}

export interface SettingsState {
  rapidApiKey: string;
  autoSaveJson: boolean;
  tagStrategy: "keep" | "merge" | "overwrite";
}

export const SUPPORTED_FORMATS = [".mp3", ".flac", ".wav", ".aiff"];

export const ACCEPTED_MIME_TYPES = [
  "audio/mpeg",
  "audio/flac",
  "audio/wav",
  "audio/x-wav",
  "audio/aiff",
  "audio/x-aiff",
];
