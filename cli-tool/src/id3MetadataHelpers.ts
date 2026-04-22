import { AnalysisResult } from "./models/types.js";

/**
 * Merge strategy for combining existing and new metadata values
 */
export type MergeStrategy = "overwrite" | "keep-existing" | "combine";

/**
 * Comment strategy for formatting the comment field in ID3 metadata
 */
export type CommentStrategy = "summary" | "hashtags" | "tags" | "tags+summary";

/**
 * Helper functions for ID3v2.4 metadata transformation
 */

/**
 * Converts ISO-639-1 (2-letter) language code to ISO-639-2 (3-letter) code
 * Used for TLAN frame which requires ISO-639-2 format
 */
export function iso6391To6392(code: string): string {
  const mapping: Record<string, string> = {
    de: "deu",
    en: "eng",
    es: "spa",
    fr: "fra",
    it: "ita",
    pt: "por",
    ru: "rus",
    ja: "jpn",
    ko: "kor",
    zh: "zho",
    ar: "ara",
    hi: "hin",
    nl: "nld",
    pl: "pol",
    tr: "tur",
    sv: "swe",
    da: "dan",
    no: "nor",
    fi: "fin",
    cs: "ces",
    hu: "hun",
    ro: "ron",
    el: "ell",
    he: "heb",
    th: "tha",
    vi: "vie",
    id: "ind",
    ms: "msa",
    uk: "ukr",
  };
  return mapping[code.toLowerCase()] || code.toLowerCase();
}

/**
 * Converts Camelot key notation (e.g., "9B") to standard musical key notation (e.g., "G")
 * Camelot wheel mapping:
 * 1A = Abm, 1B = B, 2A = Ebm, 2B = F#, 3A = Bbm, 3B = Db, 4A = Fm, 4B = Ab,
 * 5A = Cm, 5B = Eb, 6A = Gm, 6B = Bb, 7A = Dm, 7B = F, 8A = Am, 8B = C,
 * 9A = Em, 9B = G, 10A = Bm, 10B = D, 11A = F#m, 11B = A, 12A = C#m, 12B = E
 */
export function camelotToStandardKey(camelotKey: string): string {
  const mapping: Record<string, string> = {
    "1A": "Abm",
    "1B": "B",
    "2A": "Ebm",
    "2B": "F#",
    "3A": "Bbm",
    "3B": "Db",
    "4A": "Fm",
    "4B": "Ab",
    "5A": "Cm",
    "5B": "Eb",
    "6A": "Gm",
    "6B": "Bb",
    "7A": "Dm",
    "7B": "F",
    "8A": "Am",
    "8B": "C",
    "9A": "Em",
    "9B": "G",
    "10A": "Bm",
    "10B": "D",
    "11A": "F#m",
    "11B": "A",
    "12A": "C#m",
    "12B": "E",
  };
  return mapping[camelotKey] || camelotKey;
}

/**
 * Formats array of strings for ID3v2.4 multiple value fields (null-separated)
 * For node-id3, we'll use arrays which it will handle appropriately
 */
export function formatMultipleValues(values: string[]): string[] {
  return values.filter((v) => v && v.trim().length > 0);
}

/**
 * Helper function to add a TXXX field to an array
 */
function addTXXXField(
  array: Array<{ description: string; value: string }>,
  description: string,
  value: string | number | boolean | undefined
): void {
  if (value !== undefined && value !== null) {
    array.push({ description, value: String(value) });
  }
}

/**
 * Creates TXXX (user-defined text) fields from analysis data
 * Note: TXXX field descriptions (keys) can contain whitespaces per ID3v2.4 spec
 * Returns array format matching node-id3's native format
 */
