import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  } = useProcessing({ files, updateFile, autoSaveJson: settings.autoSaveJson });

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
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Main content area */}
      <div className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
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
            <ResultsView files={files} onClear={handleNewBatch} settings={settings} />
          )}
      </div>

      {/* Status bar */}
      <StatusBar
        status={statusLabel}
        percentage={percentage}
        onSettingsClick={() => setSettingsOpen(true)}
      />

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
