import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  AnalysisResult,
  Stems,
  DrumsStem,
  BassStem,
  VocalsStem,
  OtherStem,
  StemAttribute,
} from "./models/types.js";
import { createTXXXFields } from "./id3MetadataHelpers.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeStemAttribute<T extends string>(
  value: T,
  confidence: number
): StemAttribute<T> {
  return { value, confidence };
}

function makeValidStems(): Stems {
  return {
    drums: {
      summary: "Punchy kick with tight snare and crisp hi-hats driving the groove.",
      movement: makeStemAttribute("Stomping", 0.92),
      dynamics: makeStemAttribute("Punchy", 0.85),
      transientProfile: makeStemAttribute("Punchy", 0.88),
      functionalRole: makeStemAttribute("Foundation", 0.95),
    },
    bass: {
      summary: "Deep sub bass with strong sidechain pumping against the kick.",
      weight: makeStemAttribute("Massive", 0.9),
      movement: makeStemAttribute("Driving", 0.87),
      sidechainFeel: makeStemAttribute("Pumping", 0.93),
    },
    vocals: {
      summary: "Processed vocal chops used as rhythmic texture in the background.",
      performanceStyle: makeStemAttribute("Monotone", 0.72),
      spatialDepth: makeStemAttribute("Ambient", 0.8),
      presenceLevel: makeStemAttribute("Background", 0.91),
    },
    other: {
      summary: "Lush synth pads with wide stereo field dominating the high-mid range.",
      aestheticWeight: makeStemAttribute("Dense", 0.78),
      articulation: makeStemAttribute("Sustained", 0.94),
      spectralEmphasis: makeStemAttribute("Forward", 0.76),
    },
  };
}

function makeMinimalAnalysis(stems?: Stems): AnalysisResult {
  return {
    schemaVersion: 17,
    descriptiveTitle: "Test Track",
    descriptiveTags: [],
    summary: "Test summary",
    genres: {
      summary: "Techno",
      primary: ["Techno"],
      secondary: [],
      influences: [],
    },
    moodsAndFeelings: {
      summary: "High energy",
      moods: [],
      valence: "Positive",
      vibes: [],
      emotions: [],
      energy: "High",
      energyScore: 0.85,
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
      summary: "Fully electronic",
      instrumentationType: "Fully Electronic",
      leadInstruments: [],
      detectedInstruments: [],
    },
    vocals: {
      summary: "Instrumental",
      vocalPresence: "Instrumental",
      vocalTypes: [],
      lyricalLanguages: [],
      lyricalThemes: [],
      explicitContent: false,
      sampleSources: [],
    },
    mixing: {
      bpm: 130,
      musicalKey: "9B",
      musicalMode: "Minor",
      timeSignature: "4/4",
      mixabilityScore: 0.9,
      commercialAppealScore: 0.6,
      suitableOccasions: [],
      suitableMixRoles: [],
      introMixingNotes: "",
      outroMixingNotes: "",
      suggestedCuePoints: [],
      songStructureSegments: [],
    },
    // stems may be absent at runtime when reading V16 analysis files from disk
    stems: stems as unknown as Stems,
  };
}

// ─── Schema version ──────────────────────────────────────────────────────────

describe("Schema V17", () => {
  it("should have schemaVersion 17 in V17 analysis", () => {
    const analysis = makeMinimalAnalysis(makeValidStems());
    expect(analysis.schemaVersion).toBe(17);
  });

  it("should accept V16 analysis without stems (backward compatibility)", () => {
    const analysis = makeMinimalAnalysis(); // stems is undefined
    expect(analysis.stems).toBeUndefined();
    expect(analysis.schemaVersion).toBe(17);
  });
});

// ─── Stems structure ─────────────────────────────────────────────────────────

