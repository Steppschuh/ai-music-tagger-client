# AI Music Tagger Client

A desktop companion and CLI utility that leverages AI to analyze audio files, extract detailed music metadata, and write it directly to your music library's ID3 tags.

The AI analysis is performed by the [AI Music Tagger API](https://ai-music-tagger.web.app). An API key is required to use this service, as the underlying audio analysis requires significant compute resources and cannot be provided for free.

> [!NOTE]
> **Project Status & Expectations**
> This is a personal side project in its early development stages. **The majority of this codebase was written by AI coding assistants** under human direction. Please expect rough edges and don't treat it as a quality reference for production code.

---

## 📥 Download

Ready-to-use desktop installers for all major platforms can be downloaded directly from the **[Latest GitHub Releases Page](https://github.com/Steppschuh/ai-music-tagger-client/releases/latest)**.

### Which file should I download?
*   **macOS (Apple Silicon)**: Download the `.dmg` file ending with `-macOS-Apple-Silicon.dmg` (for M1/M2/M3 chip Macs).
*   **Windows**: Download the `.exe` file ending with `-Windows-Setup.exe` (run it to install the application).
*   **Linux**: Download the `.deb` file (for Ubuntu/Debian) or `.rpm` file (for Fedora/RedHat).

---

## 🚀 Features

- **AI-Powered Analysis**: Extracts descriptive metadata (genres, moods, vibes, lyrical themes, ...) and structural/performance details (phrasing type, suitable cue points, and multi-stem audio suitability).
- **Direct ID3 Tagging**: Writes analyzed metadata directly to files (MP3, FLAC, M4A, etc.) using `node-id3`.
- **Sidecar JSON Caching**: Automatically saves the high-fidelity AI output in a `-analysis.json` file next to each audio track. This prevents duplicate API calls and lets you re-tag your music with different strategies without re-analyzing.
- **Dual Interfaces**: Contains both a cross-platform desktop UI (Electron & React) and a developer-friendly Command Line Interface (CLI).
- **Customizable Tag Strategies**: Configure how the app merges AI findings with your existing tags (e.g. keeping existing tags, merging new ones, or complete overwrites).
- **Comment Strategies**: Choose what to write to the ID3 Comment field: standard summaries, structured hashtags, raw tags, or combined options.

---

## 🛠 Technology Stack

- **Desktop Shell**: [Electron](https://www.electronjs.org/) (Main process handles files and API requests for security and stability)
- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **CLI Tooling**: [yargs](https://github.com/yargs/yargs) + [ts-node](https://typestrong.org/ts-node/)
- **State & Validation**: [TanStack Query](https://tanstack.com/query/latest) + [Zod](https://zod.dev/)
- **Audio Logic**: [node-id3](https://github.com/Zazama/node-id3) for tag operations
- **Distribution**: [Electron Forge](https://www.electronforge.io/) for bundling and code signing

---

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/steppschuh/ai-music-tagger-client-electron.git
   cd ai-music-tagger-client-electron
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables:
   Copy `.env.example` to `.env` and fill in your RapidAPI credentials and settings (required for local builds/runs).

---

## 💻 Running the App

### Desktop Interface (GUI)
Start the application in development mode with hot-reloading:
```bash
npm start
```

### Command Line Interface (CLI)
Run the CLI using `ts-node`:
```bash
# Display help and commands
npm run cli -- --help

# Analyze a single track or folder
npm run cli -- analyze "/path/to/music/track.mp3"
```

---

## 🏗 Building & Packaging

To bundle the desktop application for your host platform:
```bash
npm run package
```

To build installers and distributables (e.g. `.dmg` on macOS, `.exe` on Windows):
```bash
npm run make
```

> [!TIP]
> Code signing and notarization credentials for macOS are parsed from your local `.env` file during the build process using custom env-loaders in `forge.config.ts`.

---

## 📁 Key Directories & Files

- `src/main.ts`: Electron Main process (file operations, security, IPC).
- `src/preload.ts`: IPC bridge, keeping file/network operations strictly isolated.
- `src/renderer/`: The React-based dashboard UI.
- `src/services/`: Core logic (tagging, schemas, settings) shared by both GUI and CLI.
- `bin/cli.ts`: Entry point for the CLI tool.
- `AGENTS.md`: Technical ground truth for developers and AI assistants.
- `MEMORY.md`: Chronological log of major architectural decisions and integration details.

---

## 🤖 Developer & AI Agent Context

This repository is optimized for AI-assisted development. If you are working on this project with an AI assistant, direct them to read:
1. [AGENTS.md](file:///Users/steppschuh/Documents/Projects/Steppschuh/ai-music-tagger-client-electron/AGENTS.md) — The strict rules, naming standards, and constraints of the repository.
2. [MEMORY.md](file:///Users/steppschuh/Documents/Projects/Steppschuh/ai-music-tagger-client-electron/MEMORY.md) — Architectural decisions, backend specifications, and known edge-cases.

---

## 📄 License

This project is licensed under the [GPL-3.0 License](LICENSE).
