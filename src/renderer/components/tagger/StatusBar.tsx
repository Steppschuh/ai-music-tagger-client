import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface StatusBarProps {
  status: string;
  percentage: number;
  onSettingsClick?: () => void;
}

export function StatusBar({ status, percentage, onSettingsClick }: StatusBarProps) {
  return (
    <div className="flex items-center gap-3 bg-card-header px-4 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {status}
      </span>
      <Progress value={percentage} className="h-1.5 flex-1" />
      <span className="text-[10px] font-mono text-muted-foreground">
        {percentage}%
      </span>
      {onSettingsClick && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={onSettingsClick}
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
