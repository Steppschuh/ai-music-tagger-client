import { AnalysisResult } from "../shared/types";
import { AUDIO_EXTENSIONS } from "../shared/types";
import * as fs from "fs";
import * as path from "path";
// @ts-expect-error - node-id3 may not have TypeScript types
import NodeID3 from "node-id3";
import {
  transformAnalysisToMetadata as transformToMetadata,
  mergeMetadata as mergeMetadataFields,
  prepareMetadataForWriting,
  MergeStrategy,
  CommentStrategy,
} from "./id3MetadataHelpers";

import { getSettings } from "./settingsService";

export async function hasBeenAnalyzed(audioPath: string): Promise<boolean> {
  const isAnalyzed = await readAnalysisFromFile(audioPath);
  if (isAnalyzed) return true;

  try {
    const metadata = await readMetadata(audioPath);
    if (metadata) {
      if (metadata.encodedBy === "AI Music Tagger" || metadata.encoder === "AI Music Tagger") {
        return true;
      }
      if (metadata.userDefinedText) {
        const txxx = Array.isArray(metadata.userDefinedText)
          ? metadata.userDefinedText
          : [metadata.userDefinedText];
        if (txxx.some((t: any) => t.description === "Schema Version")) {
          return true;
        }
      }
    }
  } catch (err) {
    // Ignore error reading metadata
  }
  return false;
}

const RAPIDAPI_HOST = "ai-music-analyst.p.rapidapi.com";

const API_BASE_URL =
  process.env.NODE_ENV === "dev"
    ? "http://localhost:3000"
    : `https://${RAPIDAPI_HOST}`;


const MAX_AUDIO_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function validateFilePath(filePath: string): string {
  const resolved = path.resolve(filePath);
  if (!path.isAbsolute(resolved)) {
    throw new Error("Invalid file path: must be absolute");
  }
  const ext = path.extname(resolved).toLowerCase();
  if (!AUDIO_EXTENSIONS.includes(ext)) {
    throw new Error(
      `Invalid file type: ${ext}. Supported: ${AUDIO_EXTENSIONS.join(", ")}`
    );
  }
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }
  return resolved;
}

function validateFileSize(filePath: string): void {
  const stats = fs.statSync(filePath);
  if (stats.size > MAX_AUDIO_FILE_SIZE) {
    throw new Error(
      `Audio file size (${stats.size}) exceeds maximum allowed (${MAX_AUDIO_FILE_SIZE})`
    );
  }
}

