import * as fs from "fs";
import * as path from "path";
// @ts-ignore - node-id3 may not have TypeScript types
import NodeID3 from "node-id3";
import { transformAnalysisToMetadata as transformToMetadata, mergeMetadata as mergeMetadataFields, prepareMetadataForWriting, } from "./id3MetadataHelpers.js";
const API_BASE_URL = process.env.NODE_ENV === "production"
    ? "https://ai-music-tagger-932142402715.europe-west1.run.app"
    : "http://localhost:3000";
// Example usage:
// const tagger = new MusicTaggerClient();
// const analysis = await tagger.analyzeSong('path/to/audio.mp3');
export class MusicTaggerClient {
    async analyzeSong(audioPath, prompt) {
        console.log(`Analyzing file: ${audioPath}`);
        try {
            const audioBuffer = fs.readFileSync(audioPath);
            const audioBlob = new Blob([audioBuffer]);
            const audioFileSize = audioBlob.size;
            const maxAudioFileSize = 20 * 1024 * 1024;
            console.log(`Audio file size: ${(audioFileSize / (1024 * 1024)).toFixed(2)} MB`);
            if (audioFileSize > maxAudioFileSize) {
                throw new Error(`Audio file size (${audioFileSize}) exceeds the maximum allowed size (${maxAudioFileSize})`);
            }
            const formData = new FormData();
            formData.append("audio", audioBlob, audioPath.split("/").pop());
            if (prompt) {
                formData.append("prompt", prompt);
            }
            console.log("FormData prepared:", formData);
            const apiUrl = `${API_BASE_URL}/analyze`;
            const response = await fetch(apiUrl, {
                method: "POST",
                body: formData,
            });
            console.log("Response:", response);
            if (!response.ok) {
                throw new Error(`Backend request failed with status ${response.status}`);
            }
            const responseData = await response.json();
            console.log("Analysis result:", responseData);
            return responseData;
        }
        catch (error) {
            console.error("Error analyzing song:", error);
            throw error;
        }
    }
    async writeAnalysisToFile(audioPath, analysis) {
        const parsedAudioPath = path.parse(audioPath);
        const analysisFilename = path.join(parsedAudioPath.dir, `${parsedAudioPath.name}-analysis.json`);
        fs.writeFileSync(analysisFilename, JSON.stringify(analysis, null, 2));
        console.log(`Analysis result written to ${analysisFilename}`);
        return analysisFilename;
    }
    async readMetadata(audioPath) {
        try {
            console.log(`Reading file meta data: ${audioPath}`);
            return NodeID3.read(audioPath);
        }
        catch (error) {
            console.error("Error reading metadata:", error);
            throw error;
        }
    }
    async readAnalysisFromFile(audioPath) {
        try {
            // Resolve the audio path to absolute path to ensure correct file location
            const resolvedAudioPath = path.resolve(audioPath);
            const parsedAudioPath = path.parse(resolvedAudioPath);
            const analysisFilename = path.join(parsedAudioPath.dir, `${parsedAudioPath.name}-analysis.json`);
            console.log(`Checking for analysis file for: ${parsedAudioPath.name}`);
            if (!fs.existsSync(analysisFilename)) {
                console.log(`Analysis file not found: ${analysisFilename}`);
                return null;
            }
            console.log(`Analysis file found. Reading: ${analysisFilename}`);
            const analysisContent = fs.readFileSync(analysisFilename, "utf-8");
            const analysis = JSON.parse(analysisContent);
            console.log(`Analysis loaded successfully`);
            return analysis;
        }
        catch (error) {
            console.error("Error reading analysis file:", error);
            // Return null instead of throwing, so the caller can decide to run analysis
            return null;
        }
    }
    transformAnalysisToMetadata(analysis, commentStrategy = "tags+summary") {
        return transformToMetadata(analysis, commentStrategy);
    }
    mergeMetadata(existing, newMetadata, strategy = "keep-existing") {
        return mergeMetadataFields(existing, newMetadata, strategy);
    }
    async writeMetadata(audioPath, metadata, strategy = "keep-existing") {
        try {
            console.log(`Writing metadata to: ${audioPath}`);
            if (!fs.existsSync(audioPath)) {
                throw new Error(`Audio file not found: ${audioPath}`);
            }
            // Read existing tags first
            const existingTags = NodeID3.read(audioPath);
            // Prepare metadata for writing (merge and format)
            const tagsToWrite = prepareMetadataForWriting(existingTags, metadata, strategy);
            // Clean up empty TXXX array if needed
            if (tagsToWrite.userDefinedText &&
                Array.isArray(tagsToWrite.userDefinedText) &&
                tagsToWrite.userDefinedText.length === 0) {
                delete tagsToWrite.userDefinedText;
            }
            // Write the tags
            const success = NodeID3.write(tagsToWrite, audioPath);
            if (!success) {
                throw new Error("Failed to write metadata to file");
            }
            console.log(`Metadata written successfully to file`);
        }
        catch (error) {
            console.error("Error writing metadata:", error);
            throw error;
        }
    }
}
