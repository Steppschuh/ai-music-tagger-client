import { describe, it, expect } from "@jest/globals";
import {
  mergeMetadata,
  MergeStrategy,
  transformAnalysisToMetadata,
} from "./id3MetadataHelpers.js";
import { AnalysisResult } from "./models/types.js";

describe("mergeMetadata", () => {
  describe('"keep-existing" strategy (default)', () => {
    it("should preserve existing non-empty string values", () => {
      const existing = { genre: "Rock", bpm: "120", key: "C" };
      const newMetadata = { genre: "Pop", bpm: "140", key: "G" };
      const result = mergeMetadata(existing, newMetadata, "keep-existing");

      expect(result.genre).toBe("Rock");
      expect(result.bpm).toBe("120");
      expect(result.key).toBe("C");
    });

    it("should preserve existing non-empty string values for mood", () => {
      const existing = { genre: "Rock", mood: "Energetic" };
      const newMetadata = { genre: "Pop", mood: "Calm" };
      const result = mergeMetadata(existing, newMetadata, "keep-existing");

      expect(result.genre).toBe("Rock");
      expect(result.mood).toBe("Energetic");
    });

    it("should overwrite empty fields with new values", () => {
      const existing = { genre: "", bpm: undefined, key: null };
      const newMetadata = { genre: "Pop", bpm: "140", key: "G" };
      const result = mergeMetadata(existing, newMetadata, "keep-existing");

      expect(result.genre).toBe("Pop");
      expect(result.bpm).toBe("140");
      expect(result.key).toBe("G");
    });

    it("should handle TXXX array merging - keep existing non-empty, update empty", () => {
      const existing = {
        userDefinedText: [
          { description: "Energy", value: "High" },
          { description: "Tags", value: "" },
        ],
      };
      const newMetadata = {
        userDefinedText: [
          { description: "Energy", value: "Low" },
          { description: "Tags", value: "electronic, dance" },
          { description: "NewField", value: "NewValue" },
        ],
      };
      const result = mergeMetadata(existing, newMetadata, "keep-existing");

      expect(result.userDefinedText).toHaveLength(3);
      expect(
        result.userDefinedText.find(
          (item: any) => item.description === "Energy"
        )?.value
      ).toBe("High"); // Kept existing
      expect(
        result.userDefinedText.find((item: any) => item.description === "Tags")
          ?.value
      ).toBe("electronic, dance"); // Updated empty
      expect(
        result.userDefinedText.find(
          (item: any) => item.description === "NewField"
        )?.value
      ).toBe("NewValue"); // Added new
    });

    it("should always update encoder fields", () => {
      const existing = { encodedBy: "Old Tool", encoder: "Old Encoder" };
      const newMetadata = {
        encodedBy: "AI Music Tagger",
        encoder: "AI Music Tagger",
      };
      const result = mergeMetadata(existing, newMetadata, "keep-existing");

      expect(result.encodedBy).toBe("AI Music Tagger");
      expect(result.encoder).toBe("AI Music Tagger");
    });

    it("should default to keep-existing when strategy not specified", () => {
      const existing = { genre: "Rock" };
      const newMetadata = { genre: "Pop" };
      const result = mergeMetadata(existing, newMetadata);

      expect(result.genre).toBe("Rock");
    });
  });

  describe('"overwrite" strategy', () => {
    it("should replace all existing string values with new values", () => {
      const existing = { genre: "Rock", bpm: "120", key: "C" };
      const newMetadata = { genre: "Pop", bpm: "140", key: "G" };
      const result = mergeMetadata(existing, newMetadata, "overwrite");

      expect(result.genre).toBe("Pop");
      expect(result.bpm).toBe("140");
      expect(result.key).toBe("G");
    });

    it("should completely replace string fields (not merge)", () => {
      const existing = { genre: "Rock", mood: "Energetic" };
      const newMetadata = { genre: "Pop", mood: "Calm" };
      const result = mergeMetadata(existing, newMetadata, "overwrite");

      expect(result.genre).toBe("Pop");
      expect(result.mood).toBe("Calm");
    });

    it("should overwrite TXXX entries on conflict but keep existing items not in new array", () => {
      const existing = {
        userDefinedText: [
          { description: "Energy", value: "High" },
          { description: "Tags", value: "rock, metal" },
        ],
      };
      const newMetadata = {
        userDefinedText: [
          { description: "Energy", value: "Low" },
          { description: "NewField", value: "NewValue" },
        ],
      };
      const result = mergeMetadata(existing, newMetadata, "overwrite");

      expect(result.userDefinedText).toHaveLength(3);
      expect(
        result.userDefinedText.find(
          (item: any) => item.description === "Energy"
        )?.value
      ).toBe("Low"); // Overwritten (conflict)
      expect(
        result.userDefinedText.find(
          (item: any) => item.description === "NewField"
        )?.value
      ).toBe("NewValue"); // Added (new)
      expect(
        result.userDefinedText.find((item: any) => item.description === "Tags")
          ?.value
      ).toBe("rock, metal"); // Kept (exists in existing but not in new)
    });

    it("should update encoder fields", () => {
      const existing = { encodedBy: "Old Tool", encoder: "Old Encoder" };
      const newMetadata = {
        encodedBy: "AI Music Tagger",
        encoder: "AI Music Tagger",
      };
      const result = mergeMetadata(existing, newMetadata, "overwrite");

      expect(result.encodedBy).toBe("AI Music Tagger");
      expect(result.encoder).toBe("AI Music Tagger");
    });

    it("should replace date fields", () => {
      const existing = { date: "2023-01-01", encodingTime: "2023-01-01" };
      const newMetadata = { date: "2024-01-01", encodingTime: "2024-01-01" };
      const result = mergeMetadata(existing, newMetadata, "overwrite");

      expect(result.date).toBe("2024-01-01");
      expect(result.encodingTime).toBe("2024-01-01");
    });
  });

  describe('"combine" strategy', () => {
    it("should keep existing single string fields (genre, mood, language, contentGroup)", () => {
      const existing = { genre: "Rock", mood: "Energetic", language: "eng", contentGroup: "Opening" };
      const newMetadata = { genre: "Pop", mood: "Calm", language: "fra", contentGroup: "Closing" };
      const result = mergeMetadata(existing, newMetadata, "combine");

      // All single string fields should keep existing values
      expect(result.genre).toBe("Rock");
      expect(result.mood).toBe("Energetic");
      expect(result.language).toBe("eng");
      expect(result.contentGroup).toBe("Opening");
    });

    it("should extend TXXX entries with same description when values are CSV/array", () => {
      const existing = {
        userDefinedText: [
          { description: "Tags", value: "rock, metal" },
          { description: "Mix Roles", value: "opener, main" },
        ],
      };
      const newMetadata = {
        userDefinedText: [
          { description: "Tags", value: "electronic, dance" },
          { description: "Mix Roles", value: "closer" },
        ],
      };
      const result = mergeMetadata(existing, newMetadata, "combine");

      const tagsItem = result.userDefinedText.find(
        (item: any) => item.description === "Tags"
      );
      expect(tagsItem?.value).toContain("rock");
      expect(tagsItem?.value).toContain("metal");
      expect(tagsItem?.value).toContain("electronic");
      expect(tagsItem?.value).toContain("dance");

      const mixRolesItem = result.userDefinedText.find(
        (item: any) => item.description === "Mix Roles"
      );
      expect(mixRolesItem?.value).toContain("opener");
      expect(mixRolesItem?.value).toContain("main");
      expect(mixRolesItem?.value).toContain("closer");
    });

    it("should keep existing TXXX entry when same description has single string value", () => {
      const existing = {
        userDefinedText: [{ description: "Energy", value: "High" }],
      };
      const newMetadata = {
        userDefinedText: [{ description: "Energy", value: "Low" }],
      };
      const result = mergeMetadata(existing, newMetadata, "combine");

      expect(
        result.userDefinedText.find(
          (item: any) => item.description === "Energy"
        )?.value
      ).toBe("High"); // Kept existing
    });

    it("should keep both TXXX entries with different descriptions", () => {
      const existing = {
        userDefinedText: [{ description: "Energy", value: "High" }],
      };
      const newMetadata = {
        userDefinedText: [{ description: "Danceability", value: "Medium" }],
      };
      const result = mergeMetadata(existing, newMetadata, "combine");

      expect(result.userDefinedText).toHaveLength(2);
      expect(
        result.userDefinedText.find(
          (item: any) => item.description === "Energy"
        )?.value
      ).toBe("High");
      expect(
        result.userDefinedText.find(
          (item: any) => item.description === "Danceability"
        )?.value
      ).toBe("Medium");
    });

    it("should keep existing single string fields (bpm, key, subtitle, remixArtist, comment)", () => {
      const existing = {
        bpm: "120",
        key: "C",
        subtitle: "Original Mix",
        remixArtist: "DJ A",
        comment: { language: "eng", text: "Original comment" },
      };
      const newMetadata = {
        bpm: "140",
        key: "G",
        subtitle: "Remix",
        remixArtist: "DJ B",
        comment: { language: "eng", text: "New comment" },
      };
      const result = mergeMetadata(existing, newMetadata, "combine");

      expect(result.bpm).toBe("120");
      expect(result.key).toBe("C");
      expect(result.subtitle).toBe("Original Mix");
      expect(result.remixArtist).toBe("DJ A");
      expect(result.comment.text).toBe("Original comment");
    });

    it("should always update encoder fields", () => {
      const existing = { encodedBy: "Old Tool", encoder: "Old Encoder" };
      const newMetadata = {
        encodedBy: "AI Music Tagger",
        encoder: "AI Music Tagger",
      };
      const result = mergeMetadata(existing, newMetadata, "combine");

      expect(result.encodedBy).toBe("AI Music Tagger");
      expect(result.encoder).toBe("AI Music Tagger");
    });

    it("should keep existing date fields", () => {
      const existing = { date: "2023-01-01", encodingTime: "2023-01-01" };
      const newMetadata = { date: "2024-01-01", encodingTime: "2024-01-01" };
      const result = mergeMetadata(existing, newMetadata, "combine");

      expect(result.date).toBe("2023-01-01");
      expect(result.encodingTime).toBe("2023-01-01");
    });

    it("should set date fields if existing is empty", () => {
      const existing = {};
      const newMetadata = { date: "2024-01-01", encodingTime: "2024-01-01" };
      const result = mergeMetadata(existing, newMetadata, "combine");

      expect(result.date).toBe("2024-01-01");
      expect(result.encodingTime).toBe("2024-01-01");
    });

    it("should handle mixed single value scenarios", () => {
      const existing = {
        genre: "Rock",
        mood: "Energetic",
        language: "eng",
        contentGroup: "Opening",
        bpm: "120",
        userDefinedText: [
          { description: "Tags", value: "rock, metal" },
          { description: "Energy", value: "High" },
        ],
      };
      const newMetadata = {
        genre: "Pop",
        mood: "Calm",
        language: "fra",
        contentGroup: "Closing",
        bpm: "140",
        userDefinedText: [
          { description: "Tags", value: "dance" },
          { description: "Energy", value: "Low" },
          { description: "NewField", value: "NewValue" },
        ],
      };
      const result = mergeMetadata(existing, newMetadata, "combine");

      // All single string fields should keep existing
      expect(result.genre).toBe("Rock");
      expect(result.mood).toBe("Energetic");
      expect(result.language).toBe("eng");
      expect(result.contentGroup).toBe("Opening");
      // Single value kept existing
      expect(result.bpm).toBe("120");
      // CSV extended
      const tagsItem = result.userDefinedText.find(
        (item: any) => item.description === "Tags"
      );
      expect(tagsItem?.value).toContain("rock");
      expect(tagsItem?.value).toContain("metal");
      expect(tagsItem?.value).toContain("dance");
      // Single string kept existing
      expect(
        result.userDefinedText.find(
          (item: any) => item.description === "Energy"
        )?.value
      ).toBe("High");
      // New field added
      expect(
        result.userDefinedText.find(
          (item: any) => item.description === "NewField"
        )?.value
      ).toBe("NewValue");
    });
  });

  describe("genre 'Music' placeholder handling", () => {
    it('should treat "Music" as empty in "keep-existing" strategy', () => {
      const existing = { genre: "Music" };
      const newMetadata = { genre: "Techno" };
      const result = mergeMetadata(existing, newMetadata, "keep-existing");

      expect(result.genre).toBe("Techno");
    });

    it('should treat "Music" array as empty in "keep-existing" strategy', () => {
      const existing = { genre: ["Music"] };
      const newMetadata = { genre: "Techno" };
      const result = mergeMetadata(existing, newMetadata, "keep-existing");

      expect(result.genre).toBe("Techno");
    });

    it('should treat "Music" as empty in "overwrite" strategy', () => {
      const existing = { genre: "Music" };
      const newMetadata = { genre: "Techno" };
      const result = mergeMetadata(existing, newMetadata, "overwrite");

      expect(result.genre).toBe("Techno");
    });

    it('should treat "Music" array as empty in "combine" strategy', () => {
      const existing = { genre: ["Music"] };
      const newMetadata = { genre: "Techno" };
      const result = mergeMetadata(existing, newMetadata, "combine");

      expect(result.genre).toBe("Techno");
    });

    it('should keep existing genre when not "Music" in "combine" strategy', () => {
      const existing = { genre: "Rock" };
      const newMetadata = { genre: "Techno" };
      const result = mergeMetadata(existing, newMetadata, "combine");

      // Should keep existing since it's not "Music"
      expect(result.genre).toBe("Rock");
    });

    it('should handle case-insensitive "Music" matching', () => {
      const existing = { genre: "MUSIC" };
      const newMetadata = { genre: "Techno" };
      const result = mergeMetadata(existing, newMetadata, "keep-existing");

      expect(result.genre).toBe("Techno");
    });

    it('should handle "Music" with whitespace', () => {
      const existing = { genre: "  Music  " };
      const newMetadata = { genre: "Techno" };
      const result = mergeMetadata(existing, newMetadata, "keep-existing");

      expect(result.genre).toBe("Techno");
    });
  });

  describe("edge cases", () => {
    it("should handle empty existing metadata", () => {
      const existing = {};
      const newMetadata = { genre: "Pop", bpm: "140" };
      const result = mergeMetadata(existing, newMetadata, "keep-existing");

      expect(result.genre).toBe("Pop");
      expect(result.bpm).toBe("140");
    });

    it("should handle empty new metadata", () => {
      const existing = { genre: "Rock", bpm: "120" };
      const newMetadata = {};
      const result = mergeMetadata(existing, newMetadata, "keep-existing");

      expect(result.genre).toBe("Rock");
      expect(result.bpm).toBe("120");
    });

    it("should handle null/undefined values", () => {
      const existing = { genre: null, bpm: undefined };
      const newMetadata = { genre: "Pop", bpm: "140" };
      const result = mergeMetadata(existing, newMetadata, "keep-existing");

      expect(result.genre).toBe("Pop");
      expect(result.bpm).toBe("140");
    });

    it("should handle empty arrays", () => {
      const existing = { genre: "" };
      const newMetadata = { genre: "Pop" };
      const result = mergeMetadata(existing, newMetadata, "keep-existing");

      expect(result.genre).toBe("Pop");
    });

    it("should handle empty TXXX arrays", () => {
      const existing = { userDefinedText: [] };
      const newMetadata = {
        userDefinedText: [{ description: "Tags", value: "rock" }],
      };
      const result = mergeMetadata(existing, newMetadata, "keep-existing");

      expect(result.userDefinedText).toHaveLength(1);
      expect(
        result.userDefinedText.find((item: any) => item.description === "Tags")
          ?.value
      ).toBe("rock");
    });
  });
});

