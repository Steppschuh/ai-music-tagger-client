import type { AnalysisResult } from '../../shared/types';

export async function analyzeTrack(
  filePath: string,
  prompt?: string
): Promise<AnalysisResult> {
  if (!window.api) {
    throw new Error("Electron API not available");
  }
  return window.api.analyzeFile(filePath, prompt);
}

export async function readTags(filePath: string): Promise<unknown> {
  if (!window.api) {
    throw new Error("Electron API not available");
  }
  return window.api.readTags(filePath);
}

export async function writeTags(
  filePath: string,
  metadata: unknown,
  mergeStrategy?: string
): Promise<void> {
  if (!window.api) {
    throw new Error("Electron API not available");
  }
  return window.api.writeTags(filePath, metadata, mergeStrategy);
}

export async function writeTagsFromAnalysis(
  filePath: string,
  analysis: AnalysisResult,
  mergeStrategy?: string,
  commentStrategy?: string
): Promise<void> {
  if (!window.api) {
    throw new Error("Electron API not available");
  }
  return (window.api as any).writeTagsFromAnalysis(filePath, analysis, mergeStrategy, commentStrategy);
}

export async function readAnalysisFromFile(
  filePath: string
): Promise<AnalysisResult | null> {
  if (!window.api) {
    throw new Error("Electron API not available");
  }
  return window.api.readAnalysisFromFile(filePath);
}

export async function hasBeenAnalyzed(filePath: string): Promise<boolean> {
  if (!window.api) {
    throw new Error("Electron API not available");
  }
  return window.api.hasBeenAnalyzed(filePath);
}

export async function writeAnalysisToFile(
  filePath: string,
  analysis: AnalysisResult
): Promise<string> {
  if (!window.api) {
    throw new Error("Electron API not available");
  }
  return window.api.writeAnalysisToFile(filePath, analysis);
}

export async function selectFiles(): Promise<string[]> {
  if (!window.api) {
    throw new Error("Electron API not available");
  }
  return window.api.selectFiles();
}

export async function selectDirectory(): Promise<string[]> {
  if (!window.api) {
    throw new Error("Electron API not available");
  }
  return window.api.selectDirectory();
}
