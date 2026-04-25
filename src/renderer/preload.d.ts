import type { AnalysisResult, SettingsState } from '../shared/types';

export interface ElectronAPI {
  analyzeFile: (filePath: string, prompt?: string) => Promise<AnalysisResult>;
  testApiKey: (apiKey: string) => Promise<{
    requestsRemaining?: number;
    requestsLimit?: number;
    requestsReset?: number;
    valid: boolean;
    message?: string;
  }>;
  readTags: (filePath: string) => Promise<unknown>;
  writeTags: (
    filePath: string,
    metadata: unknown,
    mergeStrategy?: string
  ) => Promise<void>;
  writeTagsFromAnalysis: (
    filePath: string,
    analysis: unknown,
    mergeStrategy?: string,
    commentStrategy?: string
  ) => Promise<void>;
  readAnalysisFromFile: (filePath: string) => Promise<AnalysisResult | null>;
  hasBeenAnalyzed: (filePath: string) => Promise<boolean>;
  writeAnalysisToFile: (filePath: string, analysis: unknown) => Promise<string>;
  selectFiles: () => Promise<string[]>;
  selectDirectory: () => Promise<string[]>;
  expandPaths: (paths: string[]) => Promise<string[]>;
  getPathForFile: (file: File) => string;
  getSettings: () => Promise<SettingsState>;
  setSettings: (settings: SettingsState) => Promise<void>;
  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};
