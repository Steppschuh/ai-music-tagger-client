import { useState, useRef, useCallback } from "react";
import type { QueuedFile, AppView } from "@/types/tagger";
import { analyzeTrack } from "@/services/mockTaggerService";

interface UseProcessingProps {
  files: QueuedFile[];
  updateFile: (id: string, updates: Partial<QueuedFile>) => void;
}

export function useProcessing({ files, updateFile }: UseProcessingProps) {
  const [view, setView] = useState<AppView>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastInsight, setLastInsight] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingFiles = files.filter((f) => f.status === "pending");
  const totalToProcess = files.length;
  const processedSoFar = files.filter(
    (f) => f.status === "completed" || f.status === "error"
  ).length;
  const percentage = totalToProcess > 0 ? Math.round((processedSoFar / totalToProcess) * 100) : 0;

  const estimateTimeRemaining = useCallback(
    (idx: number) => {
      const remaining = totalToProcess - idx;
      const avgSeconds = 2; // ~2s per track mock
      const totalSeconds = remaining * avgSeconds;
      if (totalSeconds < 60) return `~${totalSeconds}s`;
      return `~${Math.ceil(totalSeconds / 60)}m`;
    },
    [totalToProcess]
  );

  const startProcessing = useCallback(async () => {
    if (pendingFiles.length === 0) return;

    setView("processing");
    setIsProcessing(true);
    setCurrentIndex(0);
    setLastInsight(null);

    const controller = new AbortController();
    abortRef.current = controller;

    const filesToProcess = files.filter((f) => f.status === "pending");

    for (let i = 0; i < filesToProcess.length; i++) {
      if (controller.signal.aborted) break;

      const file = filesToProcess[i];
      setCurrentIndex(i);
      updateFile(file.id, { status: "analyzing" });

      try {
        const result = await analyzeTrack(file.file, controller.signal);
        updateFile(file.id, { status: "completed", result });
        setLastInsight(result.insight);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          updateFile(file.id, { status: "pending" });
          break;
        }
        updateFile(file.id, {
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    setIsProcessing(false);
    if (!controller.signal.aborted) {
      setView("results");
    }
  }, [files, pendingFiles, updateFile]);

  const stopProcessing = useCallback(() => {
    abortRef.current?.abort();
    setIsProcessing(false);
    setView("start");
  }, []);

  const resetToStart = useCallback(() => {
    setView("start");
    setCurrentIndex(0);
    setLastInsight(null);
  }, []);

  const currentFileName =
    files.filter((f) => f.status === "pending" || f.status === "analyzing")[0]
      ?.name ?? "";

  return {
    view,
    setView,
    isProcessing,
    currentIndex,
    currentFileName,
    lastInsight,
    percentage,
    totalToProcess,
    processedSoFar,
    estimateTimeRemaining,
    startProcessing,
    stopProcessing,
    resetToStart,
  };
}
