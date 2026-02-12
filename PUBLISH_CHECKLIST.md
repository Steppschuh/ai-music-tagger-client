# Publication Readiness Checklist

## Open Tasks Before Publication

### 1. **API URL in Production** (Critical)

The backend URL is currently hardcoded based on `NODE_ENV`:

```ts
const API_BASE_URL = process.env.NODE_ENV === "production"
  ? "https://ai-music-tagger-932142402715.europe-west1.run.app"
  : "http://localhost:3000";
```

In packaged Electron apps, `NODE_ENV` is often not set to `"production"`, so the app may incorrectly default to `localhost`. Fix: Use `app.isPackaged` to determine production vs. development, or add a configurable API URL in settings (via electron-store).

- [ ] Fix production API URL detection

### 2. **App Metadata and Branding**

- `description`: Still "My Electron application description" — should reflect the actual app
- `productName`: Consider a user-friendly name like "AI Music Tagger"
- **No app icon** — Add icon assets for macOS, Windows, and Linux (e.g. 16x16, 32x32, 64x64, 256x256, 512x512) and configure `packagerConfig.icon` in forge.config

- [ ] Update app description
- [ ] Add app icon and configure packagerConfig

### 3. **Code Signing & Notarization (macOS)**

For distribution outside the Mac App Store:

- Code signing with Apple Developer ID certificate
- Notarization with Apple
- Configure `releaseInfo` or signing config in forge.config for makers

- [ ] Set up code signing for macOS
- [ ] Set up notarization for macOS

### 4. **Cross-platform Testing**

- Test full flow on macOS, Windows, and Linux
- Verify file path handling works cross-platform
- Test file dialogs on each OS

- [ ] Test on macOS
- [ ] Test on Windows
- [ ] Test on Linux

### 5. **Error Handling & UX** (Done)

- Add user-facing error messages (toasts) instead of only `console.error` / `console.warn`
- Add React error boundary for crash recovery
- Handle network/offline errors with clear messaging
- Consider adding cancel/abort support for long-running analysis

- [x] Add toast notifications for errors
- [x] Add React error boundary
- [x] Improve network/offline error handling
- [x] Stop button cancels further processing (current file completes; remaining files skipped)

### 6. **Cleanup**

- Remove or repurpose legacy `src/renderer.ts` if it's unused (entry point is now `src/renderer/renderer.tsx`)
- Strip or guard `console.log`/`console.warn` in production builds

- [ ] Remove legacy renderer.ts or update entry
- [ ] Remove/reduce debug logging in production

### 7. **Documentation**

- Add or update `README.md` with: app purpose, how to run, how to build for release, backend requirements

- [ ] Update README.md

### 8. **Security**

- Verify file path validation and sandboxing
- Ensure no secrets or sensitive data in logs
- Run `npm audit` and address critical vulnerabilities

- [ ] Security review

### 9. **Optional Polish**

- Add "About" dialog
- Add auto-update capability (e.g. electron-updater)
- Add keyboard shortcuts for common actions

---

## Priority Summary

| Priority | Task |
|----------|------|
| **Critical** | Fix production API URL (use `app.isPackaged` or settings) |
| **Critical** | Add app icon |
| **High** | macOS code signing & notarization for distribution |
| **High** | Test on all target platforms |
| **Medium** | Error handling & UX improvements |
| **Medium** | Update app metadata and README |
| **Low** | Remove dead code and debug logs |
