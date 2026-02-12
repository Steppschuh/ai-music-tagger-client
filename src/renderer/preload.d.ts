import type { AnalysisResult, SettingsState } from '../shared/types';

export interface ElectronAPI {
  analyzeFile: (filePath: string, prompt?: string) => Promise<AnalysisResult>;
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
  writeAnalysisToFile: (filePath: string, analysis: unknown) => Promise<string>;
  selectFiles: () => Promise<string[]>;
  selectDirectory: () => Promise<string[]>;
  getSettings: () => Promise<SettingsState>;
  setSettings: (settings: SettingsState) => Promise<void>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {};
