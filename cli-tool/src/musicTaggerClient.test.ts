import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import { MusicTaggerClient } from "./musicTaggerClient.js";
import { normalizeMetadataForComparison } from "./id3MetadataHelpers.js";

describe("MusicTaggerClient metadata round-trip", () => {
  // Resolve path relative to the client directory
  const testAudioFile = path.resolve(
    __dirname,
    "..",
    "public",
    "audio",
    "Perfekte Welle (SARIAN Remix).mp3"
  );
  let tempFile: string;

  beforeAll(() => {
    // Verify test file exists
    if (!fs.existsSync(testAudioFile)) {
      throw new Error(`Test audio file not found: ${testAudioFile}`);
    }

    // Create a temporary copy of the test file
    const tempDir = path.join(path.dirname(testAudioFile), "..", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    tempFile = path.join(
      tempDir,
      `test-${Date.now()}-${path.basename(testAudioFile)}`
    );
    fs.copyFileSync(testAudioFile, tempFile);
  });

  afterAll(() => {
    // Clean up temporary file
    if (tempFile && fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch (error) {
        console.warn(`Failed to delete temp file: ${tempFile}`, error);
      }
    }
    const tempDir = path.join(path.dirname(testAudioFile), "..", "temp");
    if (fs.existsSync(tempDir) && fs.readdirSync(tempDir).length === 0) {
      try {
        fs.rmdirSync(tempDir);
      } catch (error) {
        console.warn(`Failed to remove temp directory: ${tempDir}`, error);
      }
    }
  });

  it("should preserve metadata after write/read cycle", async () => {
    const tagger = new MusicTaggerClient();

    // 1. Read original metadata
    const originalMetadata = await tagger.readMetadata(tempFile);
    expect(originalMetadata).toBeDefined();

    // 2. Normalize original metadata for comparison
    const normalizedOriginal = normalizeMetadataForComparison(originalMetadata);

    // 3. Write metadata back to the file
    await tagger.writeMetadata(tempFile, originalMetadata);

    // 4. Read metadata again
    const readMetadata = await tagger.readMetadata(tempFile);
    expect(readMetadata).toBeDefined();

    // 5. Normalize read metadata for comparison
    const normalizedRead = normalizeMetadataForComparison(readMetadata);

    // 6. Compare normalized metadata (excluding timestamps)
    expect(normalizedRead).toEqual(normalizedOriginal);
  });
});

