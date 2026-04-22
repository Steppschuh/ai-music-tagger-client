import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropZone } from "@/components/tagger/DropZone";
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
    totalToProcess,
  } = useProcessing({
    files,
    updateFile,
    autoSaveJson: settings.autoSaveJson,
    tagStrategy: settings.tagStrategy,
    commentStrategy: settings.commentStrategy,
  });

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

      {/* Footer sticky at the bottom */}
      <footer className="border-t border-border bg-card-header transition-all duration-300 ease-in-out">
        <StatusBar
          status={statusLabel}
          percentage={percentage}
          onSettingsClick={() => setSettingsOpen(true)}
        />
        <div className="px-4 pb-4">
          <Button
            className="w-full shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            size="lg"
            onClick={startProcessing}
            disabled={pendingCount === 0 || isProcessing || view === "results"}
          >
            {isProcessing 
              ? `Processing ${currentIndex + 1} of ${totalToProcess}...`
              : pendingCount > 0
                ? `Process ${pendingCount} file${pendingCount !== 1 ? "s" : ""}`
                : "Select files to process"}
          </Button>
        </div>
      </footer>

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
