/**
 * Shared types for AI Music Tagger - AnalysisResult schema (v20)
 * Single source of truth used by: Electron main process, renderer, and CLI.
 */

export interface AnalysisResult {
  schemaVersion: number;
  analysisMetaData: AnalysisMetaData;
  descriptiveTitle: string;
  descriptiveTags: string[];
  summary: string;
  genres: Genres;
  moodsAndFeelings: MoodsAndFeelings;
  compositionAndProduction: CompositionAndProduction;
  instrumentation: Instrumentation;
  vocals: Vocals;
  mixing: Mixing;
  /** V17: Subjective 4-stem performance analysis. */
  stems: Stems;
}

/** Analysis metadata for auditing and library management over time. */
export interface AnalysisMetaData {
  /** ISO-8601 UTC timestamp of when the analysis ran. */
  analysisTimestamp: string;
  /** Aggregate AI confidence (0.0-1.0). Below 0.5 flags the track for human review. */
  overallConfidenceScore: number;
  /** Original filename of the audio file. Injected by the backend after analysis. */
  filename?: string;
  /** SHA-256 hash for deduplication. Injected by the backend after analysis. */
  fileHash?: string;
}

export interface Genres {
  summary: string;
  primary: string[];
  secondary: string[];
  influences: string[];
}

export interface MoodsAndFeelings {
  summary: string;
  moods: string[];
  valence:
    | "Very Negative"
    | "Negative"
    | "Neutral"
    | "Positive"
    | "Very Positive";
  vibes: string[];
  emotions: string[];
  energy: "Very Low" | "Low" | "Medium" | "High" | "Very High";
  energyScore: number;
  danceability:
    | "Not Danceable"
    | "Slightly Danceable"
    | "Moderately Danceable"
    | "Highly Danceable"
    | "Extremely Danceable";
  danceabilityScore: number;
}

export interface CompositionAndProduction {
  rhythmicComplexityLevel:
    | "Very Low"
    | "Low"
    | "Medium"
    | "High"
    | "Very High"
    | "Extremely Complex/Polyrhythmic"
    | "Unknown";
  rhythmicFeel:
    | "Straight"
    | "Swung"
    | "Shuffle"
    | "Groovy/Funky"
    | "Driving/Energetic"
    | "Relaxed/Laid-back"
    | "Flowing/Smooth"
    | "Rigid/Mechanical"
    | "Pulsating/Hypnotic"
    | "Static/Minimal"
    | "Off-kilter/Syncopated"
    | "Tribal"
    | "Marching"
    | "Unknown";
  melodicComplexityLevel:
    | "Very Simple"
    | "Simple"
    | "Motivic"
    | "Moderate"
    | "Complex"
    | "Highly Intricate"
    | "Ornamented/Virtuosic"
    | "Primarily Non-Melodic"
    | "Unknown";
  harmonicSystem:
    | "Diatonic"
    | "Chromatic"
    | "Modal"
    | "Atonal"
    | "Blues-Based"
    | "Jazz-Influenced"
    | "Simple (Triads/Dyads)"
    | "Extended (7ths, 9ths+)"
    | "Quartal/Quintal"
    | "Cluster-based"
    | "Drone-based"
    | "Unknown";
  harmonicComplexityLevel:
    | "Minimal/Drone"
    | "Simple"
    | "Moderate"
    | "Rich/Layered"
    | "Complex/Extended"
    | "Highly Dissonant/Atonal"
    | "Unknown";
  productionStyle:
    | "Lo-fi"
    | "Hi-fi"
    | "Minimalist"
    | "Maximalist"
    | "Cinematic"
    | "Vintage/Retro"
    | "Modern Polished"
    | "Raw/Unfiltered"
    | "Experimental"
    | "Glitchy"
    | "Overdriven"
    | "Clean"
    | "Ambient"
    | "Wall of Sound"
    | "Unknown";
  timbreDescriptors: string[];
  sonicTexture: string[];
}

