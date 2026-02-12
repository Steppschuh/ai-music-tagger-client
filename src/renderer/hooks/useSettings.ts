import { useState, useCallback, useEffect } from "react";
import type { SettingsState } from "@/types/tagger";

const DEFAULT_SETTINGS: SettingsState = {
  rapidApiKey: "",
  autoSaveJson: false,
  tagStrategy: "overwrite",
};

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.api) {
      window.api.getSettings().then((s) => {
        setSettings({ ...DEFAULT_SETTINGS, ...s });
        setLoaded(true);
      });
    } else {
      setLoaded(true);
    }
  }, []);

  const updateSetting = useCallback(
    <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        if (typeof window !== "undefined" && window.api) {
          window.api.setSettings(next);
        }
        return next;
      });
    },
    []
  );

  return { settings, updateSetting, loaded };
}
