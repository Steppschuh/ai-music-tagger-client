import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/tagger/AppHeader";
import { DropZone } from "@/components/tagger/DropZone";
import { FileQueueList } from "@/components/tagger/FileQueueList";
import { StatusBar } from "@/components/tagger/StatusBar";
import { ProcessingView } from "@/components/tagger/ProcessingView";
import { ResultsView } from "@/components/tagger/ResultsView";
import { SettingsPanel } from "@/components/tagger/SettingsPanel";
import { useFileQueue } from "@/hooks/useFileQueue";
import { useProcessing } from "@/hooks/useProcessing";
import { useSettings } from "@/hooks/useSettings";

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, updateSetting } = useSettings();

  const {
    files,
    addFiles,
    removeFile,
    updateFile,
    clearFiles,
    resetStatuses,
    pendingCount,
  } = useFileQueue();

  const {
    view,
    isProcessing,
    currentFileName,
    lastInsight,
    percentage,
    currentIndex,
    estimateTimeRemaining,
    startProcessing,
    stopProcessing,
    resetToStart,
  } = useProcessing({ files, updateFile });

  const handleNewBatch = () => {
    clearFiles();
    resetToStart();
  };

  const statusLabel = isProcessing
    ? "PROCESSING"
    : view === "results"
      ? "COMPLETE"
      : "READY";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-primary/5">
        {/* Header */}
        <AppHeader onSettingsClick={() => setSettingsOpen(true)} />

        {/* Main content area */}
        <div className="p-5">
          {view === "start" && (
            <>
              <DropZone onFilesAdded={addFiles} />
              <FileQueueList
                files={files}
                onRemove={removeFile}
                disabled={isProcessing}
              />
              {files.length > 0 && (
                <Button
                  className="mt-4 w-full"
                  onClick={startProcessing}
                  disabled={pendingCount === 0}
                >
                  Process {pendingCount} file{pendingCount !== 1 ? "s" : ""}
                </Button>
              )}
            </>
          )}

          {view === "processing" && (
            <ProcessingView
              currentFileName={currentFileName}
              percentage={percentage}
              estimatedTime={estimateTimeRemaining(currentIndex)}
              lastInsight={lastInsight}
              files={files}
              onStop={stopProcessing}
            />
          )}

          {view === "results" && (
            <ResultsView files={files} onClear={handleNewBatch} />
          )}
        </div>

        {/* Status bar */}
        <StatusBar status={statusLabel} percentage={percentage} />
      </div>

      {/* Settings dialog */}
      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onUpdateSetting={updateSetting}
      />
    </div>
  );
};

export default Index;