export interface Instrumentation {
  summary: string;
  instrumentationType:
    | "Fully Acoustic"
    | "Mostly Acoustic"
    | "Hybrid (Acoustic/Electronic)"
    | "Mostly Electronic"
    | "Fully Electronic"
    | "Sample-Based"
    | "Acapella"
    | "Unknown";
  leadInstruments: string[];
  detectedInstruments: DetectedInstrument[];
}

export interface DetectedInstrument {
  name: string;
  prominence: "Primary" | "Secondary" | "Background" | "FX";
  role:
    | "Melody"
    | "Harmony"
    | "Rhythm"
    | "Bass"
    | "Pad"
    | "Lead"
    | "Percussion"
    | "Atmosphere"
    | "FX"
    | "Counter-Melody";
}

export interface Vocals {
  summary: string;
  vocalPresence:
    | "Instrumental"
    | "Vocals Present"
    | "Acapella"
    | "Predominantly Instrumental with Vocal Samples/FX"
    | "Predominantly Vocal with Minimal Instrumentation";
  vocalTypes: string[];
  lyricalLanguages: LyricalLanguage[];
  lyricalThemes: string[];
  explicitContent: boolean;
  /** V20: Contains profane content beyond general explicit tagging. */
  containsProfanity: boolean;
  /** V20: Categories of profane content. Empty array when containsProfanity is false. */
  profanityTypes: ("Violence" | "Drugs" | "Swearing" | "Sexual" | "Hate Speech")[];
  sampleSources: string[];
  /** Vocal density (0.0-1.0). High values = heavy vocal presence. */
  vocalDensity: number;
}

export interface LyricalLanguage {
  code: string;
  name: string;
  prominence: number;
}

export interface Mixing {
  bpm: number;
  musicalKey: string;
  musicalMode:
    | "Major"
    | "Minor"
    | "Dorian"
    | "Phrygian"
    | "Lydian"
    | "Mixolydian"
    | "Locrian"
    | "Aeolian"
    | "Ionian"
    | "Unknown";
  timeSignature: string;
  /** V20: Track phrasing grid. */
  phrasingType:
    | "Standard 32-Beat Phrasing"
    | "Odd Phrasing"
    | "Free-Form"
    | "Unknown";
  /** V20: Tempo stability. */
  tempoType: "Quantized" | "Variable" | "BPM Transition" | "Unknown";
  mixabilityScore: number;
  commercialAppealScore: number;
  /** V19: Predicted stem separation quality (0.0-1.0). */
  stemSeparationSuitability: number;
  /** V19: True if instrumental sections can safely host a foreign acapella. */
  isAcapellaCompatible: boolean;
  /** V19: True if intro is percussion-only with no harmonic content to clash. */
  hasCleanIntro: boolean;
  /** V19: True if the track structure supports a simultaneous double-drop technique. */
  isDoubleDropFriendly: boolean;
  suitableOccasions: string[];
  suitableMixRoles: (
    | "Set Opener"
    | "Set Closer"
    | "Warm-up"
    | "Cool-down"
    | "Energy Builder"
    | "Peak-Time Banger"
    | "Transition Track"
    | "Groove Setter"
    | "Tool/FX Loop"
    | "Journey Track"
    | "Storytelling Element"
    | "Filler"
    | "Ambiance Setter"
  )[];
  introMixingNotes: string;
  outroMixingNotes: string;
  suggestedCuePoints: CuePoint[];
  songStructureSegments: SongStructureSegment[];
  /** Broad EQ characteristics for frequency-complementary track pairing. */
  frequencyProfile: FrequencyProfile;
  /** Drop intensity vs. intro (0.0-1.0). */
  dropIntensityScore: number;
  /** Expected dancefloor effect when this track is played. */
  crowdEnergyShift:
    | "Floor-filler"
    | "Breather"
    | "Room-clearer"
    | "Warm-up Friendly"
    | "Peak-Time Essential"
    | "Journey Track"
    | "Unknown";
}

export interface CuePoint {
  positionSeconds: number;
  positionBeats: number;
  positionBars: number;
  /** Cue point type for DJ software API mapping. Renamed from `type` to avoid SDK conflicts. */
  cueType: "Load" | "Mix-In" | "Mix-Out" | "Vocal-In" | "Drop" | "General";
  label: string;
}

