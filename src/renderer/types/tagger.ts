import type { AnalysisResult } from '../../shared/types';

export type FileStatus = "pending" | "analyzing" | "completed" | "error";

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

export interface SettingsState {
  rapidApiKey: string;
  autoSaveJson: boolean;
  tagStrategy: "keep" | "merge" | "overwrite";
}

export const SUPPORTED_FORMATS = [".mp3", ".flac", ".wav", ".aiff", ".m4a"];
