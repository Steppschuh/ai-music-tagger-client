# AGENTS.md: Project Truth & Context Rules

> [!NOTE]
> This file is a machine-readable "ground truth" and context booster designed for AI coding assistants (and human developers) working in this repository. AI agents must read and strictly adhere to the stack definitions, patterns, and implementation laws listed below.

---

## 🎯 Project Purpose
AI Music Tagger is a desktop application and CLI utility designed for automated, high-fidelity music metadata enrichment. It interfaces with an AI audio-analysis backend to generate descriptive tags, genres, moods, tempo/key structures, and DJ-specific metadata (cue points, mixing notes) for advanced library curation.

---

## 🛠 Tech Stack
- **Core Process Shell**: Electron (Main Process)
- **User Interface**: React 18 (Renderer Process)
- **Languages**: TypeScript (Strict mode enforced)
- **Build & Development**: Vite, Electron Forge, TS-Node (for CLI execution)
- **State & Data**: TanStack Query (API caching), Electron-Store (Persistent settings), Zod (Validation)
- **Styling**: Tailwind CSS (v3), Radix UI / Shadcn UI primitives
- **Audio Logic**: `node-id3` (ID3 frame writer), Sidecar JSON caching

---

## 🏗 Architectural Patterns

- **Service-Oriented Logic**: Core business logic—such as tag writing, settings configurations, and API communications—is encapsulated in `src/services/` and shared identically between the Electron GUI and the CLI.
- **Context-Isolated IPC Bridge**: All sensitive system operations (filesystem access, network requests, OS-level dialogs) are restricted to the Main process. The Renderer is restricted from importing `fs` or `path` and must interact through secure IPC handlers declared in `src/preload.ts`.
- **Hybrid Metadata Storage**: Primary tags are written directly to ID3 frames. The full-fidelity, highly structured AI analysis output is saved as a `-analysis.json` sidecar file alongside the audio to prevent duplicate API requests and preserve historical metadata.
- **Schema-First Analysis**: The system enforces and operates on the versioned `AnalysisResult` schema (currently **v20**), defined as the single source of truth in `src/shared/types.ts`.

---

## 🏷 Naming Conventions
- **UI Components**: `PascalCase` (e.g., `SettingsPanel.tsx`, `StatusBar.tsx`).
- **Services & Utils**: `camelCase` (e.g., `musicTaggerService.ts`, `id3MetadataHelpers.ts`).
- **Types & Interfaces**: `PascalCase` (e.g., `AnalysisResult`, `SettingsState`).
- **Filesystem**: `kebab-case` for assets and directories, `camelCase` for source files.

---

## 📜 Implementation Laws

1. **Strict Type Safety**: Never use `any` unless wrapping third-party libraries that lack complete typing definitions. Use the shared interfaces in `src/shared/types.ts` as the single source of truth.
2. **Main-Process Restriction**: All network requests and local filesystem writes MUST run in the Main process. The React Renderer is strictly sandboxed.
3. **Environment Isolation**: Mock analysis modes and local/dev testing routes must be strictly guarded by `import.meta.env.DEV` or `app.isPackaged` checks so they never leak into production builds.
4. **Non-Destructive Tagging**: By default, preserve existing audio tags unless the user has explicitly selected an "overwrite" or "merge" policy in settings.
