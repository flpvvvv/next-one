let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;

  if (!audioContext) {
    audioContext = new Ctx();
  }

  return audioContext;
}

export async function primeSound(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      // Ignore: browser policy may block without user gesture.
    }
  }
}

export async function playJackpotSting(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return;
    }
  }

  // A tiny, original "jackpot" triad-ish flourish using simple oscillators.
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
  master.connect(ctx.destination);

  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  const startOffsets = [0, 0.06, 0.12];

  for (let i = 0; i < notes.length; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(notes[i], now + startOffsets[i]);

    gain.gain.setValueAtTime(0.0001, now + startOffsets[i]);
    gain.gain.exponentialRampToValueAtTime(0.12, now + startOffsets[i] + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffsets[i] + 0.25);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now + startOffsets[i]);
    osc.stop(now + startOffsets[i] + 0.28);
  }
}

export async function playTick(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx || ctx.state === 'suspended') return; // Don't force resume for ticks, only for user actions if possible

  const now = ctx.currentTime;
  
  // Create a short, crisp tick sound (filtered noise or high-pitch blip)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // High pitch, short decay for a "plastic clicker" sound
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}
