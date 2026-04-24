# AGENTS.md: Project Truth

## Project Purpose
AI Music Tagger is a professional-grade desktop application and CLI tool designed for automated music metadata enrichment. It leverages AI to analyze audio files, generating high-fidelity tags, structural phrasing, energy profiles, and DJ-specific metadata (cue points, mixing notes) for advanced library management.

## Tech Stack
- **Core**: Electron (Main Process) + React 18 (Renderer Process)
- **Languages**: TypeScript (Strict mode enforcement)
- **Build & Dev**: Vite, Electron Forge, TS-Node (for CLI)
- **State & Data**: TanStack Query (API state), Electron-Store (Persistence), Zod (Validation)
- **Styling**: Tailwind CSS, Radix UI / Shadcn UI components
- **Audio Logic**: `node-id3` (Metadata writing), Sidecar JSON caching

## Architectural Patterns
- **Service-Oriented Logic**: Core business logic (tagging, analysis, settings) is encapsulated in `src/services/` and shared between the Electron GUI and the CLI.
- **Context-Isolated IPC Bridge**: All sensitive operations (filesystem, network, dialogs) are restricted to the Main process and exposed to the Renderer via secure IPC handlers in `preload.ts`.
- **Hybrid Metadata Storage**: Primary tags are written directly to ID3 frames, while full-fidelity AI results are cached in `-analysis.json` sidecar files to prevent data loss and avoid redundant API calls.
- **Schema-First Analysis**: The system operates on a versioned `AnalysisResult` schema (currently **v20**), defined in `src/shared/types.ts`.

## Naming Conventions
- **UI Components**: `PascalCase` (e.g., `SettingsPanel.tsx`, `StatusBar.tsx`).
- **Services & Utils**: `camelCase` (e.g., `musicTaggerService.ts`, `id3MetadataHelpers.ts`).
- **Types & Interfaces**: `PascalCase` (e.g., `AnalysisResult`, `SettingsState`).
- **Filesystem**: `kebab-case` for assets, `camelCase` for source files.

## Implementation Laws
1. **Strict Type Safety**: Never use `any` unless absolutely necessary (e.g., third-party library gaps). Use the shared types in `src/shared/types.ts` as the single source of truth.
2. **Main-Process Restriction**: Network requests and filesystem writes MUST happen in the Main process. The Renderer should never import `fs` or `path`.
3. **Dev/Prod Isolation**: Mock analysis modes and developer tools must be guarded by `import.meta.env.DEV` or `app.isPackaged` checks.
4. **Non-Destructive Tagging**: By default, preserve existing metadata unless the user explicitly selects an "overwrite" or "merge" strategy.
