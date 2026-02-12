import { Music, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onSettingsClick: () => void;
}

export function AppHeader({ onSettingsClick }: AppHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-t-lg bg-card-header px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Music className="h-4 w-4 text-primary-foreground" />
        </div>
        <h1 className="text-sm font-semibold text-foreground">AI Music Tagger</h1>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onSettingsClick}
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => undefined}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