describe("Stems schema structure", () => {
  it("should have all four stems", () => {
    const stems = makeValidStems();
    expect(stems.drums).toBeDefined();
    expect(stems.bass).toBeDefined();
    expect(stems.vocals).toBeDefined();
    expect(stems.other).toBeDefined();
  });

  describe("drums stem", () => {
    let drums: DrumsStem;

    beforeEach(() => {
      drums = makeValidStems().drums;
    });

    it("should have all required fields", () => {
      expect(drums.summary).toBeDefined();
      expect(drums.movement).toBeDefined();
      expect(drums.dynamics).toBeDefined();
      expect(drums.transientProfile).toBeDefined();
      expect(drums.functionalRole).toBeDefined();
    });

    it("should have valid movement enum values", () => {
      const validValues = [
        "Straight", "Stomping", "Shuffling", "Bouncy",
        "Rolling", "Broken", "Flowing", "Static",
      ];
      expect(validValues).toContain(drums.movement.value);
    });

    it("should have valid dynamics enum values", () => {
      const validValues = ["Compressed", "Punchy", "Natural", "Thin"];
      expect(validValues).toContain(drums.dynamics.value);
    });

    it("should have valid transientProfile enum values", () => {
      const validValues = ["Rounded", "Punchy", "Clicky", "Harsh"];
      expect(validValues).toContain(drums.transientProfile.value);
    });

    it("should have valid functionalRole enum values", () => {
      const validValues = ["Foundation", "Tool", "Breakbeat", "Accent"];
      expect(validValues).toContain(drums.functionalRole.value);
    });

    it("should have summary within 200 chars", () => {
      expect(drums.summary.length).toBeLessThanOrEqual(200);
    });
  });

  describe("bass stem", () => {
    let bass: BassStem;

    beforeEach(() => {
      bass = makeValidStems().bass;
    });

    it("should have all required fields", () => {
      expect(bass.summary).toBeDefined();
      expect(bass.weight).toBeDefined();
      expect(bass.movement).toBeDefined();
      expect(bass.sidechainFeel).toBeDefined();
    });

    it("should have valid weight enum values", () => {
      const validValues = ["Sub", "Massive", "Growl", "Plucky"];
      expect(validValues).toContain(bass.weight.value);
    });

    it("should have valid movement enum values", () => {
      const validValues = [
        "Driving", "Rolling", "Pulsating", "Walking", "Syncopated", "Drone",
      ];
      expect(validValues).toContain(bass.movement.value);
    });

    it("should have valid sidechainFeel enum values", () => {
      const validValues = ["None", "Subtle", "Pumping", "Extreme"];
      expect(validValues).toContain(bass.sidechainFeel.value);
    });

    it("should have summary within 200 chars", () => {
      expect(bass.summary.length).toBeLessThanOrEqual(200);
    });
  });

  describe("vocals stem", () => {
    let vocals: VocalsStem;

    beforeEach(() => {
      vocals = makeValidStems().vocals;
    });

    it("should have all required fields", () => {
      expect(vocals.summary).toBeDefined();
      expect(vocals.performanceStyle).toBeDefined();
      expect(vocals.spatialDepth).toBeDefined();
      expect(vocals.presenceLevel).toBeDefined();
    });

    it("should have valid performanceStyle enum values", () => {
      const validValues = [
        "Monotone", "Expressive", "Aggressive", "Breathy", "Whispered", "Spoken",
      ];
      expect(validValues).toContain(vocals.performanceStyle.value);
    });

    it("should have valid spatialDepth enum values", () => {
      const validValues = ["Close", "Ambient", "Wide", "Dry"];
      expect(validValues).toContain(vocals.spatialDepth.value);
    });

    it("should have valid presenceLevel enum values", () => {
      const validValues = ["Background", "Supporting", "Co-Lead", "Lead"];
      expect(validValues).toContain(vocals.presenceLevel.value);
    });

    it("should have summary within 200 chars", () => {
      expect(vocals.summary.length).toBeLessThanOrEqual(200);
    });
  });

  describe("other stem", () => {
    let other: OtherStem;

    beforeEach(() => {
      other = makeValidStems().other;
    });

    it("should have all required fields", () => {
      expect(other.summary).toBeDefined();
      expect(other.aestheticWeight).toBeDefined();
      expect(other.articulation).toBeDefined();
      expect(other.spectralEmphasis).toBeDefined();
    });

    it("should have valid aestheticWeight enum values", () => {
      const validValues = ["Airy", "Neutral", "Dense", "Massive"];
      expect(validValues).toContain(other.aestheticWeight.value);
    });

    it("should have valid articulation enum values", () => {
      const validValues = ["Sustained", "Percussive", "Evolving", "Stabs", "Glitchy"];
      expect(validValues).toContain(other.articulation.value);
    });

    it("should have valid spectralEmphasis enum values", () => {
      const validValues = ["Warm", "Forward", "Shimmer", "Lo-Fi"];
      expect(validValues).toContain(other.spectralEmphasis.value);
    });

    it("should have summary within 200 chars", () => {
      expect(other.summary.length).toBeLessThanOrEqual(200);
    });
  });
});

