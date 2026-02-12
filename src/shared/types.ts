/**
 * Shared types for AI Music Tagger - AnalysisResult schema (v15)
 * Used by both main process services and renderer
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
  rhythmicComplexityLevel: string;
  rhythmicFeel: string;
  melodicComplexityLevel: string;
  harmonicSystem: string;
  harmonicComplexityLevel: string;
  productionStyle: string;
  timbreDescriptors: string[];
  sonicTexture: string[];
}

export interface Instrumentation {
  instrumentationType: string;
  leadInstruments: string[];
  detectedInstruments: DetectedInstrument[];
}

export interface DetectedInstrument {
  name: string;
  prominence: string;
  role: string;
}

export interface Vocals {
  vocalPresence: string;
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
  musicalMode: string;
  timeSignature: string;
  mixabilityScore: number;
  commercialAppealScore: number;
  suitableOccasions: string[];
  suitableMixRoles: string[];
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
  name: string;
  description: string;
  startBar: number;
  durationInBars: number;
  startSeconds: number;
  durationInSeconds: number;
  energyDynamic: string;
}

export type MergeStrategy = "overwrite" | "keep-existing" | "combine";

export type CommentStrategy = "summary" | "hashtags" | "tags" | "tags+summary";

export interface SettingsState {
  rapidApiKey: string;
  autoSaveJson: boolean;
  tagStrategy: "keep" | "merge" | "overwrite";
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
