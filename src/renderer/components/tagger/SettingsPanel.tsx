import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-[400px] sm:w-[540px] border-border bg-card overflow-y-auto sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="shrink-0 mb-4">
          <SheetTitle className="text-foreground text-left">Settings</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 pr-2 pb-6">
          <Accordion type="single" collapsible defaultValue="account" className="w-full">
            
            {/* Account & Connection */}
            <AccordionItem value="account" className="border-b-0">
              <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline py-3">
                Account & Connection
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pb-4">
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
              </AccordionContent>
            </AccordionItem>

            <Separator />

            {/* Analysis Preferences */}
            <AccordionItem value="writing" className="border-b-0">
              <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline py-3">
                Analysis
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-json" className="text-xs text-foreground">
                        Auto-save JSON
                      </Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Saves analysis results as a sidecar JSON file for each audio track.
                      </p>
                    </div>
                    <Switch
                      id="auto-json"
                      checked={settings.autoSaveJson}
                      onCheckedChange={(val) =>
                        onUpdateSetting("autoSaveJson", val)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="skip-analyzed" className="text-xs text-foreground">
                        Skip Already Analyzed Files
                      </Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Avoid re-analyzing tracks that already have metadata or sidecar files.
                      </p>
                    </div>
                    <Switch
                      id="skip-analyzed"
                      checked={settings.skipAlreadyAnalyzed ?? true}
                      onCheckedChange={(val) =>
                        onUpdateSetting("skipAlreadyAnalyzed", val)
                      }
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <Separator />

            {/* Meta Data */}
            <AccordionItem value="metadata" className="border-b-0">
              <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline py-3">
                Meta Data
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-5 pb-4">
                  <div>
                    <Label className="mb-2 block text-xs text-foreground">
                      Tag Strategy
                    </Label>
                    <p className="mb-3 text-[10px] text-muted-foreground">
                      Tags are written automatically after each analysis.
                    </p>
                    <RadioGroup
                      value={settings.tagStrategy}
                      onValueChange={(val) =>
                        onUpdateSetting(
                          "tagStrategy",
                          val as SettingsState["tagStrategy"]
                        )
                      }
                      className="space-y-2.5"
                    >
                      {(
                        [
                          ["keep", "Keep existing tags (no auto-write)"],
                          ["merge", "Merge with existing tags"],
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

                  <div>
                    <Label className="mb-2 block text-xs text-foreground">
                      Comment Field
                    </Label>
                    <p className="mb-3 text-[10px] text-muted-foreground">
                      What to write into the ID3 comment field.
                    </p>
                    <RadioGroup
                      value={settings.commentStrategy ?? "tags+summary"}
                      onValueChange={(val) =>
                        onUpdateSetting(
                          "commentStrategy",
                          val as SettingsState["commentStrategy"]
                        )
                      }
                      className="space-y-2.5"
                    >
                      {(
                        [
                          ["tags+summary", "Tags + Summary (default)"],
                          ["summary", "Summary only"],
                          ["tags", "Tags only (CSV)"],
                          ["hashtags", "Hashtags only"],
                        ] as const
                      ).map(([value, label]) => (
                        <div key={value} className="flex items-center gap-2">
                          <RadioGroupItem value={value} id={`comment-${value}`} />
                          <Label
                            htmlFor={`comment-${value}`}
                            className="text-xs text-foreground"
                          >
                            {label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Developer (dev builds only) */}
            {import.meta.env.DEV && (
              <>
                <Separator />
                <AccordionItem value="developer" className="border-b-0">
                  <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline py-3">
                    Developer
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="mock-analysis" className="text-xs text-foreground">
                            Mock Analysis
                          </Label>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Route requests to{" "}
                            <code className="font-mono bg-muted px-1 rounded">/analyzeMock</code>
                            <br />
                            Saves API tokens during development.
                          </p>
                        </div>
                        <Switch
                          id="mock-analysis"
                          checked={settings.mockAnalysis ?? true}
                          onCheckedChange={(val) =>
                            onUpdateSetting("mockAnalysis", val)
                          }
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </>
            )}
            
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