export function createTXXXFields(
  analysis: AnalysisResult
): Array<{ description: string; value: string }> {
  const txxx: Array<{ description: string; value: string }> = [];

  // Energy fields
  if (analysis.moodsAndFeelings?.energy) {
    addTXXXField(txxx, "Energy", analysis.moodsAndFeelings.energy);
    if (analysis.moodsAndFeelings.energyScore !== undefined) {
      addTXXXField(
        txxx,
        "Energy Score",
        analysis.moodsAndFeelings.energyScore.toFixed(2)
      );
    }
  }

  // Danceability fields
  if (analysis.moodsAndFeelings?.danceability) {
    addTXXXField(txxx, "Danceability", analysis.moodsAndFeelings.danceability);
    if (analysis.moodsAndFeelings.danceabilityScore !== undefined) {
      addTXXXField(
        txxx,
        "Danceability Score",
        analysis.moodsAndFeelings.danceabilityScore.toFixed(2)
      );
    }
  }

  // Valence
  if (analysis.moodsAndFeelings?.valence) {
    addTXXXField(txxx, "Valence", analysis.moodsAndFeelings.valence);
  }

  // Mixing scores
  if (analysis.mixing?.mixabilityScore !== undefined) {
    addTXXXField(
      txxx,
      "Mixability Score",
      analysis.mixing.mixabilityScore.toFixed(2)
    );
  }
  if (analysis.mixing?.commercialAppealScore !== undefined) {
    addTXXXField(
      txxx,
      "Commercial Appeal Score",
      analysis.mixing.commercialAppealScore.toFixed(2)
    );
  }

  // Mix roles and occasions
  if (analysis.mixing?.suitableMixRoles?.length > 0) {
    addTXXXField(
      txxx,
      "Mix Roles",
      analysis.mixing.suitableMixRoles.join(", ")
    );
  }
  if (analysis.mixing?.suitableOccasions?.length > 0) {
    addTXXXField(
      txxx,
      "Occasions",
      analysis.mixing.suitableOccasions.join(", ")
    );
  }

  // Mixing notes
  if (analysis.mixing?.introMixingNotes) {
    addTXXXField(txxx, "Intro Notes", analysis.mixing.introMixingNotes);
  }
  if (analysis.mixing?.outroMixingNotes) {
    addTXXXField(txxx, "Outro Notes", analysis.mixing.outroMixingNotes);
  }

  // Section summaries
  if (analysis.genres?.summary) {
    addTXXXField(txxx, "Genres Summary", analysis.genres.summary);
  }
  if (analysis.moodsAndFeelings?.summary) {
    addTXXXField(txxx, "Moods Summary", analysis.moodsAndFeelings.summary);
  }
  if (analysis.instrumentation?.summary) {
    addTXXXField(txxx, "Instrumentation Summary", analysis.instrumentation.summary);
  }
  if (analysis.vocals?.summary) {
    addTXXXField(txxx, "Vocals Summary", analysis.vocals.summary);
  }

  // Genres
  if (analysis.genres?.secondary?.length > 0) {
    addTXXXField(
      txxx,
      "Secondary Genres",
      analysis.genres.secondary.join(", ")
    );
  }
  if (analysis.genres?.influences?.length > 0) {
    addTXXXField(txxx, "Influences", analysis.genres.influences.join(", "));
  }

  // Tags
  if (analysis.descriptiveTags?.length > 0) {
    addTXXXField(txxx, "Tags", analysis.descriptiveTags.join(", "));
  }

  // Moods and vibes
  if (analysis.moodsAndFeelings?.moods?.length > 0) {
    addTXXXField(txxx, "Moods", analysis.moodsAndFeelings.moods.join(", "));
  }
  if (analysis.moodsAndFeelings?.vibes?.length > 0) {
    addTXXXField(txxx, "Vibes", analysis.moodsAndFeelings.vibes.join(", "));
  }
  if (analysis.moodsAndFeelings?.emotions?.length > 0) {
    addTXXXField(
      txxx,
      "Emotions",
      analysis.moodsAndFeelings.emotions.join(", ")
    );
  }

  // Instrumentation
  if (analysis.instrumentation?.instrumentationType) {
    addTXXXField(
      txxx,
      "Instrumentation Type",
      analysis.instrumentation.instrumentationType
    );
  }
  if (analysis.instrumentation?.leadInstruments?.length > 0) {
    addTXXXField(
      txxx,
      "Lead Instruments",
      analysis.instrumentation.leadInstruments.join(", ")
    );
  }

  // Vocals
  if (analysis.vocals?.vocalPresence) {
    addTXXXField(txxx, "Vocal Presence", analysis.vocals.vocalPresence);
  }
  if (analysis.vocals?.vocalTypes?.length > 0) {
    addTXXXField(txxx, "Vocal Types", analysis.vocals.vocalTypes.join(", "));
  }
  if (analysis.vocals?.lyricalThemes?.length > 0) {
    addTXXXField(
      txxx,
      "Lyrical Themes",
      analysis.vocals.lyricalThemes.join(", ")
    );
  }
  if (analysis.vocals?.explicitContent !== undefined) {
    addTXXXField(
      txxx,
      "Explicit Content",
      analysis.vocals.explicitContent.toString()
    );
  }
  if (analysis.vocals?.sampleSources?.length > 0) {
    addTXXXField(
      txxx,
      "Sample Sources",
      analysis.vocals.sampleSources.join(", ")
    );
  }

  // Technical composition fields
  if (analysis.mixing?.timeSignature) {
    addTXXXField(txxx, "Time Signature", analysis.mixing.timeSignature);
  }
  if (analysis.mixing?.musicalMode) {
    addTXXXField(txxx, "Musical Mode", analysis.mixing.musicalMode);
  }
  if (analysis.compositionAndProduction?.rhythmicComplexityLevel) {
    addTXXXField(
      txxx,
      "Rhythmic Complexity",
      analysis.compositionAndProduction.rhythmicComplexityLevel
    );
  }
  if (analysis.compositionAndProduction?.rhythmicFeel) {
    addTXXXField(
      txxx,
      "Rhythmic Feel",
      analysis.compositionAndProduction.rhythmicFeel
    );
  }
  if (analysis.compositionAndProduction?.melodicComplexityLevel) {
    addTXXXField(
      txxx,
      "Melodic Complexity",
      analysis.compositionAndProduction.melodicComplexityLevel
    );
  }
  if (analysis.compositionAndProduction?.harmonicSystem) {
    addTXXXField(
      txxx,
      "Harmonic System",
      analysis.compositionAndProduction.harmonicSystem
    );
  }
  if (analysis.compositionAndProduction?.harmonicComplexityLevel) {
    addTXXXField(
      txxx,
      "Harmonic Complexity",
      analysis.compositionAndProduction.harmonicComplexityLevel
    );
  }
  if (analysis.compositionAndProduction?.productionStyle) {
    addTXXXField(
      txxx,
      "Production Style",
      analysis.compositionAndProduction.productionStyle
    );
  }
  if (analysis.compositionAndProduction?.timbreDescriptors?.length > 0) {
    addTXXXField(
      txxx,
      "Timbre Descriptors",
      analysis.compositionAndProduction.timbreDescriptors.join(", ")
    );
  }
  if (analysis.compositionAndProduction?.sonicTexture?.length > 0) {
    addTXXXField(
      txxx,
      "Sonic Texture",
      analysis.compositionAndProduction.sonicTexture.join(", ")
    );
  }

  // Cue points and structure (as JSON strings for structured data)
  if (analysis.mixing?.suggestedCuePoints?.length > 0) {
    addTXXXField(
      txxx,
      "Cue Points",
      JSON.stringify(analysis.mixing.suggestedCuePoints)
    );
  }
  if (analysis.mixing?.songStructureSegments?.length > 0) {
    addTXXXField(
      txxx,
      "Song Structure",
      JSON.stringify(analysis.mixing.songStructureSegments)
    );
  }

  // Stems analysis (V17)
  if (analysis.stems) {
    if (analysis.stems.drums?.summary) {
      addTXXXField(txxx, "Stems: Drums", analysis.stems.drums.summary);
    }
    if (analysis.stems.bass?.summary) {
      addTXXXField(txxx, "Stems: Bass", analysis.stems.bass.summary);
    }
    if (analysis.stems.vocals?.summary) {
      addTXXXField(txxx, "Stems: Vocals", analysis.stems.vocals.summary);
    }
    if (analysis.stems.other?.summary) {
      addTXXXField(txxx, "Stems: Other", analysis.stems.other.summary);
    }
  }

  // Schema version
  if (analysis.schemaVersion) {
    addTXXXField(txxx, "Schema Version", analysis.schemaVersion.toString());
  }

  return txxx;
}

