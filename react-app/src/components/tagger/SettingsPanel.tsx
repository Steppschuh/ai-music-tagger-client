import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SettingsState } from "@/types/tagger";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: SettingsState;
  onUpdateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => void;
}

export function SettingsPanel({
  open,
  onOpenChange,
  settings,
  onUpdateSetting,
}: SettingsPanelProps) {
  const [showKey, setShowKey] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
            {/* Account & Connection */}
            <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account & Connection
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="api-key" className="text-xs text-foreground">
                  RapidAPI Key
                </Label>
                <div className="mt-1 flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="api-key"
                      type={showKey ? "text" : "password"}
                      value={settings.rapidApiKey}
                      onChange={(e) =>
                        onUpdateSetting("rapidApiKey", e.target.value)
                      }
                      placeholder="Enter your API key"
                      className="pr-9 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-9 text-muted-foreground"
                      onClick={() => setShowKey((p) => !p)}
                    >
                      {showKey ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  <Button variant="secondary" size="sm" className="text-xs">
                    Test
                  </Button>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full text-xs">
                Login / Sign Up with Cloud
              </Button>
            </div>
          </section>

          <Separator />

          {/* Writing Preferences */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Writing Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-json" className="text-xs text-foreground">
                  Auto-save JSON
                </Label>
                <Switch
                  id="auto-json"
                  checked={settings.autoSaveJson}
                  onCheckedChange={(val) =>
                    onUpdateSetting("autoSaveJson", val)
                  }
                />
              </div>

              <div>
                <Label className="mb-2 block text-xs text-foreground">
                  Tag Strategy
                </Label>
                <RadioGroup
                  value={settings.tagStrategy}
                  onValueChange={(val) =>
                    onUpdateSetting(
                      "tagStrategy",
                      val as SettingsState["tagStrategy"]
                    )
                  }
                  className="space-y-2"
                >
                  {(
                    [
                      ["keep", "Keep existing tags"],
                      ["merge", "Merge with existing"],
                      ["overwrite", "Overwrite all tags"],
                    ] as const
                  ).map(([value, label]) => (
                    <div key={value} className="flex items-center gap-2">
                      <RadioGroupItem value={value} id={`strategy-${value}`} />
                      <Label
                        htmlFor={`strategy-${value}`}
                        className="text-xs text-foreground"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </section>

          {/* Developer (dev builds only) */}
          {import.meta.env.DEV && (
            <>
              <Separator />
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Developer
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mock-analysis" className="text-xs text-foreground">
                        Mock Analysis
                      </Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Route requests to <code className="font-mono">/analyzeMock</code> — saves API tokens during development.
                      </p>
                    </div>
                    <Switch
                      id="mock-analysis"
                      checked={settings.mockAnalysis}
                      onCheckedChange={(val) =>
                        onUpdateSetting("mockAnalysis", val)
                      }
                    />
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