export async function analyzeSong(
  audioPath: string,
  prompt?: string
): Promise<AnalysisResult> {
  const resolved = validateFilePath(audioPath);
  validateFileSize(resolved);

  const audioBuffer = fs.readFileSync(resolved);
  const audioBlob = new Blob([audioBuffer]);
  const formData = new FormData();
  formData.append("audio", audioBlob, path.basename(resolved));
  if (prompt) {
    formData.append("prompt", prompt);
  }

  const isLocalDev = process.env.NODE_ENV === "dev";
  const { rapidApiKey, mockAnalysis } = getSettings();
  // Guard: mock mode is only honoured in dev builds, never in production.
  const useMock = isLocalDev && mockAnalysis;

  if (!isLocalDev && !rapidApiKey) {
    throw new Error(
      "No RapidAPI key configured. Please add your key in Settings."
    );
  }

  const headers: Record<string, string> = {};
  if (!isLocalDev) {
    headers["x-rapidapi-host"] = RAPIDAPI_HOST;
    headers["x-rapidapi-key"] = rapidApiKey;
  }

  let apiUrl = `${API_BASE_URL}/analyze`;
  if (useMock) {
    // Route to the mock endpoint to avoid spending real API tokens during dev.
    apiUrl += `Mock`;
  }
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Backend request failed with status ${response.status}${
        body ? `: ${body}` : ""
      }`
    );
  }

  return response.json();
}

export interface QuotaInfo {
  requestsRemaining?: number;
  requestsLimit?: number;
  requestsReset?: number;
  valid: boolean;
  message?: string;
}

export async function testApiKey(apiKey: string): Promise<QuotaInfo> {
  const isLocalDev = process.env.NODE_ENV === "dev";
  const { mockAnalysis } = getSettings();
  const useMock = isLocalDev && mockAnalysis;
  
  if (!apiKey) {
    return { valid: false, message: "No API key provided." };
  }
  
  const headers: Record<string, string> = {
    "x-rapidapi-host": RAPIDAPI_HOST,
    "x-rapidapi-key": apiKey,
  };
  
  let apiUrl = `${API_BASE_URL}/analyze`;
  if (useMock) {
    apiUrl += `Mock`;
  }
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
    });
    
    if (response.status === 403) {
      const body = await response.json().catch(() => ({}));
      return { 
        valid: false, 
        message: body.message || "Invalid API key or not subscribed to the API." 
      };
    }
    
    const requestsLimit = response.headers.get("x-ratelimit-requests-limit");
    const requestsRemaining = response.headers.get("x-ratelimit-requests-remaining");
    const requestsReset = response.headers.get("x-ratelimit-requests-reset");
    
    return {
      valid: true,
      requestsLimit: requestsLimit ? parseInt(requestsLimit, 10) : undefined,
      requestsRemaining: requestsRemaining ? parseInt(requestsRemaining, 10) : undefined,
      requestsReset: requestsReset ? parseInt(requestsReset, 10) : undefined,
      message: "API key is valid."
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { valid: false, message: `Request failed: ${msg}` };
  }
}

export async function readMetadata(audioPath: string): Promise<any> {
  const resolved = validateFilePath(audioPath);
  return NodeID3.read(resolved);
}

export async function readAnalysisFromFile(
  audioPath: string
): Promise<AnalysisResult | null> {
  const resolved = path.resolve(audioPath);
  const parsed = path.parse(resolved);
  const analysisFilename = path.join(
    parsed.dir,
    `${parsed.name}-analysis.json`
  );

  if (!fs.existsSync(analysisFilename)) {
    return null;
  }

  const analysisContent = fs.readFileSync(analysisFilename, "utf-8");
  return JSON.parse(analysisContent) as AnalysisResult;
}

export async function writeAnalysisToFile(
  audioPath: string,
  analysis: AnalysisResult
): Promise<string> {
  const resolved = validateFilePath(audioPath);
  const parsed = path.parse(resolved);
  const analysisFilename = path.join(
    parsed.dir,
    `${parsed.name}-analysis.json`
  );

  fs.writeFileSync(analysisFilename, JSON.stringify(analysis, null, 2));
  return analysisFilename;
}

export function transformAnalysisToMetadata(
  analysis: AnalysisResult,
  commentStrategy: CommentStrategy = "tags+summary"
): any {
  return transformToMetadata(analysis, commentStrategy);
}

export function mergeMetadata(
  existing: any,
  newMetadata: any,
  strategy: MergeStrategy = "keep-existing"
): any {
  return mergeMetadataFields(existing, newMetadata, strategy);
}

export async function writeMetadata(
  audioPath: string,
  metadata: any,
  strategy: MergeStrategy = "keep-existing"
): Promise<void> {
  const resolved = validateFilePath(audioPath);

  const existingTags = NodeID3.read(resolved);
  const tagsToWrite = prepareMetadataForWriting(
    existingTags,
    metadata,
    strategy
  );

  if (
    tagsToWrite.userDefinedText &&
    Array.isArray(tagsToWrite.userDefinedText) &&
    tagsToWrite.userDefinedText.length === 0
  ) {
    delete tagsToWrite.userDefinedText;
  }

  const success = NodeID3.write(tagsToWrite, resolved);

  if (!success) {
    throw new Error("Failed to write metadata to file");
  }
}

export function findAudioFiles(dirPath: string): string[] {
  const audioFiles: string[] = [];
  const resolvedPath = path.resolve(dirPath);

  function walkDir(currentPath: string): void {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;

        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (AUDIO_EXTENSIONS.includes(ext)) {
            audioFiles.push(fullPath);
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Could not read directory ${currentPath}: ${msg}`);
    }
  }

  walkDir(resolvedPath);
  return audioFiles;
}

export function expandPaths(paths: string[]): string[] {
  const allFiles: string[] = [];
  for (const p of paths) {
    if (!p) continue;
    try {
      const resolved = path.resolve(p);
      if (!fs.existsSync(resolved)) continue;

      const stats = fs.statSync(resolved);
      if (stats.isDirectory()) {
        allFiles.push(...findAudioFiles(resolved));
      } else if (stats.isFile()) {
        const ext = path.extname(resolved).toLowerCase();
        if (AUDIO_EXTENSIONS.includes(ext)) {
          allFiles.push(resolved);
        }
      }
    } catch (err) {
      console.warn(`Failed to process path ${p}:`, err);
    }
  }
  return [...new Set(allFiles)]; // Remove duplicates
}
