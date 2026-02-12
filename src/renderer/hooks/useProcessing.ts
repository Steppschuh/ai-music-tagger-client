import { useState, useCallback } from "react";
import type { QueuedFile, AppView } from "@/types/tagger";
import { analyzeTrack, writeAnalysisToFile } from "@/services/taggerService";

interface UseProcessingProps {
  files: QueuedFile[];
  updateFile: (id: string, updates: Partial<QueuedFile>) => void;
  autoSaveJson?: boolean;
}

export function useProcessing({ files, updateFile, autoSaveJson }: UseProcessingProps) {
  const [view, setView] = useState<AppView>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastInsight, setLastInsight] = useState<string | null>(null);
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
      const avgSeconds = 5;
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

    const filesToProcess = files.filter((f) => f.status === "pending");

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      setCurrentIndex(i);
      updateFile(file.id, { status: "analyzing" });

      try {
        const result = await analyzeTrack(file.filePath);
        if (autoSaveJson && window.api) {
          try {
            await writeAnalysisToFile(file.filePath, result);
          } catch (saveErr) {
            console.warn("Failed to auto-save analysis JSON:", saveErr);
          }
        }
        updateFile(file.id, { status: "completed", result });
        setLastInsight(result.summary ?? null);
      } catch (err) {
        updateFile(file.id, {
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    setIsProcessing(false);
    setView("results");
  }, [files, pendingFiles, updateFile, autoSaveJson]);

  const stopProcessing = useCallback(() => {
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
