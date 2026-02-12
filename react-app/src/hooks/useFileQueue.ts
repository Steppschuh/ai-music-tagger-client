import { useState, useCallback } from "react";
import type { QueuedFile } from "@/types/tagger";
import { ACCEPTED_MIME_TYPES, SUPPORTED_FORMATS } from "@/types/tagger";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function isAudioFile(file: File): boolean {
  if (ACCEPTED_MIME_TYPES.includes(file.type)) return true;
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return SUPPORTED_FORMATS.includes(ext);
}

export function useFileQueue() {
  const [files, setFiles] = useState<QueuedFile[]>([]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const audioFiles = Array.from(newFiles).filter(isAudioFile);
    const queued: QueuedFile[] = audioFiles.map((file) => ({
      id: generateId(),
      file,
      name: file.name,
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...queued]);
    return queued.length;
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
