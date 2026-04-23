import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/tagger/AppHeader";
import { DropZone } from "@/components/tagger/DropZone";
import { StatusBar } from "@/components/tagger/StatusBar";
import { ProcessingView } from "@/components/tagger/ProcessingView";
import { ResultsView } from "@/components/tagger/ResultsView";
import { SettingsPanel } from "@/components/tagger/SettingsPanel";
import { useFileQueue } from "@/hooks/useFileQueue";
import { useProcessing } from "@/hooks/useProcessing";
import { useSettings } from "@/hooks/useSettings";
import { RotateCcw, Loader2, Play, X } from "lucide-react";

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

  // Derive the single action button's state
  const footerButton = (() => {
    if (view === "processing") {
      return {
        label: "Cancel",
        icon: <X className="mr-2 h-4 w-4" />,
        onClick: stopProcessing,
        variant: "destructive" as const,
        disabled: false,
      };
    }
    if (view === "results") {
      return {
        label: "New Batch",
        icon: <RotateCcw className="mr-2 h-4 w-4" />,
        onClick: handleNewBatch,
        variant: "secondary" as const,
        disabled: false,
      };
    }
    // view === "start"
    return {
      label:
        pendingCount > 0
          ? `Process ${pendingCount} file${pendingCount !== 1 ? "s" : ""}`
          : "Drop files to begin",
      icon: isProcessing ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Play className="mr-2 h-4 w-4" />
      ),
      onClick: startProcessing,
      variant: "default" as const,
      disabled: pendingCount === 0,
    };
  })();

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Header */}
      <AppHeader onSettingsClick={() => setSettingsOpen(true)} />

      {/* Main content area — grows to fill */}
      <div className="flex min-h-0 flex-1 flex-col p-5">
        {view === "start" && <DropZone onFilesAdded={addFiles} />}

        {view === "processing" && (
          <ProcessingView
            currentFileName={currentFileName}
            percentage={percentage}
            estimatedTime={estimateTimeRemaining(currentIndex)}
            lastInsight={lastInsight}
            files={files}
          />
        )}

        {view === "results" && <ResultsView files={files} />}
      </div>

      {/* Footer — action button + status bar */}
      <div className="border-t border-border bg-card px-5 py-3 flex flex-col gap-2">
        <Button
          className="w-full"
          variant={footerButton.variant}
          onClick={footerButton.onClick}
          disabled={footerButton.disabled}
        >
          {footerButton.icon}
          {footerButton.label}
        </Button>
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
