# MEMORY.md: Historical Context

## Major Decisions
- **Service Unification (v1.0.0)**: Refactored the CLI and GUI to share a unified `musicTaggerService`. This eliminated code duplication and ensured that tag-writing logic, merge strategies, and API handling are identical across all interfaces.
- **Lean API Schema (v19/v20)**: Migrated strict data validation (min/max lengths, ranges) from the JSON schema to `system-instructions.md`. This offloads enforcement to the LLM's prompt context, allowing for richer descriptions while maintaining a clean, SDK-compatible interface.
- **Sidecar Analysis Cache**: Implemented a policy of writing `-analysis.json` files alongside audio. This allows users to re-apply different tagging strategies (e.g., "hashtags" vs "summary") without incurring additional API costs or re-analyzing the file.
- **Mock Analysis Mode**: Introduced a dev-only mock endpoint to simulate successful API responses during UI development, preventing unnecessary credit consumption on RapidAPI.

## Known Gotchas
- **20MB Backend Limit**: The current analysis backend rejects audio files exceeding 20MB. The client validates this before upload, but high-bitrate long tracks may require downsampling in the future.
- **ID3 Tag Versioning**: `node-id3` handles most files well, but legacy or corrupted ID3v1/v2 tags can occasionally cause write failures. The app uses a "keep-existing" strategy by default to minimize risk.
- **IPC Latency**: While filesystem operations are fast, large batch processing can pressure the IPC bridge if progress updates are sent too frequently. Throttling is applied to status updates.

## Integration Maps
- **RapidAPI Backend**: Connects to `ai-music-analyst.p.rapidapi.com`. Expects `multipart/form-data` with an `audio` field and returns a JSON payload conforming to the V20 schema.
- **Persistence Layer**: Uses `electron-store` for global settings (API keys, themes) and local filesystem paths for processing queues.
- **Signature Detection**: The app identifies its own work by checking for the "AI Music Tagger" signature in the `EncodedBy` field or a "Schema Version" TXXX frame.

## Active Context
- **Current Objective**: Optimizing the "Already Analyzed" skipping logic and enhancing the processing UI with accurate ETA indicators.
- **Next Steps**: Implementing batch "Re-tag" functionality for files that have sidecar JSON but missing ID3 tags.
- **Project Vibe**: Shifting from "generic tagging" to "DJ-first curation" (focusing on energy scores, phrasing, and stem-separation suitability).
