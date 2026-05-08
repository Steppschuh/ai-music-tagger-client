"use strict";
/**
 * CLI entry point for AI Music Tagger.
 * Imports core logic from the shared service layer used by the Electron GUI.
 *
 * Usage:
 *   node bin/cli.js --audio /path/to/song.mp3 [options]
 *   node bin/cli.js --audio /path/to/folder/ --update-metadata
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const musicTaggerService_1 = require("../src/services/musicTaggerService");
const id3MetadataHelpers_1 = require("../src/services/id3MetadataHelpers");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
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
    description: "Update ID3 tags from analysis file. If analysis doesn't exist, it will be created first.",
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
    description: "Comment strategy: 'tags+summary' (default), 'summary', 'hashtags', or 'tags'",
    type: "string",
    choices: ["summary", "hashtags", "tags", "tags+summary"],
    default: "tags+summary",
})
    .help()
    .parseSync();
/**
 * Processes a single audio file (analysis or metadata update)
 */
async function processAudioFile(audioPath, updateMetadataFlag, prompt, mergeStrategy, commentStrategy) {
    if (updateMetadataFlag) {
        // Update metadata workflow
        let analysis = await (0, musicTaggerService_1.readAnalysisFromFile)(audioPath);
        if (!analysis) {
            console.log(`Analysis file not found for ${audioPath}. Running analysis first...`);
            analysis = await (0, musicTaggerService_1.analyzeSong)(audioPath, prompt);
            await (0, musicTaggerService_1.writeAnalysisToFile)(audioPath, analysis);
            console.log("Analysis completed and saved.");
        }
        if (!analysis) {
            throw new Error("Failed to obtain analysis");
        }
        // Read current metadata
        const existingMetadata = await (0, musicTaggerService_1.readMetadata)(audioPath);
        // Transform analysis to metadata format
        const newMetadata = (0, musicTaggerService_1.transformAnalysisToMetadata)(analysis, commentStrategy);
        // Merge existing and new metadata
        const mergedMetadata = (0, musicTaggerService_1.mergeMetadata)(existingMetadata, newMetadata, mergeStrategy);
        // Log metadata comparison
        console.log(`Metadata merge strategy: ${mergeStrategy}`);
        console.log("\nExisting metadata:");
        console.log(JSON.stringify((0, id3MetadataHelpers_1.formatMetadataForLog)(existingMetadata), null, 2));
        console.log("\nMerged metadata:");
        console.log(JSON.stringify((0, id3MetadataHelpers_1.formatMetadataForLog)(mergedMetadata), null, 2));
        // Write metadata to file
        await (0, musicTaggerService_1.writeMetadata)(audioPath, mergedMetadata, mergeStrategy);
        console.log("Metadata update completed successfully");
    }
    else {
        // Analysis-only workflow
        const analysis = await (0, musicTaggerService_1.analyzeSong)(audioPath, prompt);
        const analysisFile = await (0, musicTaggerService_1.writeAnalysisToFile)(audioPath, analysis);
        console.log(`Analysis result written to ${analysisFile}`);
    }
}
async function run() {
    const audioPath = argv.audio;
    if (!fs.existsSync(audioPath)) {
        console.error(`Error: Path not found at ${audioPath}`);
        process.exit(1);
    }
    const mergeStrategy = (argv.mergeStrategy ?? "keep-existing");
    const commentStrategy = (argv.commentStrategy ?? "tags+summary");
    const updateMetadataFlag = Boolean(argv["update-metadata"]);
    const prompt = argv.prompt;
    // Check if path is a directory or file
    const stats = fs.statSync(audioPath);
    const isDirectory = stats.isDirectory();
    if (isDirectory) {
        // Directory processing
        console.log(`Scanning directory: ${audioPath}`);
        const audioFiles = (0, musicTaggerService_1.findAudioFiles)(audioPath);
        if (audioFiles.length === 0) {
            console.log("No audio files found in the specified directory.");
            process.exit(0);
        }
        console.log(`Found ${audioFiles.length} audio file(s) to process.\n`);
        const results = [];
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
            }
            catch (error) {
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
    }
    else {
        // Single file processing
        try {
            await processAudioFile(audioPath, updateMetadataFlag, prompt, mergeStrategy, commentStrategy);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Error during processing:", errorMessage);
            process.exit(1);
        }
    }
}
run();
