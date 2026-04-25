import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropZone } from "@/components/tagger/DropZone";
import { StatusBar } from "@/components/tagger/StatusBar";
import { ProcessingView } from "@/components/tagger/ProcessingView";
import { ResultsView } from "@/components/tagger/ResultsView";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SettingsPanel } from "@/components/tagger/SettingsPanel";
import { useFileQueue } from "@/hooks/useFileQueue";
import { useProcessing } from "@/hooks/useProcessing";
import { useSettings } from "@/hooks/useSettings";

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [skippedPathsToReanalyze, setSkippedPathsToReanalyze] = useState<string[]>([]);
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

  const handleAddFiles = async (paths: string[]) => {
    const { added, skipped, skippedPaths } = await addFiles(paths, settings.skipAlreadyAnalyzed);
    
    if (skipped > 0 && skippedPaths) {
      if (added === 0) {
        setSkippedPathsToReanalyze(skippedPaths);
      } else {
        toast.info(`Skipped ${skipped} already analyzed file${skipped !== 1 ? 's' : ''}.`);
      }
    }
  };

  const handleReanalyzeSkipped = async () => {
    const paths = [...skippedPathsToReanalyze];
    setSkippedPathsToReanalyze([]);
    await addFiles(paths, false);
  };

  const handleStartClick = () => {
    if (!settings.rapidApiKey) {
      setApiKeyDialogOpen(true);
      return;
    }
    startProcessing();
  };

  const statusLabel = isProcessing
    ? "PROCESSING"
    : view === "results"
      ? "COMPLETE"
      : "READY";

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Main content area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
          {view === "start" && (
            <>
              <DropZone 
                onFilesAdded={handleAddFiles} 
                onSettingsClick={() => setSettingsOpen(true)}
              />
            </>
          )}

          {view === "processing" && (
            <ProcessingView
              currentFileName={currentFileName}
              estimatedTime={estimateTimeRemaining(currentIndex)}
              lastInsight={lastInsight}
              files={files}
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
        />
        <div className="px-4 pb-4">
          <Button
            className="w-full shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            size="lg"
            onClick={view === "results" ? handleNewBatch : handleStartClick}
            disabled={isProcessing || (view !== "results" && pendingCount === 0)}
          >
            {view === "results" 
              ? "New Batch"
              : isProcessing 
                ? `Analyzing ${currentIndex + 1} of ${totalToProcess}...`
                : pendingCount > 0
                  ? `Analyze ${pendingCount} file${pendingCount !== 1 ? "s" : ""}`
                  : "Select files to analyze"}
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

      {/* All Skipped Dialog */}
      <Dialog open={skippedPathsToReanalyze.length > 0} onOpenChange={(open) => !open && setSkippedPathsToReanalyze([])}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Re-analyze {skippedPathsToReanalyze.length} file{skippedPathsToReanalyze.length !== 1 ? 's' : ''}?
            </DialogTitle>
            <DialogDescription>
              These files have already been analyzed.
              You can change this default behavior in the settings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSkippedPathsToReanalyze([])}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleReanalyzeSkipped}
            >
              Re-analyze
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Key Required Dialog */}
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              API Key Required
            </DialogTitle>
            <DialogDescription>
              Analysing audio files using powerfull AI models consumes a lot of resources and is therfore rate limited.
              To authorize analysis requests, please provide your API key.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 sm:gap-0 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (window.api) {
                  window.api.openExternal("https://ai-music-tagger.web.app/#get-started");
                }
              }}
            >
              Get an API Key
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => {
                setApiKeyDialogOpen(false);
                setSettingsOpen(true);
              }}
            >
              Enter API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
