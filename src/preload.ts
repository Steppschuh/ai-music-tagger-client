import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  analyzeFile: (filePath: string, prompt?: string) =>
    ipcRenderer.invoke('analyze-file', filePath, prompt),
  readTags: (filePath: string) => ipcRenderer.invoke('read-tags', filePath),
  writeTags: (
    filePath: string,
    metadata: unknown,
    mergeStrategy?: string
  ) =>
    ipcRenderer.invoke('write-tags', filePath, metadata, mergeStrategy),
  writeTagsFromAnalysis: (
    filePath: string,
    analysis: unknown,
    mergeStrategy?: string,
    commentStrategy?: string
  ) =>
    ipcRenderer.invoke('write-tags-from-analysis', filePath, analysis, mergeStrategy, commentStrategy),
  readAnalysisFromFile: (filePath: string) =>
    ipcRenderer.invoke('read-analysis-from-file', filePath),
  hasBeenAnalyzed: (filePath: string) =>
    ipcRenderer.invoke('has-been-analyzed', filePath),
  writeAnalysisToFile: (filePath: string, analysis: unknown) =>
    ipcRenderer.invoke('write-analysis-to-file', filePath, analysis),
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings: unknown) =>
    ipcRenderer.invoke('set-settings', settings),
});
