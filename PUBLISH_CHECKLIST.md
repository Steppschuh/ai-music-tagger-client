# Publication Readiness Checklist

This document tracks outstanding tasks, platform requirements, and configurations needed before releasing the first official version of the AI Music Tagger Client.

---

## Completed Tasks

### ✅ App Branding
- [x] Create app icon assets for macOS (`.icns`), Windows (`.ico`), and Linux (`.png`).
- [x] Configure `packagerConfig.icon` and Vite plugins in `forge.config.ts`.

### ✅ macOS Code Signing & Notarization
- [x] Set up macOS code signing entitlements and packaging configurations in `forge.config.ts`.
- [x] Integrate safe environment-variable loading for Mac developer certificates and passwords in local builds.

> [!TIP]
> Credentials for macOS signing and notarization are securely stored locally in `.env`. The project uses a zero-dependency env-loader in `forge.config.ts` to read them at build-time. For a new machine/setup, copy `.env.example` to `.env` and fill in the values.

---

## Open Tasks Before Publication

### 1. 🖥️ Cross-platform Testing
- [ ] Verify production builds and key functionalities on **macOS**.
- [ ] Verify production builds and key functionalities on **Windows**.
- [ ] Verify production builds and key functionalities on **Linux**.

### 2. 🧹 Code Cleanup
- [ ] Review and disable/reduce debug logging and mock options for production releases.
- [ ] Confirm `mockAnalysis` and `useLocalBackend` default to `false` in production settings initialization.

### 3. 🔒 Security Audit
- [ ] Perform a final security review of IPC handlers in `preload.ts` and ensure strict validation on all file paths passed from the renderer.
- [ ] Validate sandboxing contexts to prevent unauthorized file execution.

### 4. ✨ Optional Polish & Enhancements
- [ ] Add an **"About"** dialog in the desktop app UI detailing versions and license.
- [ ] Add auto-update capabilities (e.g., `electron-updater` or Forge publish configs).
- [ ] Map standard keyboard shortcuts for common actions (e.g., scan directory, toggle settings).
