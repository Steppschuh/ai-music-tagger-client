# AI Music Tagger Client

An advanced desktop application built with Electron and React that leverages AI to analyze and tag your music collection. This client provides a powerful interface for scanning audio files, generating detailed metadata (genre, mood, BPM, etc.), and writing that data directly to your music's ID3 tags.

## 🚀 Key Features

- **AI-Powered Analysis**: Deep analysis of audio files to extract meaningful metadata.
- **Batch Processing**: Select multiple files or entire directories for automated tagging.
- **Metadata Management**: Read and write ID3 tags directly to files (MP3, FLAC, M4A, and more).
- **Customizable Prompts**: Fine-tune the AI analysis with custom prompts for specific tagging needs.
- **Modern UI**: A sleek, responsive dashboard built with React, Shadcn-ui, and Tailwind CSS.
- **Intelligent Merging**: Choose how to merge AI results with your existing file tags.
- **Cross-Platform**: Designed to work on macOS, Windows, and Linux.

## 🛠 Technology Stack

- **Framework**: [Electron](https://www.electronjs.org/) for the desktop shell.
- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) for a modern development experience.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) for beautiful, responsive components.
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) for handling asynchronous analysis tasks.
- **Metadata Handling**: [node-id3](https://github.com/Zazama/node-id3) for robust file tagging.
- **Build Tooling**: [Electron Forge](https://www.electronforge.io/) for packaging and distribution.

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or later recommended)
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

3. (Optional) Run the renderer in development mode:
   ```bash
   npm start
   ```

### Development

Start the application in development mode with hot-reloading:

```bash
npm start
```

## 🏗 Building & Distribution

To package the application for your current platform:

```bash
npm run package
```

To create distributables (installers like .dmg, .exe, .deb):

```bash
npm run make
```

> [!NOTE]
> For macOS distribution, you will need to configure code signing and notarization in `forge.config.ts` using your Apple Developer credentials.

## 📁 Project Structure

- `src/main.ts`: Electron main process logic.
- `src/preload.ts`: Bridge between Electron and the React frontend.
- `src/services/`: Core logic for music analysis and tagging.
- `src/renderer/`: The React frontend application.
- `forge.config.ts`: Configuration for Electron Forge and Vite.
- `PUBLISH_CHECKLIST.md`: Current roadmap and publication status.

## 📄 License

This project is licensed under the [GPL-3.0 License](LICENSE).