describe("transformAnalysisToMetadata", () => {
  it("should use first primary genre as single string value", () => {
    const analysis: AnalysisResult = {
      schemaVersion: 15,
      descriptiveTitle: "Test Song",
      descriptiveTags: [],
      summary: "Test summary",
      genres: {
        primary: ["Techno"],
        secondary: ["Psy Tech", "Minimal"],
        influences: [],
      },
      moodsAndFeelings: {
        moods: [],
        valence: "Positive",
        vibes: [],
        emotions: [],
        energy: "High",
        energyScore: 0.8,
        danceability: "Highly Danceable",
        danceabilityScore: 0.9,
      },
      compositionAndProduction: {
        rhythmicComplexityLevel: "Medium",
        rhythmicFeel: "Straight",
        melodicComplexityLevel: "Simple",
        harmonicSystem: "Diatonic",
        harmonicComplexityLevel: "Simple",
        productionStyle: "Hi-fi",
        timbreDescriptors: [],
        sonicTexture: [],
      },
      instrumentation: {
        instrumentationType: "Fully Electronic",
        leadInstruments: [],
        detectedInstruments: [],
      },
      vocals: {
        vocalPresence: "Instrumental",
        vocalTypes: [],
        lyricalLanguages: [],
        lyricalThemes: [],
        explicitContent: false,
        sampleSources: [],
      },
      mixing: {
        bpm: 128,
        musicalKey: "9B",
        musicalMode: "Major",
        timeSignature: "4/4",
        mixabilityScore: 0.8,
        commercialAppealScore: 0.7,
        suitableOccasions: [],
        suitableMixRoles: [],
        introMixingNotes: "",
        outroMixingNotes: "",
        suggestedCuePoints: [],
        songStructureSegments: [],
      },
    };

    const result = transformAnalysisToMetadata(analysis);

    // Should use first primary genre as single string (not array)
    expect(result.genre).toBe("Techno");
    // Secondary genres should be in TXXX field
    const secondaryGenresField = result.userDefinedText?.find(
      (item: any) => item.description === "Secondary Genres"
    );
    expect(secondaryGenresField?.value).toBe("Psy Tech, Minimal");
  });

  it("should use first primary genre when multiple primary genres exist", () => {
    const analysis: AnalysisResult = {
      schemaVersion: 15,
      descriptiveTitle: "Test Song",
      descriptiveTags: [],
      summary: "Test summary",
      genres: {
        primary: ["House", "Deep House"],
        secondary: [],
        influences: [],
      },
      moodsAndFeelings: {
        moods: [],
        valence: "Positive",
        vibes: [],
        emotions: [],
        energy: "High",
        energyScore: 0.8,
        danceability: "Highly Danceable",
        danceabilityScore: 0.9,
      },
      compositionAndProduction: {
        rhythmicComplexityLevel: "Medium",
        rhythmicFeel: "Straight",
        melodicComplexityLevel: "Simple",
        harmonicSystem: "Diatonic",
        harmonicComplexityLevel: "Simple",
        productionStyle: "Hi-fi",
        timbreDescriptors: [],
        sonicTexture: [],
      },
      instrumentation: {
        instrumentationType: "Fully Electronic",
        leadInstruments: [],
        detectedInstruments: [],
      },
      vocals: {
        vocalPresence: "Instrumental",
        vocalTypes: [],
        lyricalLanguages: [],
        lyricalThemes: [],
        explicitContent: false,
        sampleSources: [],
      },
      mixing: {
        bpm: 128,
        musicalKey: "9B",
        musicalMode: "Major",
        timeSignature: "4/4",
        mixabilityScore: 0.8,
        commercialAppealScore: 0.7,
        suitableOccasions: [],
        suitableMixRoles: [],
        introMixingNotes: "",
        outroMixingNotes: "",
        suggestedCuePoints: [],
        songStructureSegments: [],
      },
    };

    const result = transformAnalysisToMetadata(analysis);

    // Should use first primary genre only (single string)
    expect(result.genre).toBe("House");
  });

  it("should not set genre when only secondary genres exist", () => {
    const analysis: AnalysisResult = {
      schemaVersion: 15,
      descriptiveTitle: "Test Song",
      descriptiveTags: [],
      summary: "Test summary",
      genres: {
        primary: [],
        secondary: ["Ambient", "Chillout"],
        influences: [],
      },
      moodsAndFeelings: {
        moods: [],
        valence: "Positive",
        vibes: [],
        emotions: [],
        energy: "High",
        energyScore: 0.8,
        danceability: "Highly Danceable",
        danceabilityScore: 0.9,
      },
      compositionAndProduction: {
        rhythmicComplexityLevel: "Medium",
        rhythmicFeel: "Straight",
        melodicComplexityLevel: "Simple",
        harmonicSystem: "Diatonic",
        harmonicComplexityLevel: "Simple",
        productionStyle: "Hi-fi",
        timbreDescriptors: [],
        sonicTexture: [],
      },
      instrumentation: {
        instrumentationType: "Fully Electronic",
        leadInstruments: [],
        detectedInstruments: [],
      },
      vocals: {
        vocalPresence: "Instrumental",
        vocalTypes: [],
        lyricalLanguages: [],
        lyricalThemes: [],
        explicitContent: false,
        sampleSources: [],
      },
      mixing: {
        bpm: 128,
        musicalKey: "9B",
        musicalMode: "Major",
        timeSignature: "4/4",
        mixabilityScore: 0.8,
        commercialAppealScore: 0.7,
        suitableOccasions: [],
        suitableMixRoles: [],
        introMixingNotes: "",
        outroMixingNotes: "",
        suggestedCuePoints: [],
        songStructureSegments: [],
      },
    };

    const result = transformAnalysisToMetadata(analysis);

    // Should not set genre field when no primary genres
    expect(result.genre).toBeUndefined();
    // Secondary genres should be in TXXX field
    const secondaryGenresField = result.userDefinedText?.find(
      (item: any) => item.description === "Secondary Genres"
    );
    expect(secondaryGenresField?.value).toBe("Ambient, Chillout");
  });

  it("should use first mood as single string value", () => {
    const analysis: AnalysisResult = {
      schemaVersion: 15,
      descriptiveTitle: "Test Song",
      descriptiveTags: [],
      summary: "Test summary",
      genres: {
        primary: ["Techno"],
        secondary: [],
        influences: [],
      },
      moodsAndFeelings: {
        moods: ["Energetic", "Uplifting", "Driving"],
        valence: "Positive",
        vibes: [],
        emotions: [],
        energy: "High",
        energyScore: 0.8,
        danceability: "Highly Danceable",
        danceabilityScore: 0.9,
      },
      compositionAndProduction: {
        rhythmicComplexityLevel: "Medium",
        rhythmicFeel: "Straight",
        melodicComplexityLevel: "Simple",
        harmonicSystem: "Diatonic",
        harmonicComplexityLevel: "Simple",
        productionStyle: "Hi-fi",
        timbreDescriptors: [],
        sonicTexture: [],
      },
      instrumentation: {
        instrumentationType: "Fully Electronic",
        leadInstruments: [],
        detectedInstruments: [],
      },
      vocals: {
        vocalPresence: "Instrumental",
        vocalTypes: [],
        lyricalLanguages: [],
        lyricalThemes: [],
        explicitContent: false,
        sampleSources: [],
      },
      mixing: {
        bpm: 128,
        musicalKey: "9B",
        musicalMode: "Major",
        timeSignature: "4/4",
        mixabilityScore: 0.8,
        commercialAppealScore: 0.7,
        suitableOccasions: [],
        suitableMixRoles: [],
        introMixingNotes: "",
        outroMixingNotes: "",
        suggestedCuePoints: [],
        songStructureSegments: [],
      },
    };

    const result = transformAnalysisToMetadata(analysis);

    // Should use first mood only (single string)
    expect(result.mood).toBe("Energetic");
  });

  it("should use first language as single string value", () => {
    const analysis: AnalysisResult = {
      schemaVersion: 15,
      descriptiveTitle: "Test Song",
      descriptiveTags: [],
      summary: "Test summary",
      genres: {
        primary: ["Techno"],
        secondary: [],
        influences: [],
      },
      moodsAndFeelings: {
        moods: [],
        valence: "Positive",
        vibes: [],
        emotions: [],
        energy: "High",
        energyScore: 0.8,
        danceability: "Highly Danceable",
        danceabilityScore: 0.9,
      },
      compositionAndProduction: {
        rhythmicComplexityLevel: "Medium",
        rhythmicFeel: "Straight",
        melodicComplexityLevel: "Simple",
        harmonicSystem: "Diatonic",
        harmonicComplexityLevel: "Simple",
        productionStyle: "Hi-fi",
        timbreDescriptors: [],
        sonicTexture: [],
      },
      instrumentation: {
        instrumentationType: "Fully Electronic",
        leadInstruments: [],
        detectedInstruments: [],
      },
      vocals: {
        vocalPresence: "Vocals Present",
        vocalTypes: [],
        lyricalLanguages: [
          { code: "en", name: "English", prominence: 0.8 },
          { code: "de", name: "German", prominence: 0.2 },
        ],
        lyricalThemes: [],
        explicitContent: false,
        sampleSources: [],
      },
      mixing: {
        bpm: 128,
        musicalKey: "9B",
        musicalMode: "Major",
        timeSignature: "4/4",
        mixabilityScore: 0.8,
        commercialAppealScore: 0.7,
        suitableOccasions: [],
        suitableMixRoles: [],
        introMixingNotes: "",
        outroMixingNotes: "",
        suggestedCuePoints: [],
        songStructureSegments: [],
      },
    };

    const result = transformAnalysisToMetadata(analysis);

    // Should use first language (most prominent) as single string (ISO-639-2 format)
    expect(result.language).toBe("eng");
  });

  it("should use first mix role as single string value for contentGroup", () => {
    const analysis: AnalysisResult = {
      schemaVersion: 15,
      descriptiveTitle: "Test Song",
      descriptiveTags: [],
      summary: "Test summary",
      genres: {
        primary: ["Techno"],
        secondary: [],
        influences: [],
      },
      moodsAndFeelings: {
        moods: [],
        valence: "Positive",
        vibes: [],
        emotions: [],
        energy: "High",
        energyScore: 0.8,
        danceability: "Highly Danceable",
        danceabilityScore: 0.9,
      },
      compositionAndProduction: {
        rhythmicComplexityLevel: "Medium",
        rhythmicFeel: "Straight",
        melodicComplexityLevel: "Simple",
        harmonicSystem: "Diatonic",
        harmonicComplexityLevel: "Simple",
        productionStyle: "Hi-fi",
        timbreDescriptors: [],
        sonicTexture: [],
      },
      instrumentation: {
        instrumentationType: "Fully Electronic",
        leadInstruments: [],
        detectedInstruments: [],
      },
      vocals: {
        vocalPresence: "Instrumental",
        vocalTypes: [],
        lyricalLanguages: [],
        lyricalThemes: [],
        explicitContent: false,
        sampleSources: [],
      },
      mixing: {
        bpm: 128,
        musicalKey: "9B",
        musicalMode: "Major",
        timeSignature: "4/4",
        mixabilityScore: 0.8,
        commercialAppealScore: 0.7,
        suitableOccasions: [],
        suitableMixRoles: ["Set Opener", "Energy Builder", "Peak-Time Banger"],
        introMixingNotes: "",
        outroMixingNotes: "",
        suggestedCuePoints: [],
        songStructureSegments: [],
      },
    };

    const result = transformAnalysisToMetadata(analysis);

    // Should use first mix role only (single string)
    expect(result.contentGroup).toBe("Set Opener");
  });
});
