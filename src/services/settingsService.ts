import Store from "electron-store";
import type { SettingsState } from "../shared/types";

const DEFAULT_SETTINGS: SettingsState = {
  rapidApiKey: "",
  autoSaveJson: false,
  tagStrategy: "overwrite",
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
