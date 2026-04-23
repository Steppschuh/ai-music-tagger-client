import { useState, useCallback } from "react";
import type { SettingsState } from "@/types/tagger";

const DEFAULT_SETTINGS: SettingsState = {
  rapidApiKey: "",
  autoSaveJson: false,
  tagStrategy: "overwrite",
  // Enabled by default during local development (`npm start`); always false in production builds.
  mockAnalysis: import.meta.env.DEV,
};

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem("ai-tagger-settings");
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSetting = useCallback(
    <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        localStorage.setItem("ai-tagger-settings", JSON.stringify(next));
        return next;
      });
    },
    []
  );

  return { settings, updateSetting };
}
