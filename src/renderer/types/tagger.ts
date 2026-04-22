import type { AnalysisResult, SettingsState, CommentStrategy } from '../../shared/types';
export type { SettingsState, CommentStrategy };

export type FileStatus = "pending" | "analyzing" | "writing-tags" | "completed" | "error";

export interface QueuedFile {
  id: string;
  filePath: string;
  name: string;
  status: FileStatus;
  result?: AnalysisResult;
  error?: string;
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

export const SUPPORTED_FORMATS = [".mp3", ".flac", ".wav", ".aiff", ".m4a", ".aac", ".ogg", ".opus", ".wma"];
