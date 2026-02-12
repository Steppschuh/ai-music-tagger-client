/**
 * TypeScript types for AI Music Tagger response schema (v15)
 * These types match the JSON schema defined in backend/response.schema.json
 */

export interface AnalysisResult {
  schemaVersion: number;
  descriptiveTitle: string;
  descriptiveTags: string[];
  summary: string;
  genres: Genres;
  moodsAndFeelings: MoodsAndFeelings;
  compositionAndProduction: CompositionAndProduction;
  instrumentation: Instrumentation;
  vocals: Vocals;
  mixing: Mixing;
}

export interface Genres {
  primary: string[];
  secondary: string[];
  influences: string[];
}

export interface MoodsAndFeelings {
  moods: string[];
  // Enum in schema
  valence:
    | "Very Negative"
    | "Negative"
    | "Neutral"
    | "Positive"
    | "Very Positive";
  vibes: string[];
  emotions: string[];
  // Enum in schema
  energy: "Very Low" | "Low" | "Medium" | "High" | "Very High";
  energyScore: number;
  // Enum in schema
  danceability:
    | "Not Danceable"
    | "Slightly Danceable"
    | "Moderately Danceable"
    | "Highly Danceable"
    | "Extremely Danceable";
  danceabilityScore: number;
}

export interface CompositionAndProduction {
  // Enum in schema
  rhythmicComplexityLevel:
    | "Very Low"
    | "Low"
    | "Medium"
    | "High"
    | "Very High"
    | "Extremely Complex/Polyrhythmic"
    | "Unknown";
  // Enum in schema
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
  // Enum in schema
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
  // Enum in schema
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
  // Enum in schema
  harmonicComplexityLevel:
    | "Minimal/Drone"
    | "Simple"
    | "Moderate"
    | "Rich/Layered"
    | "Complex/Extended"
    | "Highly Dissonant/Atonal"
    | "Unknown";
  // Enum in schema
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
  // Enum in schema
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
  // Enum in schema
  prominence: "Primary" | "Secondary" | "Background" | "FX";
  // Enum in schema
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
  // Enum in schema
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
  sampleSources: string[];
}

export interface LyricalLanguage {
  code: string;
  name: string;
  prominence: number;
}

export interface Mixing {
  bpm: number;
  musicalKey: string;
  // Enum in schema
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
  mixabilityScore: number;
  commercialAppealScore: number;
  suitableOccasions: string[];
  // Enum in schema (array items)
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
}

export interface CuePoint {
  positionSeconds: number;
  positionBeats: number;
  positionBars: number;
  label: string;
}

export interface SongStructureSegment {
  name: string; // No enum in schema - accepts any string
  description: string;
  startBar: number;
  durationInBars: number;
  startSeconds: number;
  durationInSeconds: number;
  // Enum in schema
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
