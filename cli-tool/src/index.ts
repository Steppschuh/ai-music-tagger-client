import { MusicTaggerClient } from "./musicTaggerClient.js";
import {
  MergeStrategy,
  CommentStrategy,
  formatMetadataForLog,
} from "./id3MetadataHelpers.js";
import * as fs from "fs";
import * as path from "path";

import yargs from "yargs/yargs";

// Common audio file extensions (case-insensitive)
const AUDIO_EXTENSIONS = [
  ".mp3",
  ".flac",
  ".wav",
  ".m4a",
  ".aac",
  ".ogg",
  ".opus",
  ".wma",
  ".aiff",
  ".aif",
  ".m4p",
  ".mp4",
  ".3gp",
];

interface ProcessResult {
  success: boolean;
  file: string;
  error?: string;
}

const argv = yargs(process.argv.slice(2))
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
  .parse();

/**
 * Recursively finds all audio files in a directory
 */
function findAudioFiles(dirPath: string): string[] {
  const audioFiles: string[] = [];
  const resolvedPath = path.resolve(dirPath);

  function walkDir(currentPath: string): void {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files and directories
        if (entry.name.startsWith(".")) {
          continue;
        }

        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (AUDIO_EXTENSIONS.includes(ext)) {
            audioFiles.push(fullPath);
          }
        }
      }
    } catch (error: any) {
      console.warn(
        `Warning: Could not read directory ${currentPath}: ${error.message}`
      );
    }
  }

  walkDir(resolvedPath);
  return audioFiles;
}

/**
 * Processes a single audio file (analysis or metadata update)
 */
async function processAudioFile(
  audioPath: string,
  args: any,
  tagger: MusicTaggerClient
): Promise<void> {
  if (args["update-metadata"]) {
    // Update metadata workflow
    // Check if analysis file exists, if not, run analysis first
    let analysis = await tagger.readAnalysisFromFile(audioPath);

    if (!analysis) {
      console.log(
        `Analysis file not found for ${audioPath}. Running analysis first...`
      );
      analysis = await tagger.analyzeSong(audioPath, args.prompt);
      await tagger.writeAnalysisToFile(audioPath, analysis);
      console.log("Analysis completed and saved.");
    }

    // At this point, analysis is guaranteed to be non-null
    if (!analysis) {
      throw new Error("Failed to obtain analysis");
    }

    // Read current metadata
    const existingMetadata = await tagger.readMetadata(audioPath);

    // Transform analysis to metadata format
    const commentStrategy = args.commentStrategy as CommentStrategy;
    const newMetadata = tagger.transformAnalysisToMetadata(
      analysis,
      commentStrategy
    );

    // Merge existing and new metadata
    const mergeStrategy = args.mergeStrategy as MergeStrategy;
    const mergedMetadata = tagger.mergeMetadata(
      existingMetadata,
      newMetadata,
      mergeStrategy
    );

    // Log metadata comparison
    console.log(`Metadata merge strategy: ${mergeStrategy}`);
    console.log("\nExisting metadata:");
    console.log(
      JSON.stringify(formatMetadataForLog(existingMetadata), null, 2)
    );
    console.log("\nMerged metadata:");
    console.log(JSON.stringify(formatMetadataForLog(mergedMetadata), null, 2));

    // Write metadata to file
    await tagger.writeMetadata(audioPath, mergedMetadata, mergeStrategy);

    console.log("Metadata update completed successfully");
  } else {
    // Analysis workflow
    const analysis = await tagger.analyzeSong(audioPath, args.prompt);
    const analysisFile = await tagger.writeAnalysisToFile(audioPath, analysis);
    console.log(`Analysis result written to ${analysisFile}`);
  }
}

async function run(): Promise<void> {
  const args = await argv;

  if (!fs.existsSync(args.audio)) {
    console.error(`Error: Path not found at ${args.audio}`);
    process.exit(1);
  }

  const tagger = new MusicTaggerClient();

  // Check if path is a directory or file
  const stats = fs.statSync(args.audio);
  const isDirectory = stats.isDirectory();

  if (isDirectory) {
    // Directory processing
    console.log(`Scanning directory: ${args.audio}`);
    const audioFiles = findAudioFiles(args.audio);

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
        await processAudioFile(audioFile, args, tagger);
        results.push({ success: true, file: audioFile });
        successCount++;
      } catch (error: any) {
        const errorMessage = error.message || String(error);
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
    }

    // Exit with error code if any files failed
    if (failCount > 0) {
      process.exit(1);
    }
  } else {
    // Single file processing (existing behavior)
    try {
      await processAudioFile(args.audio, args, tagger);
    } catch (error: any) {
      console.error("Error during processing:", error.message);
      process.exit(1);
    }
  }
}

run();