/**
 * Formats a tag string for hashtag use
 * - Replaces whitespaces with dashes
 * - Special case: removes whitespaces around special characters (e.g., "Drum & Bass" -> "Drum&Bass")
 */
function formatTagForHashtag(tag: string): string {
  // First, remove whitespaces around special characters
  let formatted = tag.replace(/\s+([&@#$%^*+=|\\/<>?~`!])\s+/g, "$1");
  formatted = formatted.replace(/\s+([&@#$%^*+=|\\/<>?~`!])/g, "$1");
  formatted = formatted.replace(/([&@#$%^*+=|\\/<>?~`!])\s+/g, "$1");

  // Then replace remaining whitespaces with dashes
  formatted = formatted.replace(/\s+/g, "-");

  return formatted;
}

/**
 * Combines tags from descriptiveTags, moods, emotions, influences, genres, vibes, and lyricalThemes into a single set
 */
function collectAllTags(analysis: AnalysisResult): string[] {
  const tags = new Set<string>();

  // Add primary genres
  if (analysis.genres?.primary) {
    analysis.genres.primary.forEach((tag) => tags.add(tag));
  }

  // Add secondary genres
  if (analysis.genres?.secondary) {
    analysis.genres.secondary.forEach((tag) => tags.add(tag));
  }

  // Add influences
  if (analysis.genres?.influences) {
    analysis.genres.influences.forEach((tag) => tags.add(tag));
  }

  // Add descriptive tags
  if (analysis.descriptiveTags) {
    analysis.descriptiveTags.forEach((tag) => tags.add(tag));
  }

  // Add moods
  if (analysis.moodsAndFeelings?.moods) {
    analysis.moodsAndFeelings.moods.forEach((tag) => tags.add(tag));
  }

  // Add vibes
  if (analysis.moodsAndFeelings?.vibes) {
    analysis.moodsAndFeelings.vibes.forEach((tag) => tags.add(tag));
  }

  // Add emotions
  if (analysis.moodsAndFeelings?.emotions) {
    analysis.moodsAndFeelings.emotions.forEach((tag) => tags.add(tag));
  }

  // Add lyrical themes
  if (analysis.vocals?.lyricalThemes) {
    analysis.vocals.lyricalThemes.forEach((tag) => tags.add(tag));
  }

  return Array.from(tags).sort();
}

/**
 * Formats tags as hashtags (e.g., "#tag1 #tag2 #tag3")
 */
function formatTagsAsHashtags(tags: string[]): string {
  return tags
    .map((tag) => formatTagForHashtag(tag))
    .map((tag) => `#${tag}`)
    .join(" ");
}

/**
 * Formats tags as CSV string
 */
function formatTagsAsCSV(tags: string[]): string {
  return tags.join(", ");
}

/**
 * Generates comment text based on the comment strategy
 */
function generateCommentText(
  analysis: AnalysisResult,
  strategy: CommentStrategy = "tags+summary"
): string | undefined {
  if (strategy === "summary") {
    return analysis.summary;
  }

  const allTags = collectAllTags(analysis);

  if (strategy === "hashtags") {
    if (allTags.length === 0) {
      return analysis.summary; // Fallback to summary if no tags
    }
    return formatTagsAsHashtags(allTags);
  }

  if (strategy === "tags") {
    if (allTags.length === 0) {
      return analysis.summary; // Fallback to summary if no tags
    }
    return formatTagsAsCSV(allTags);
  }

  if (strategy === "tags+summary") {
    if (allTags.length === 0) {
      return analysis.summary; // Fallback to summary if no tags
    }
    const tagsCSV = formatTagsAsCSV(allTags);
    const summary = analysis.summary || "";
    return summary ? `${tagsCSV}\n\n${summary}` : tagsCSV;
  }

  return analysis.summary; // Default fallback
}

/**
 * Transforms analysis results into ID3v2.4 metadata format
 */
export function transformAnalysisToMetadata(
  analysis: AnalysisResult,
  commentStrategy: CommentStrategy = "tags+summary"
): any {
  const metadata: any = {};

  // Standard ID3v2.4 frames

  // TCON - Content type (Genre)
  // Use single genre value for maximum compatibility (ID3v2.3 and DJ software like Engine DJ/Rekordbox)
  // Store the first primary genre as the main genre field
  // Secondary genres are already stored in TXXX "Secondary Genres" field
  if (analysis.genres?.primary && analysis.genres.primary.length > 0) {
    metadata.genre = analysis.genres.primary[0];
  }

  // TBPM - BPM (beats per minute) - must be numeric string
  if (analysis.mixing?.bpm) {
    metadata.bpm = analysis.mixing.bpm.toString();
  }

  // TKEY - Initial key - convert Camelot to standard notation
  // Note: Many DJ software use Camelot notation in TKEY despite spec
  // We'll store both: standard in TKEY, Camelot in TXXX
  if (analysis.mixing?.musicalKey) {
    const standardKey = camelotToStandardKey(analysis.mixing.musicalKey);
    metadata.key = standardKey;
  }

  // TMOO - Mood
  // Use single mood value for maximum compatibility (ID3v2.3 and DJ software)
  // Store the first mood as the main mood field
  if (
    analysis.moodsAndFeelings?.moods &&
    analysis.moodsAndFeelings.moods.length > 0
  ) {
    metadata.mood = analysis.moodsAndFeelings.moods[0];
  }

  // TLAN - Language
  // Use single language value for maximum compatibility (ID3v2.3 and DJ software)
  // Store the first language (most prominent) as the main language field
  if (
    analysis.vocals?.lyricalLanguages &&
    analysis.vocals.lyricalLanguages.length > 0
  ) {
    // Languages are already sorted by prominence, so use the first one
    const firstLanguage = analysis.vocals.lyricalLanguages[0];
    const languageCode = iso6391To6392(firstLanguage.code);
    if (languageCode) {
      metadata.language = languageCode;
    }
  }

  // TIT1 - Content group description (for mix roles/occasions)
  // Use single mix role value for maximum compatibility (ID3v2.3 and DJ software)
  // Store the first mix role as the main contentGroup field
  if (
    analysis.mixing?.suitableMixRoles &&
    analysis.mixing.suitableMixRoles.length > 0
  ) {
    metadata.contentGroup = analysis.mixing.suitableMixRoles[0];
  }

  // TIT3 - Subtitle/Description refinement
  // Could use for descriptive title if different from main title
  // Or for mix version info
  if (analysis.descriptiveTitle) {
    // Only set if it's different from what might be in TIT2
    metadata.subtitle = analysis.descriptiveTitle;
  }

  // TPE4 - Interpreted, remixed, or otherwise modified by
  // Try to extract remixer from sample sources
  if (
    analysis.vocals?.sampleSources &&
    analysis.vocals.sampleSources.length > 0
  ) {
    // Look for patterns like "Artist - Song" or "Artist Remix"
    const remixInfo = analysis.vocals.sampleSources.find((source) =>
      /remix|mix|edit/i.test(source)
    );
    if (remixInfo) {
      // Extract artist name (simple heuristic)
      const match = remixInfo.match(/^([^-]+)/);
      if (match) {
        metadata.remixArtist = match[1].trim();
      }
    }
  }

  // COMM - Comments (format based on comment strategy)
  const commentText = generateCommentText(analysis, commentStrategy);
  if (commentText) {
    metadata.comment = {
      language: "eng",
      text: commentText,
    };
  }

  // TSSE - Software/Hardware and settings used for encoding
  metadata.encodedBy = "AI Music Tagger";

  // TENC - Encoded by
  metadata.encoder = "AI Music Tagger";

  // TDTG - Tagging time (current timestamp)
  // node-id3 expects date in YYYY-MM-DD or YYYY format
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD format
  metadata.date = dateStr;

  // TDEN - Encoding time (same as tagging time for our use case)
  // Note: node-id3 might use different field name, but we'll try this
  metadata.encodingTime = dateStr;

  // TXXX - User-defined text information frames
  const txxxFields = createTXXXFields(analysis);
  if (txxxFields.length > 0) {
    // Store Camelot key in TXXX if we converted it
    if (analysis.mixing?.musicalKey) {
      txxxFields.push({
        description: "Key (Camelot)",
        value: analysis.mixing.musicalKey,
      });
    }
    metadata.userDefinedText = txxxFields;
  }

  return metadata;
}

/**
 * Checks if a field value is empty or missing
 */
export function isFieldEmpty(value: any): boolean {
  if (!value) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Checks if a genre value is effectively empty (including "Music" placeholder)
 * "Music" is often used as a default placeholder when downloaded from YouTube
 * and should be treated as if no genre is set
 */
function isGenreEmpty(value: any): boolean {
  if (isFieldEmpty(value)) return true;

  // Check if it's a single string "Music"
  if (typeof value === "string" && value.trim().toLowerCase() === "music") {
    return true;
  }

  // Check if it's an array with only "Music"
  if (Array.isArray(value)) {
    const filtered = value.filter(
      (v) => v && typeof v === "string" && v.trim().toLowerCase() !== "music"
    );
    return filtered.length === 0;
  }

  return false;
}

/**
 * Helper functions for working with TXXX arrays
 */

/**
 * Finds a TXXX item by description in an array
 */
function findTXXXItem(
  array: Array<{ description: string; value: string }>,
  description: string
): { description: string; value: string } | undefined {
  return array.find(
    (item) =>
      item && item.description !== undefined && item.description === description
  );
}

/**
 * Sets or updates a TXXX value in an array
 */
function setTXXXValue(
  array: Array<{ description: string; value: string }>,
  description: string,
  value: string
): void {
  const existing = findTXXXItem(array, description);
  if (existing) {
    existing.value = value;
  } else {
    array.push({ description, value });
  }
}

/**
 * Normalizes a TXXX array by filtering invalid entries
 */
function normalizeTXXXArray(
  txxx: any
): Array<{ description: string; value: string }> {
  if (!Array.isArray(txxx)) {
    return [];
  }
  return txxx.filter(
    (item) =>
      item &&
      item.description !== undefined &&
      item.description !== null &&
      item.description !== "" &&
      item.value !== undefined &&
      item.value !== null &&
      String(item.value) !== "undefined"
  );
}

/**
 * Merges two arrays, creating a union (no duplicates)
 */
function mergeArrays<T>(existing: T[], newArray: T[]): T[] {
  const result = [...(existing || [])];
  for (const item of newArray || []) {
    if (!result.includes(item)) {
      result.push(item);
    }
  }
  return result;
}

/**
 * Checks if a string is a CSV (comma-separated values)
 */
function isCSVString(value: string): boolean {
  return typeof value === "string" && value.includes(",");
}

/**
 * Parses a CSV string into an array
 */
function parseCSV(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

/**
 * Formats an array back to CSV string
 */
function formatCSV(values: string[]): string {
  return values.join(", ");
}

/**
 * Merges two TXXX arrays based on the merge strategy
 */
function mergeTXXXArrays(
  existing: Array<{ description: string; value: string }>,
  newArray: Array<{ description: string; value: string }>,
  strategy: MergeStrategy = "keep-existing"
): Array<{ description: string; value: string }> {
  const result = [...normalizeTXXXArray(existing)];

  for (const newItem of normalizeTXXXArray(newArray)) {
    const existingItem = findTXXXItem(result, newItem.description);

    if (strategy === "overwrite") {
      // Overwrite only when there's a conflict (same description)
      // Keep existing items that don't exist in new array
      if (existingItem) {
        // Conflict: overwrite existing value
        existingItem.value = newItem.value;
      } else {
        // No conflict: add new item
        result.push({ description: newItem.description, value: newItem.value });
      }
    } else if (strategy === "combine") {
      if (existingItem) {
        // Entry exists - merge based on value type
        const existingValue = existingItem.value;
        const newValue = newItem.value;

        if (isCSVString(existingValue) || isCSVString(newValue)) {
          // Both or either is CSV - parse and merge arrays
          const existingArray = isCSVString(existingValue)
            ? parseCSV(existingValue)
            : [existingValue];
          const newArray = isCSVString(newValue)
            ? parseCSV(newValue)
            : [newValue];
          const merged = mergeArrays(existingArray, newArray);
          existingItem.value = formatCSV(merged);
        } else {
          // Single string values - keep existing
          // Don't update the value
        }
      } else {
        // No existing entry - add new one
        result.push({ description: newItem.description, value: newItem.value });
      }
    } else {
      // "keep-existing" strategy - only update if existing is empty
      if (!existingItem || isFieldEmpty(existingItem.value)) {
        setTXXXValue(result, newItem.description, newItem.value);
      }
    }
  }

  return result;
}

/**
 * Merges new metadata with existing metadata based on the specified strategy
 */
export function mergeMetadata(
  existing: any,
  newMetadata: any,
  strategy: MergeStrategy = "keep-existing"
): any {
  const merged: any = { ...existing };

  // Helper to merge a field based on strategy
  const mergeField = (
    field: string,
    newValue: any,
    isArray: boolean = false
  ) => {
    if (!newValue) return;

    if (strategy === "overwrite") {
      // Always use new value
      merged[field] = newValue;
    } else if (strategy === "combine") {
      if (
        isArray &&
        Array.isArray(existing?.[field]) &&
        Array.isArray(newValue)
      ) {
        // Merge arrays (union)
        const mergedArray = mergeArrays(existing[field], newValue);
        merged[field] = mergedArray;
      } else if (isArray && Array.isArray(newValue)) {
        // New is array, existing is not - use new
        merged[field] = newValue;
      } else if (isArray && Array.isArray(existing?.[field])) {
        // Existing is array, new is not - keep existing
        // Don't update
      } else {
        // Single value - keep existing if present
        if (!existing?.[field] || isFieldEmpty(existing[field])) {
          merged[field] = newValue;
        }
      }
    } else {
      // "keep-existing" strategy - only update if existing is empty
      if (isFieldEmpty(existing?.[field])) {
        merged[field] = newValue;
      }
    }
  };

  // Genre field - single string value for compatibility
  // Genre has special handling: treat "Music" as empty
  // Note: Genre is now a single string, not an array, for maximum compatibility with DJ software
  if (newMetadata.genre) {
    // Normalize to string (in case it's an array from old code or node-id3 returns array)
    const newGenreValue = Array.isArray(newMetadata.genre)
      ? newMetadata.genre[0]
      : newMetadata.genre;
    const existingGenreValue = Array.isArray(existing?.genre)
      ? existing.genre[0]
      : existing?.genre;

    if (strategy === "overwrite") {
      // Always use new value
      merged.genre = newGenreValue;
    } else if (strategy === "combine") {
      // Keep existing if present and not "Music", otherwise use new
      if (isGenreEmpty(existingGenreValue)) {
        merged.genre = newGenreValue;
      }
    } else {
      // "keep-existing" strategy - only update if existing is empty or "Music"
      if (isGenreEmpty(existingGenreValue)) {
        merged.genre = newGenreValue;
      }
    }
  }

  // Note: genre, mood, language, and contentGroup are now single strings, not arrays
  // Handle them as single values for maximum compatibility
  mergeField("mood", newMetadata.mood, false);
  mergeField("language", newMetadata.language, false);
  mergeField("contentGroup", newMetadata.contentGroup, false);

  // Single value fields
  mergeField("bpm", newMetadata.bpm);
  mergeField("key", newMetadata.key);
  mergeField("subtitle", newMetadata.subtitle);
  mergeField("remixArtist", newMetadata.remixArtist);
  mergeField("comment", newMetadata.comment);

  // Encoder fields - always update (these are metadata about our tool)
  // We always want to indicate that AI Music Tagger processed this file
  if (newMetadata.encodedBy) {
    merged.encodedBy = newMetadata.encodedBy;
  }
  if (newMetadata.encoder) {
    merged.encoder = newMetadata.encoder;
  }

  // Date fields - behavior depends on strategy
  if (strategy === "overwrite") {
    if (newMetadata.date) {
      merged.date = newMetadata.date;
    }
    if (newMetadata.encodingTime) {
      merged.encodingTime = newMetadata.encodingTime;
    }
  } else if (strategy === "combine") {
    // Keep existing date fields
    if (!existing?.date || isFieldEmpty(existing.date)) {
      if (newMetadata.date) {
        merged.date = newMetadata.date;
      }
    }
    if (!existing?.encodingTime || isFieldEmpty(existing.encodingTime)) {
      if (newMetadata.encodingTime) {
        merged.encodingTime = newMetadata.encodingTime;
      }
    }
  } else {
    // "keep-existing" - only set if not already present
    if (isFieldEmpty(existing?.date) && newMetadata.date) {
      merged.date = newMetadata.date;
    }
    if (isFieldEmpty(existing?.encodingTime) && newMetadata.encodingTime) {
      merged.encodingTime = newMetadata.encodingTime;
    }
  }

  // TXXX user-defined fields - merge carefully
  // node-id3 reads and writes TXXX as array format, we work with arrays throughout
  if (newMetadata.userDefinedText) {
    const existingTXXX = normalizeTXXXArray(merged.userDefinedText);
    const newTXXX = normalizeTXXXArray(newMetadata.userDefinedText);

    // Merge arrays based on strategy
    const mergedTXXX = mergeTXXXArrays(existingTXXX, newTXXX, strategy);

    merged.userDefinedText = mergedTXXX;
  } else if (merged.userDefinedText) {
    // No new TXXX fields, but preserve existing ones (normalize to array format)
    merged.userDefinedText = normalizeTXXXArray(merged.userDefinedText);
  }

  return merged;
}

/**
 * Prepares metadata for writing to file
 * Pure function that takes existing tags and new metadata, merges them, and returns metadata ready to write
 * This function has no side effects and is easily testable
 */
export function prepareMetadataForWriting(
  existingTags: any,
  newMetadata: any,
  strategy: MergeStrategy = "keep-existing"
): any {
  // Merge existing and new metadata
  const merged = mergeMetadata(existingTags, newMetadata, strategy);

  // Ensure TXXX fields are in array format (they should already be from mergeMetadata)
  if (merged.userDefinedText) {
    if (!Array.isArray(merged.userDefinedText)) {
      // Fallback: if somehow not an array, normalize it
      merged.userDefinedText = normalizeTXXXArray(merged.userDefinedText);
    }
  }

  // Return metadata ready to write (all fields properly formatted)
  return merged;
}

/**
 * Normalizes metadata for comparison by removing timestamp fields and sorting arrays
 * This function is useful for testing to compare metadata before and after write operations
 */
export function normalizeMetadataForComparison(metadata: any): any {
  if (!metadata) return metadata;

  const normalized: any = { ...metadata };

  // Remove timestamp fields that may change
  delete normalized.date;
  delete normalized.encodingTime;

  // Sort TXXX arrays by description for consistent comparison
  if (normalized.userDefinedText && Array.isArray(normalized.userDefinedText)) {
    normalized.userDefinedText = [...normalized.userDefinedText].sort(
      (a, b) => {
        const descA = a?.description || "";
        const descB = b?.description || "";
        return descA.localeCompare(descB);
      }
    );
  }

  // Normalize comment objects
  if (normalized.comment) {
    if (typeof normalized.comment === "object" && normalized.comment !== null) {
      // Ensure consistent structure
      normalized.comment = {
        language: normalized.comment.language || "eng",
        text: normalized.comment.text || String(normalized.comment),
      };
    } else {
      // Convert string to object format
      normalized.comment = {
        language: "eng",
        text: String(normalized.comment),
      };
    }
  }

  // Sort other arrays for consistent comparison
  // Note: genre, mood, language, and contentGroup are now single strings, not arrays
  const arrayFields: string[] = []; // No array fields for standard ID3 frames anymore

  // Normalize single-value fields to strings (in case they're arrays from old code)
  const singleValueFields = ["genre", "mood", "language", "contentGroup"];
  for (const field of singleValueFields) {
    if (normalized[field]) {
      if (Array.isArray(normalized[field])) {
        normalized[field] = normalized[field][0] || "";
      }
    }
  }

  return normalized;
}

/**
 * Formats metadata for logging, converting objects to readable JSON and handling large arrays/buffers
 */
export function formatMetadataForLog(tags: any): any {
  if (!tags) return tags;

  const tryParseJSON = (str: string): any => {
    if (typeof str !== "string" || !str.trim().match(/^[{\[]/)) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const formatImageBuffer = (imgBuf: any): any => {
    if (Array.isArray(imgBuf?.data)) {
      return { ...imgBuf, data: `<Array of ${imgBuf.data.length} bytes>` };
    }
    if (Buffer.isBuffer(imgBuf)) {
      return `<Buffer ${imgBuf.length} bytes>`;
    }
    return imgBuf;
  };

  const formatValue = (val: any, maxLen = 200): any => {
    if (val == null || typeof val === "number" || typeof val === "boolean")
      return val;
    if (typeof val === "string") {
      const parsed = tryParseJSON(val);
      if (parsed) return parsed;
      return val.length > maxLen ? val.substring(0, maxLen) + "..." : val;
    }
    if (Array.isArray(val)) {
      return val.length > 100
        ? `<Array of ${val.length} items>`
        : val.map((item) => formatValue(item, maxLen));
    }
    if (Buffer.isBuffer(val)) return `<Buffer ${val.length} bytes>`;
    if (typeof val === "object") {
      try {
        const json = JSON.stringify(val, null, 2);
        return json.length > maxLen ? json.substring(0, maxLen) + "..." : val;
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  const formatTXXX = (items: any[]): any[] =>
    items.map((item) => {
      if (!item || typeof item !== "object") return item;
      if (item.description !== undefined && item.value !== undefined) {
        const val = String(item.value ?? "");
        return {
          description: item.description || "",
          value: val.length > 150 ? val.substring(0, 150) + "..." : val,
        };
      }
      return item;
    });

  const formatUserDefinedText = (value: any): any => {
    if (Array.isArray(value)) {
      return formatTXXX(
        value.filter((item) => item?.description && item.description !== "")
      );
    }
    if (typeof value === "object" && value) {
      return Object.entries(value)
        .filter(([k, v]) => k && v != null && String(v) !== "undefined")
        .map(([k, v]) => {
          const str = String(v);
          return {
            description: k,
            value: str.length > 100 ? str.substring(0, 100) + "..." : str,
          };
        });
    }
    return formatValue(value);
  };

  const formatted: any = {};
  for (const [key, value] of Object.entries(tags)) {
    if (key === "comment") {
      formatted[key] =
        typeof value === "string"
          ? tryParseJSON(value) ??
            (value.length > 200 ? value.substring(0, 200) + "..." : value)
          : typeof value === "object" && value
          ? value
          : formatValue(value);
    } else if (key === "userDefinedText") {
      formatted[key] = formatUserDefinedText(value);
    } else if (key === "raw") {
      formatted[key] = {};
      const rawObj = value as Record<string, any>;
      for (const [rawKey, rawValue] of Object.entries(rawObj)) {
        if (rawKey === "TXXX" && Array.isArray(rawValue)) {
          formatted[key][rawKey] = formatTXXX(rawValue);
        } else if (rawKey === "APIC") {
          if (typeof rawValue === "string") {
            const parsed = tryParseJSON(rawValue);
            formatted[key][rawKey] = parsed
              ? {
                  ...parsed,
                  imageBuffer: formatImageBuffer(parsed.imageBuffer),
                }
              : rawValue.length > 200
              ? rawValue.substring(0, 200) + "..."
              : rawValue;
          } else if (typeof rawValue === "object" && rawValue) {
            const apicObj = rawValue as any;
            formatted[key][rawKey] = apicObj.imageBuffer
              ? {
                  ...apicObj,
                  imageBuffer: formatImageBuffer(apicObj.imageBuffer),
                }
              : rawValue;
          } else {
            formatted[key][rawKey] = rawValue;
          }
        } else if (rawKey === "COMM") {
          formatted[key][rawKey] =
            typeof rawValue === "string"
              ? tryParseJSON(rawValue) ??
                (rawValue.length > 200
                  ? rawValue.substring(0, 200) + "..."
                  : rawValue)
              : rawValue;
        } else {
          formatted[key][rawKey] = formatValue(rawValue);
        }
      }
    } else if (key === "image" && typeof value === "object" && value) {
      const imgObj = value as any;
      formatted[key] = {
        ...imgObj,
        imageBuffer: imgObj.imageBuffer
          ? `<Buffer ${imgObj.imageBuffer.length} bytes>`
          : undefined,
      };
    } else {
      formatted[key] = formatValue(value);
    }
  }
  return formatted;
}