export interface SongStructureSegment {
  name: string;
  description: string;
  startBar: number;
  durationInBars: number;
  startSeconds: number;
  durationInSeconds: number;
  energyDynamic:
    | "Building"
    | "Sustaining Low"
    | "Sustaining Medium"
    | "Sustaining High"
    | "Releasing"
    | "Peak"
    | "Dip"
    | "Static";
}

export interface FrequencyProfile {
  dominantFrequencyRange:
    | "Sub-Heavy"
    | "Bass-Forward"
    | "Mid-Forward"
    | "High-Mid Present"
    | "Treble-Bright"
    | "Piercing Highs"
    | "Balanced"
    | "Unknown";
}

/**
 * V17: Confidence-scored stem attribute.
 */
export interface StemAttribute<T extends string> {
  value: T;
  /** Confidence score for this prediction (0.0 = uncertain, 1.0 = highly confident). */
  confidence: number;
}

/** V17: Subjective performance analysis of the drums stem. */
export interface DrumsStem {
  summary: string;
  movement: StemAttribute<
    | "Straight"
    | "Stomping"
    | "Shuffling"
    | "Bouncy"
    | "Rolling"
    | "Broken"
    | "Flowing"
    | "Static"
  >;
  dynamics: StemAttribute<"Compressed" | "Punchy" | "Natural" | "Thin">;
  transientProfile: StemAttribute<"Rounded" | "Punchy" | "Clicky" | "Harsh">;
  functionalRole: StemAttribute<"Foundation" | "Tool" | "Breakbeat" | "Accent">;
}

/** V17: Subjective performance analysis of the bass stem. */
export interface BassStem {
  summary: string;
  weight: StemAttribute<"Sub" | "Massive" | "Growl" | "Plucky">;
  movement: StemAttribute<
    "Driving" | "Rolling" | "Pulsating" | "Walking" | "Syncopated" | "Drone"
  >;
  sidechainFeel: StemAttribute<"None" | "Subtle" | "Pumping" | "Extreme">;
}

/** V17: Subjective performance analysis of the vocals stem. */
export interface VocalsStem {
  summary: string;
  performanceStyle: StemAttribute<
    | "Monotone"
    | "Expressive"
    | "Aggressive"
    | "Breathy"
    | "Whispered"
    | "Spoken"
  >;
  spatialDepth: StemAttribute<"Close" | "Ambient" | "Wide" | "Dry">;
  presenceLevel: StemAttribute<"Background" | "Supporting" | "Co-Lead" | "Lead">;
}

/** V17: Subjective performance analysis of the other (melodic) stem. */
export interface OtherStem {
  summary: string;
  aestheticWeight: StemAttribute<"Airy" | "Neutral" | "Dense" | "Massive">;
  articulation: StemAttribute<
    "Sustained" | "Percussive" | "Evolving" | "Stabs" | "Glitchy"
  >;
  spectralEmphasis: StemAttribute<"Warm" | "Forward" | "Shimmer" | "Lo-Fi">;
}

/** V17: 4-stem subjective analysis model for advanced curation and visual triggers. */
export interface Stems {
  drums: DrumsStem;
  bass: BassStem;
  vocals: VocalsStem;
  other: OtherStem;
}

// ─────────────────────────────────────────────────────────────────────────────
// App-level shared types
// ─────────────────────────────────────────────────────────────────────────────

export type MergeStrategy = "overwrite" | "keep-existing" | "combine";

export type CommentStrategy = "summary" | "hashtags" | "tags" | "tags+summary";

export interface SettingsState {
  rapidApiKey: string;
  autoSaveJson: boolean;
  tagStrategy: "keep" | "merge" | "overwrite";
  commentStrategy: CommentStrategy;
  /** Dev-only: route requests to the /analyzeMock endpoint instead of the real one. Never true in production builds. */
  mockAnalysis: boolean;
}

export const AUDIO_EXTENSIONS = [
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
