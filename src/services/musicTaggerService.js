"use strict";
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
exports.hasBeenAnalyzed = hasBeenAnalyzed;
exports.analyzeSong = analyzeSong;
exports.testApiKey = testApiKey;
exports.readMetadata = readMetadata;
exports.readAnalysisFromFile = readAnalysisFromFile;
exports.writeAnalysisToFile = writeAnalysisToFile;
exports.transformAnalysisToMetadata = transformAnalysisToMetadata;
exports.mergeMetadata = mergeMetadata;
exports.writeMetadata = writeMetadata;
exports.findAudioFiles = findAudioFiles;
exports.expandPaths = expandPaths;
const types_1 = require("../shared/types");
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const node_id3_1 = __importDefault(require("node-id3"));
const id3MetadataHelpers_1 = require("./id3MetadataHelpers");
const settingsService_1 = require("./settingsService");
async function hasBeenAnalyzed(audioPath) {
    const isAnalyzed = await readAnalysisFromFile(audioPath);
    if (isAnalyzed)
        return true;
    try {
        const metadata = await readMetadata(audioPath);
        if (metadata) {
            if (metadata.encodedBy === "AI Music Tagger" || metadata.encoder === "AI Music Tagger") {
                return true;
            }
            if (metadata.userDefinedText) {
                const txxx = Array.isArray(metadata.userDefinedText)
                    ? metadata.userDefinedText
                    : [metadata.userDefinedText];
                if (txxx.some((t) => t.description === "Schema Version")) {
                    return true;
                }
            }
        }
    }
    catch (err) {
        // Ignore error reading metadata
    }
    return false;
}
function checkIsLocalDev() {
    if (electron_1.app && !electron_1.app.isPackaged) {
        return true;
    }
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev") {
        return true;
    }
    if (process.versions && process.versions.electron) {
        return process.defaultApp === true;
    }
    // If not electron, assume local dev for CLI usage
    return true;
}
const RAPIDAPI_HOST = "ai-music-analyst.p.rapidapi.com";
const MAX_AUDIO_FILE_SIZE = 20 * 1024 * 1024; // 20MB
function validateFilePath(filePath) {
    const resolved = path.resolve(filePath);
    if (!path.isAbsolute(resolved)) {
        throw new Error("Invalid file path: must be absolute");
    }
    const ext = path.extname(resolved).toLowerCase();
    if (!types_1.AUDIO_EXTENSIONS.includes(ext)) {
        throw new Error(`Invalid file type: ${ext}. Supported: ${types_1.AUDIO_EXTENSIONS.join(", ")}`);
    }
    if (!fs.existsSync(resolved)) {
        throw new Error(`File not found: ${resolved}`);
    }
    return resolved;
}
function validateFileSize(filePath) {
    const stats = fs.statSync(filePath);
    if (stats.size > MAX_AUDIO_FILE_SIZE) {
        throw new Error(`Audio file size (${stats.size}) exceeds maximum allowed (${MAX_AUDIO_FILE_SIZE})`);
    }
}
async function analyzeSong(audioPath, prompt) {
    const resolved = validateFilePath(audioPath);
    validateFileSize(resolved);
    const audioBuffer = fs.readFileSync(resolved);
    const audioBlob = new Blob([audioBuffer]);
    const formData = new FormData();
    formData.append("audio", audioBlob, path.basename(resolved));
    if (prompt) {
        formData.append("prompt", prompt);
    }
    const isLocalDev = checkIsLocalDev();
    const { rapidApiKey, mockAnalysis, useLocalBackend } = (0, settingsService_1.getSettings)();
    // Guard: mock mode is only honoured in dev builds, never in production.
    const useMock = isLocalDev && mockAnalysis;
    const useLocal = isLocalDev && useLocalBackend;
    const API_BASE_URL = useLocal ? "http://localhost:3000" : `https://${RAPIDAPI_HOST}`;
    if (!useLocal && !rapidApiKey) {
        throw new Error("No RapidAPI key configured. Please add your key in Settings.");
    }
    const headers = {};
    if (!useLocal) {
        headers["x-rapidapi-host"] = RAPIDAPI_HOST;
        headers["x-rapidapi-key"] = rapidApiKey;
    }
    let apiUrl = `${API_BASE_URL}/analyze`;
    if (useMock) {
        // Route to the mock endpoint to avoid spending real API tokens during dev.
        apiUrl += `Mock`;
    }
    const maxRetries = 2;
    let attempt = 0;
    while (attempt <= maxRetries) {
        let response;
        try {
            response = await fetch(apiUrl, {
                method: "POST",
                headers,
                body: formData,
            });
        }
        catch (err) {
            if (attempt >= maxRetries) {
                throw err;
            }
            attempt++;
            // Wait before retrying (e.g. 2s, 4s)
            await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
            continue;
        }
        if (!response.ok) {
            const body = await response.text().catch(() => "");
            const errorMsg = `Backend request failed with status ${response.status}${body ? `: ${body}` : ""}`;
            const isRetryable = response.status === 429 || response.status >= 500;
            if (attempt >= maxRetries || !isRetryable) {
                throw new Error(errorMsg);
            }
            attempt++;
            // Wait before retrying (e.g. 2s, 4s)
            await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
            continue;
        }
        return await response.json();
    }
    throw new Error("Backend request failed: Maximum retries reached");
}
async function testApiKey(apiKey) {
    const isLocalDev = checkIsLocalDev();
    const { mockAnalysis, useLocalBackend } = (0, settingsService_1.getSettings)();
    const useMock = isLocalDev && mockAnalysis;
    const useLocal = isLocalDev && useLocalBackend;
    const API_BASE_URL = useLocal ? "http://localhost:3000" : `https://${RAPIDAPI_HOST}`;
    if (!apiKey) {
        return { valid: false, message: "No API key provided." };
    }
    const headers = {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": apiKey,
    };
    let apiUrl = `${API_BASE_URL}/analyze`;
    if (useMock) {
        apiUrl += `Mock`;
    }
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers,
        });
        if (response.status === 403) {
            const body = await response.json().catch(() => ({}));
            return {
                valid: false,
                message: body.message || "Invalid API key or not subscribed to the API."
            };
        }
        const requestsLimit = response.headers.get("x-ratelimit-requests-limit");
        const requestsRemaining = response.headers.get("x-ratelimit-requests-remaining");
        const requestsReset = response.headers.get("x-ratelimit-requests-reset");
        return {
            valid: true,
            requestsLimit: requestsLimit ? parseInt(requestsLimit, 10) : undefined,
            requestsRemaining: requestsRemaining ? parseInt(requestsRemaining, 10) : undefined,
            requestsReset: requestsReset ? parseInt(requestsReset, 10) : undefined,
            message: "API key is valid."
        };
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { valid: false, message: `Request failed: ${msg}` };
    }
}
async function readMetadata(audioPath) {
    const resolved = validateFilePath(audioPath);
    return node_id3_1.default.read(resolved);
}
async function readAnalysisFromFile(audioPath) {
    const resolved = path.resolve(audioPath);
    const parsed = path.parse(resolved);
    const analysisFilename = path.join(parsed.dir, `${parsed.name}-analysis.json`);
    if (!fs.existsSync(analysisFilename)) {
        return null;
    }
    const analysisContent = fs.readFileSync(analysisFilename, "utf-8");
    return JSON.parse(analysisContent);
}
async function writeAnalysisToFile(audioPath, analysis) {
    const resolved = validateFilePath(audioPath);
    const parsed = path.parse(resolved);
    const analysisFilename = path.join(parsed.dir, `${parsed.name}-analysis.json`);
    fs.writeFileSync(analysisFilename, JSON.stringify(analysis, null, 2));
    return analysisFilename;
}
function transformAnalysisToMetadata(analysis, commentStrategy = "tags+summary") {
    return (0, id3MetadataHelpers_1.transformAnalysisToMetadata)(analysis, commentStrategy);
}
function mergeMetadata(existing, newMetadata, strategy = "keep-existing") {
    return (0, id3MetadataHelpers_1.mergeMetadata)(existing, newMetadata, strategy);
}
async function writeMetadata(audioPath, metadata, strategy = "keep-existing") {
    const resolved = validateFilePath(audioPath);
    const existingTags = node_id3_1.default.read(resolved);
    const tagsToWrite = (0, id3MetadataHelpers_1.prepareMetadataForWriting)(existingTags, metadata, strategy);
    if (tagsToWrite.userDefinedText &&
        Array.isArray(tagsToWrite.userDefinedText) &&
        tagsToWrite.userDefinedText.length === 0) {
        delete tagsToWrite.userDefinedText;
    }
    const success = node_id3_1.default.write(tagsToWrite, resolved);
    if (!success) {
        throw new Error("Failed to write metadata to file");
    }
}
function findAudioFiles(dirPath) {
    const audioFiles = [];
    const resolvedPath = path.resolve(dirPath);
    function walkDir(currentPath) {
        try {
            const entries = fs.readdirSync(currentPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.name.startsWith("."))
                    continue;
                const fullPath = path.join(currentPath, entry.name);
                if (entry.isDirectory()) {
                    walkDir(fullPath);
                }
                else if (entry.isFile()) {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (types_1.AUDIO_EXTENSIONS.includes(ext)) {
                        audioFiles.push(fullPath);
                    }
                }
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.warn(`Could not read directory ${currentPath}: ${msg}`);
        }
    }
    walkDir(resolvedPath);
    return audioFiles;
}
function expandPaths(paths) {
    const allFiles = [];
    for (const p of paths) {
        if (!p)
            continue;
        try {
            const resolved = path.resolve(p);
            if (!fs.existsSync(resolved))
                continue;
            const stats = fs.statSync(resolved);
            if (stats.isDirectory()) {
                allFiles.push(...findAudioFiles(resolved));
            }
            else if (stats.isFile()) {
                const ext = path.extname(resolved).toLowerCase();
                if (types_1.AUDIO_EXTENSIONS.includes(ext)) {
                    allFiles.push(resolved);
                }
            }
        }
        catch (err) {
            console.warn(`Failed to process path ${p}:`, err);
        }
    }
    return [...new Set(allFiles)]; // Remove duplicates
}
