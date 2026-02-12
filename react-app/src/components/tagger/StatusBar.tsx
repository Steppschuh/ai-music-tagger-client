import { Progress } from "@/components/ui/progress";

interface StatusBarProps {
  status: string;
  percentage: number;
}

export function StatusBar({ status, percentage }: StatusBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-b-lg bg-card-header px-4 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {status}
      </span>
      <Progress value={percentage} className="h-1.5 flex-1" />
      <span className="text-[10px] font-mono text-muted-foreground">
        {percentage}%
      </span>
    </div>
  );
}
