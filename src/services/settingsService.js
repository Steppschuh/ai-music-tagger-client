"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = getSettings;
exports.setSettings = setSettings;
const electron_store_1 = __importDefault(require("electron-store"));
function checkIsLocalDev() {
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev") {
        return true;
    }
    if (process.versions && process.versions.electron) {
        return process.defaultApp === true;
    }
    return true;
}
const DEFAULT_SETTINGS = {
    rapidApiKey: "",
    autoSaveJson: true,
    tagStrategy: "overwrite",
    commentStrategy: "tags+summary",
    skipAlreadyAnalyzed: true,
    // Enabled by default during local development; always forced off in production.
    mockAnalysis: checkIsLocalDev(),
    useLocalBackend: checkIsLocalDev(),
};
const store = new electron_store_1.default({
    name: "ai-tagger-settings",
    defaults: DEFAULT_SETTINGS,
});
function getSettings() {
    return { ...DEFAULT_SETTINGS, ...store.store };
}
function setSettings(settings) {
    store.set(settings);
}
