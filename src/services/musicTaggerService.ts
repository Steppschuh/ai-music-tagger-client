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
  const { rapidApiKey } = getSettings();

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

  const apiUrl = `${API_BASE_URL}/analyze`;
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
