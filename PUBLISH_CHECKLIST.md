# Publication Readiness Checklist

## Open Tasks Before Publication

### 2. **App Branding**

- **App Icon** — Add icon assets for macOS, Windows, and Linux and configure `packagerConfig.icon` in `forge.config.ts`

- [x] Add app icon and configure packagerConfig

### 3. **Code Signing & Notarization (macOS)**

For distribution outside the Mac App Store:

- [ ] Set up code signing for macOS
- [ ] Set up notarization for macOS

### 4. **Cross-platform Testing**

- [ ] Test on macOS
- [ ] Test on Windows
- [ ] Test on Linux

### 6. **Cleanup**

- [ ] Remove/reduce debug logging in production

### 8. **Security**

- [ ] Final security review of file path validation and sandboxing

### 9. **Optional Polish**

- [ ] Add "About" dialog
- [ ] Add auto-update capability (e.g. electron-updater)
- [ ] Add keyboard shortcuts for common actions