// ─── Confidence scoring ──────────────────────────────────────────────────────

describe("Confidence scoring", () => {
  it("should accept confidence values between 0.0 and 1.0", () => {
    const attr = makeStemAttribute("Stomping", 0.92);
    expect(attr.confidence).toBeGreaterThanOrEqual(0.0);
    expect(attr.confidence).toBeLessThanOrEqual(1.0);
  });

  it("should accept confidence at boundary values (0.0 and 1.0)", () => {
    const low = makeStemAttribute("Static", 0.0);
    const high = makeStemAttribute("Bouncy", 1.0);
    expect(low.confidence).toBe(0.0);
    expect(high.confidence).toBe(1.0);
  });

  it("all stem attributes in valid stems should have confidence in range", () => {
    const stems = makeValidStems();
    const allAttributes = [
      stems.drums.movement,
      stems.drums.dynamics,
      stems.drums.transientProfile,
      stems.drums.functionalRole,
      stems.bass.weight,
      stems.bass.movement,
      stems.bass.sidechainFeel,
      stems.vocals.performanceStyle,
      stems.vocals.spatialDepth,
      stems.vocals.presenceLevel,
      stems.other.aestheticWeight,
      stems.other.articulation,
      stems.other.spectralEmphasis,
    ];

    for (const attr of allAttributes) {
      expect(attr.confidence).toBeGreaterThanOrEqual(0.0);
      expect(attr.confidence).toBeLessThanOrEqual(1.0);
    }
  });
});

// ─── TXXX field generation ───────────────────────────────────────────────────

describe("createTXXXFields with stems (V17)", () => {
  it("should include all four stem summaries as TXXX fields", () => {
    const analysis = makeMinimalAnalysis(makeValidStems());
    const txxx = createTXXXFields(analysis);

    const fieldDescriptions = txxx.map((f) => f.description);
    expect(fieldDescriptions).toContain("Stems: Drums");
    expect(fieldDescriptions).toContain("Stems: Bass");
    expect(fieldDescriptions).toContain("Stems: Vocals");
    expect(fieldDescriptions).toContain("Stems: Other");
  });

  it("should set correct TXXX values for stem summaries", () => {
    const stems = makeValidStems();
    const analysis = makeMinimalAnalysis(stems);
    const txxx = createTXXXFields(analysis);

    const find = (desc: string) => txxx.find((f) => f.description === desc)?.value;
    expect(find("Stems: Drums")).toBe(stems.drums.summary);
    expect(find("Stems: Bass")).toBe(stems.bass.summary);
    expect(find("Stems: Vocals")).toBe(stems.vocals.summary);
    expect(find("Stems: Other")).toBe(stems.other.summary);
  });

  it("should not include stem TXXX fields when stems is undefined (V16 backward compat)", () => {
    const analysis = makeMinimalAnalysis(); // no stems
    const txxx = createTXXXFields(analysis);

    const fieldDescriptions = txxx.map((f) => f.description);
    expect(fieldDescriptions).not.toContain("Stems: Drums");
    expect(fieldDescriptions).not.toContain("Stems: Bass");
    expect(fieldDescriptions).not.toContain("Stems: Vocals");
    expect(fieldDescriptions).not.toContain("Stems: Other");
  });

  it("should still include schema version in TXXX fields", () => {
    const analysis = makeMinimalAnalysis(makeValidStems());
    const txxx = createTXXXFields(analysis);

    const schemaField = txxx.find((f) => f.description === "Schema Version");
    expect(schemaField?.value).toBe("17");
  });
});
