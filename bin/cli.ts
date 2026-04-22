/**
 * CLI entry point for AI Music Tagger.
 * Imports core logic from the shared service layer used by the Electron GUI.
 *
 * Usage:
 *   node bin/cli.js --audio /path/to/song.mp3 [options]
 *   node bin/cli.js --audio /path/to/folder/ --update-metadata
 */

import {
  analyzeSong,
  readMetadata,
  writeMetadata,
  readAnalysisFromFile,
  writeAnalysisToFile,
  findAudioFiles,
  transformAnalysisToMetadata,
  mergeMetadata,
} from "../src/services/musicTaggerService";
import type { MergeStrategy, CommentStrategy } from "../src/shared/types";
import { formatMetadataForLog } from "../src/services/id3MetadataHelpers";
import * as fs from "fs";
import * as path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface ProcessResult {
  success: boolean;
  file: string;
  error?: string;
}

const argv = yargs(hideBin(process.argv))
  .option("audio", {
    alias: "a",
    description: "Path to the audio file or directory",
    type: "string",
    demandOption: true,
  })
  .option("prompt", {
    alias: "p",
    description: "Optional prompt for the analysis",
    type: "string",
  })
  .option("update-metadata", {
    alias: "u",
    description:
      "Update ID3 tags from analysis file. If analysis doesn't exist, it will be created first.",
    type: "boolean",
    default: false,
  })
  .option("mergeStrategy", {
    alias: "m",
    description: "Merge strategy: 'overwrite', 'keep-existing', or 'combine'",
    type: "string",
    choices: ["overwrite", "keep-existing", "combine"],
    default: "keep-existing",
  })
  .option("commentStrategy", {
    alias: "c",
    description:
      "Comment strategy: 'tags+summary' (default), 'summary', 'hashtags', or 'tags'",
    type: "string",
    choices: ["summary", "hashtags", "tags", "tags+summary"],
    default: "tags+summary",
  })
  .help()
  .parseSync();

/**
 * Processes a single audio file (analysis or metadata update)
 */
async function processAudioFile(
  audioPath: string,
  updateMetadataFlag: boolean,
  prompt: string | undefined,
  mergeStrategy: MergeStrategy,
  commentStrategy: CommentStrategy
): Promise<void> {
  if (updateMetadataFlag) {
    // Update metadata workflow
    let analysis = await readAnalysisFromFile(audioPath);

    if (!analysis) {
      console.log(
        `Analysis file not found for ${audioPath}. Running analysis first...`
      );
      analysis = await analyzeSong(audioPath, prompt);
      await writeAnalysisToFile(audioPath, analysis);
      console.log("Analysis completed and saved.");
    }

    if (!analysis) {
      throw new Error("Failed to obtain analysis");
    }

    // Read current metadata
    const existingMetadata = await readMetadata(audioPath);

    // Transform analysis to metadata format
    const newMetadata = transformAnalysisToMetadata(analysis, commentStrategy);

    // Merge existing and new metadata
    const mergedMetadata = mergeMetadata(existingMetadata, newMetadata, mergeStrategy);

    // Log metadata comparison
    console.log(`Metadata merge strategy: ${mergeStrategy}`);
    console.log("\nExisting metadata:");
    console.log(JSON.stringify(formatMetadataForLog(existingMetadata), null, 2));
    console.log("\nMerged metadata:");
    console.log(JSON.stringify(formatMetadataForLog(mergedMetadata), null, 2));

    // Write metadata to file
    await writeMetadata(audioPath, mergedMetadata, mergeStrategy);

    console.log("Metadata update completed successfully");
  } else {
    // Analysis-only workflow
    const analysis = await analyzeSong(audioPath, prompt);
    const analysisFile = await writeAnalysisToFile(audioPath, analysis);
    console.log(`Analysis result written to ${analysisFile}`);
  }
}

async function run(): Promise<void> {
  const audioPath = argv.audio as string;

  if (!fs.existsSync(audioPath)) {
    console.error(`Error: Path not found at ${audioPath}`);
    process.exit(1);
  }

  const mergeStrategy = (argv.mergeStrategy ?? "keep-existing") as MergeStrategy;
  const commentStrategy = (argv.commentStrategy ?? "tags+summary") as CommentStrategy;
  const updateMetadataFlag = Boolean(argv["update-metadata"]);
  const prompt = argv.prompt as string | undefined;

  // Check if path is a directory or file
  const stats = fs.statSync(audioPath);
  const isDirectory = stats.isDirectory();

  if (isDirectory) {
    // Directory processing
    console.log(`Scanning directory: ${audioPath}`);
    const audioFiles = findAudioFiles(audioPath);

    if (audioFiles.length === 0) {
      console.log("No audio files found in the specified directory.");
      process.exit(0);
    }

    console.log(`Found ${audioFiles.length} audio file(s) to process.\n`);

    const results: ProcessResult[] = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < audioFiles.length; i++) {
      const audioFile = audioFiles[i];
      const fileName = path.basename(audioFile);
      console.log(`\n[${i + 1}/${audioFiles.length}] Processing: ${fileName}`);

      try {
        await processAudioFile(audioFile, updateMetadataFlag, prompt, mergeStrategy, commentStrategy);
        results.push({ success: true, file: audioFile });
        successCount++;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error processing ${fileName}: ${errorMessage}`);
        results.push({ success: false, file: audioFile, error: errorMessage });
        failCount++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("Processing Summary:");
    console.log(`Total files found: ${audioFiles.length}`);
    console.log(`Successfully processed: ${successCount}`);
    console.log(`Failed: ${failCount}`);

    if (failCount > 0) {
      console.log("\nFailed files:");
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`  - ${r.file}`);
          if (r.error) {
            console.log(`    Error: ${r.error}`);
          }
        });
      process.exit(1);
    }
  } else {
    // Single file processing
    try {
      await processAudioFile(audioPath, updateMetadataFlag, prompt, mergeStrategy, commentStrategy);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error during processing:", errorMessage);
      process.exit(1);
    }
  }
}

run();
