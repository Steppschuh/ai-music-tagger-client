import { useState, useCallback } from "react";
import type { QueuedFile } from "@/types/tagger";
import { SUPPORTED_FORMATS } from "@/types/tagger";
import { hasBeenAnalyzed } from "@/services/taggerService";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function isAudioFile(filePath: string): boolean {
  const ext = "." + filePath.split(".").pop()?.toLowerCase();
  return SUPPORTED_FORMATS.includes(ext);
}

export function useFileQueue() {
  const [files, setFiles] = useState<QueuedFile[]>([]);

  const addFiles = useCallback(async (paths: string[], skipAnalyzed = false) => {
    const audioPaths = paths.filter(isAudioFile);
    let finalPaths = audioPaths;
    let skippedPaths: string[] = [];

    if (skipAnalyzed && window.api) {
      // Check which files have already been analyzed
      const statuses = await Promise.all(
        audioPaths.map(async (p) => {
          const analyzed = await hasBeenAnalyzed(p);
          return { path: p, isAnalyzed: analyzed };
        })
      );
      finalPaths = statuses.filter(s => !s.isAnalyzed).map(s => s.path);
      skippedPaths = statuses.filter(s => s.isAnalyzed).map(s => s.path);
    }

    const queued: QueuedFile[] = finalPaths.map((filePath) => ({
      id: generateId(),
      filePath,
      name: filePath.split(/[/\\]/).pop() ?? filePath,
      status: "pending",
    }));
    
    setFiles((prev) => {
      // Avoid adding duplicates
      const existingPaths = new Set(prev.map(f => f.filePath));
      const newFiles = queued.filter(f => !existingPaths.has(f.filePath));
      return [...prev, ...newFiles];
    });
    
    return {
      added: queued.length,
      skipped: skippedPaths.length,
      skippedPaths
    };
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<QueuedFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const resetStatuses = useCallback(() => {
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        status: "pending" as const,
        result: undefined,
        error: undefined,
      }))
    );
  }, []);

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const completedCount = files.filter((f) => f.status === "completed").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return {
    files,
    addFiles,
    removeFile,
    updateFile,
    clearFiles,
    resetStatuses,
    pendingCount,
    completedCount,
    errorCount,
  };
}
