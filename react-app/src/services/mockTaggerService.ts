import type { TagResult } from "@/types/tagger";

const GENRES = [
  { genre: "Electronic", subGenres: ["House", "Techno", "Trance", "Dubstep", "Drum & Bass", "Ambient"] },
  { genre: "Hip Hop", subGenres: ["Trap", "Boom Bap", "Lo-Fi", "Drill", "Cloud Rap"] },
  { genre: "Rock", subGenres: ["Indie Rock", "Alternative", "Post-Punk", "Shoegaze", "Grunge"] },
  { genre: "Pop", subGenres: ["Synth Pop", "Indie Pop", "Electropop", "Dream Pop", "Art Pop"] },
  { genre: "Jazz", subGenres: ["Fusion", "Smooth Jazz", "Bebop", "Nu Jazz", "Acid Jazz"] },
  { genre: "R&B", subGenres: ["Neo-Soul", "Contemporary R&B", "Alternative R&B", "Funk"] },
  { genre: "Classical", subGenres: ["Orchestral", "Chamber", "Minimalist", "Neo-Classical"] },
];

const MOODS = [
  "Energetic", "Melancholic", "Euphoric", "Dark", "Chill", "Aggressive",
  "Dreamy", "Uplifting", "Nostalgic", "Mysterious", "Playful", "Intense",
];

const KEYS = [
  "C major", "C minor", "C# major", "C# minor",
  "D major", "D minor", "Eb major", "Eb minor",
  "E major", "E minor", "F major", "F minor",
  "F# major", "F# minor", "G major", "G minor",
  "Ab major", "Ab minor", "A major", "A minor",
  "Bb major", "Bb minor", "B major", "B minor",
];

const INSIGHTS = [
  "This track has the vibe of a late-night drive through neon-lit streets 🌃",
  "Somebody was definitely in their feelings when they made this one 💫",
  "This could be the soundtrack to an epic movie montage 🎬",
  "The bass on this track could register on the Richter scale 🔊",
  "I'm picking up some serious festival headliner energy here 🎪",
  "This feels like sunrise at the afterparty ☀️",
  "The producer was cooking with this one — certified heat 🔥",
  "Getting strong coffee-shop-on-a-rainy-day vibes ☕",
  "This track has more layers than an onion — and it might make you cry too 🧅",
  "If nostalgia had a frequency, this would be it 📻",
  "The chord progression here is *chef's kiss* 👨‍🍳",
  "This one slaps harder than a screen door in a hurricane 🌀",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBpm(): number {
  return Math.floor(Math.random() * 120) + 60; // 60-180
}

function randomEnergy(): number {
  return Math.floor(Math.random() * 10) + 1; // 1-10
}

/**
 * Simulate analyzing a track. Returns after a random delay (1-3s).
 * Can be swapped for real API call or native Electron implementation.
 */
export async function analyzeTrack(
  _file: File,
  signal?: AbortSignal
): Promise<TagResult> {
  const delay = 1000 + Math.random() * 2000;

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, delay);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  // ~5% chance of simulated error
  if (Math.random() < 0.05) {
    throw new Error("Failed to decode audio stream");
  }

  const genreGroup = pick(GENRES);

  return {
    genre: genreGroup.genre,
    subGenre: pick(genreGroup.subGenres),
    mood: pick(MOODS),
    bpm: randomBpm(),
    key: pick(KEYS),
    energy: randomEnergy(),
    insight: pick(INSIGHTS),
  };
}
