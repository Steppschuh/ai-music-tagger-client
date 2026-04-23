import Store from "electron-store";
import type { SettingsState } from "../shared/types";

const DEFAULT_SETTINGS: SettingsState = {
  rapidApiKey: "",
  autoSaveJson: false,
  tagStrategy: "overwrite",
  commentStrategy: "tags+summary",
  skipAlreadyAnalyzed: true,
  // Enabled by default during local development; always forced off in production.
  mockAnalysis: process.env.NODE_ENV === "dev",
};

const store = new Store<SettingsState>({
  name: "ai-tagger-settings",
  defaults: DEFAULT_SETTINGS,
});

export function getSettings(): SettingsState {
  return { ...DEFAULT_SETTINGS, ...store.store };
}

export function setSettings(settings: SettingsState): void {
  store.set(settings);
}
