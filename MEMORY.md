# MEMORY.md: Historical Context & Knowledge Base

> [!NOTE]
> This file contains the chronological log of major architectural decisions, integration patterns, and known pitfalls for the AI Music Tagger project. It is updated alongside major version milestones to ensure absolute clarity for future development.

---

## 🧠 Major Decisions

- **Service Unification (v1.0.0)**: Refactored the CLI and GUI to share a unified `musicTaggerService`. This design eliminates logic drift, guaranteeing that tag-writing behavior, merge strategies, file filters, and API payloads are identical across both the graphical dashboard and command-line execution.
- **Lean API Schema (v19/v20)**: Transferred granular constraints (e.g. strict string length ranges, specific tag arrays) from the client's Zod JSON schema over to the backend LLM's `system-instructions.md`. This offloads semantic compliance directly to the LLM, enabling richer, descriptive outputs while keeping the client-side SDK interfaces highly clean, stable, and backward-compatible.
- **Sidecar Analysis Cache**: Introduced a strict sidecar caching policy that saves a `-analysis.json` file next to each analyzed audio file. This allows users to re-apply or change their tagging settings (e.g., swapping from "summary comment" to "hashtag list") locally, immediately, and at zero API cost.
- **Mock Analysis Mode**: Added a dev-only mock endpoint and setting (`mockAnalysis`) to simulate successful API tag outputs during UI prototyping. This prevents unnecessary credit consumption and rate-limiting blocks on RapidAPI during frontend development.

---

## ⚠️ Known Gotchas & Constraints

- **20MB Backend Upload Limit**: The AI analysis backend (RapidAPI) rejects files larger than 20MB. The client-side service scans the file size before queuing and blocks uploads exceeding this limit to prevent failed HTTP requests and rate penalties.
- **ID3 Versioning Hurdles**: While `node-id3` operates smoothly on standard audio, corrupted or extremely old ID3v1/v2 files may occasionally cause write failures. The service uses a defensive "preserve-by-default" strategy to avoid metadata corruption.
- **IPC Payload Latency**: Sending real-time progress events across the Electron IPC bridge during intensive batch scans can lead to UI sluggishness. The Main process throttles progress updates to keep the UI smooth and responsive.

---

## 🔗 Integration Maps

- **AI Analysis Backend**: Connects to `ai-music-analyst.p.rapidapi.com` via RapidAPI headers. It expects a `multipart/form-data` upload with an `audio` parameter and returns a structured JSON payload conforming to the **v20** `AnalysisResult` schema.
- **Persistence Storage**: Employs `electron-store` for global, persistent states (e.g. API keys, theme settings, active merge policies). Local file systems manage processing queues.
- **Signature Detection**: To prevent redundant API calls, the client identifies its own previous tag writes by looking for a custom "AI Music Tagger" signature written into the `EncodedBy` ID3 frame or a custom `Schema Version` TXXX frame.

---

## 🧭 Active Context & Future Roadmap

- **Active Objective**: Fine-tuning the "Already Analyzed" scan optimization, allowing users to scan huge directories instantly by matching local files with sidecar cache signatures.
- **Next Steps**: Implementing a batch "Re-tag" tool to update ID3 frames on files that already have sidecar JSON results but are missing specific tag frames.
- **Development Philosophy**: Transitioning from a generic tagger to a specialized tool for **DJs and music curators**—focusing on stem-separation indicators, exact energy dynamics, phrasing grids, and double-drop suitability.
