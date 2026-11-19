/**
 * Web Audio API 8-bit Sound Effects & Original Chiptune BGM Sequencer.
 * Zero external audio files required; respects browser autoplay rules.
 *
 * Includes 4 original chiptune music loops (square lead + triangle bass + retro percussion):
 * - 'town'    : Cheerful sunny pastoral melody (Dawnleaf Town)
 * - 'indoors' : Cozy warm gentle home melody (Bedroom / Home 1F)
 * - 'lab'     : Curious bouncy research theme (Professor's Lab)
 * - 'battle'  : Energetic driving trainer battle theme (Rival Battle)
 */

const MUTE_STORAGE_KEY = 'monster_quest_dawn_muted_v1';
const MUSIC_STORAGE_KEY = 'monster_quest_dawn_music_v1';

// Helper: MIDI note number -> Hz frequency (0 = rest)
function midiToHz(n) {
  if (!n) return 0;
  return 440 * Math.pow(2, (n - 69) / 12);
}

// =========================================================================
// 4 ORIGINAL CHIPTUNE COMPOSITIONS (16-step / 32-step loops)
// =========================================================================
const TRACKS = {
  // Sunny pastoral C-major starter town loop (~122 BPM)
  town: {
    stepSec: 0.245,
    lead: [
      72, 76, 79, 84, 81, 79, 76, 0,
      74, 77, 81, 79, 76, 74, 72, 0,
      76, 79, 84, 86, 84, 81, 79, 76,
      74, 76, 79, 74, 72, 0, 72, 0,
    ],
    bass: [
      48, 0, 55, 0, 53, 0, 55, 0,
      50, 0, 55, 0, 48, 0, 55, 0,
      52, 0, 57, 0, 53, 0, 55, 0,
      50, 0, 55, 55, 48, 0, 55, 0,
    ],
    drums: [
      1, 0, 2, 0, 1, 0, 2, 0,
      1, 0, 2, 0, 1, 0, 2, 2,
      1, 0, 2, 0, 1, 0, 2, 0,
      1, 0, 2, 0, 1, 0, 2, 0,
    ],
    leadVol: 0.032,
    bassVol: 0.042,
  },

  // Warm cozy home theme (~104 BPM)
  indoors: {
    stepSec: 0.285,
    lead: [
      69, 72, 76, 0, 74, 72, 69, 0,
      67, 71, 74, 0, 72, 71, 69, 0,
      72, 76, 79, 0, 76, 74, 72, 0,
      74, 72, 71, 67, 69, 0, 0, 0,
    ],
    bass: [
      45, 0, 52, 0, 50, 0, 52, 0,
      43, 0, 50, 0, 48, 0, 47, 0,
      48, 0, 55, 0, 53, 0, 52, 0,
      50, 0, 47, 0, 45, 0, 52, 0,
    ],
    drums: [
      0, 0, 2, 0, 0, 0, 2, 0,
      0, 0, 2, 0, 0, 0, 2, 0,
      0, 0, 2, 0, 0, 0, 2, 0,
      0, 0, 2, 0, 0, 0, 0, 0,
    ],
    leadVol: 0.026,
    bassVol: 0.036,
  },

  // Curious upbeat Professor's Lab theme (~132 BPM)
  lab: {
    stepSec: 0.225,
    lead: [
      76, 0, 79, 76, 81, 0, 79, 0,
      74, 0, 77, 74, 79, 0, 76, 0,
      72, 76, 79, 84, 83, 79, 76, 0,
      74, 77, 81, 79, 76, 0, 0, 0,
    ],
    bass: [
      48, 55, 48, 55, 53, 57, 53, 57,
      50, 55, 50, 55, 48, 55, 52, 55,
      45, 52, 45, 52, 47, 55, 47, 55,
      50, 53, 55, 55, 48, 0, 55, 0,
    ],
    drums: [
      1, 2, 0, 2, 1, 2, 0, 2,
      1, 2, 0, 2, 1, 2, 2, 0,
      1, 2, 0, 2, 1, 2, 0, 2,
      1, 2, 1, 2, 1, 0, 2, 0,
    ],
    leadVol: 0.03,
    bassVol: 0.038,
  },

  // Energetic driving minor-key Rival Battle theme (~164 BPM)
  battle: {
    stepSec: 0.165,
    lead: [
      76, 79, 81, 0, 83, 81, 79, 76,
      74, 76, 79, 0, 76, 74, 71, 0,
      76, 79, 81, 83, 86, 83, 81, 79,
      81, 79, 76, 74, 76, 0, 83, 0,
    ],
    bass: [
      40, 40, 52, 40, 40, 40, 52, 40,
      43, 43, 55, 43, 45, 45, 57, 45,
      40, 40, 52, 40, 47, 47, 59, 47,
      45, 45, 47, 47, 40, 40, 52, 47,
    ],
    drums: [
      1, 2, 3, 2, 1, 2, 3, 2,
      1, 2, 3, 2, 1, 1, 3, 2,
      1, 2, 3, 2, 1, 2, 3, 2,
      1, 2, 3, 1, 1, 3, 3, 2,
    ],
    leadVol: 0.036,
    bassVol: 0.048,
  },

  // Upbeat adventurous Route 1 march (~144 BPM, G major)
  route1: {
    stepSec: 0.205,
    lead: [
      79, 83, 86, 0, 83, 86, 88, 0,
      86, 83, 81, 79, 81, 0, 78, 0,
      79, 83, 86, 91, 88, 86, 83, 81,
      79, 81, 83, 81, 79, 0, 0, 0,
    ],
    bass: [
      55, 0, 62, 0, 55, 0, 60, 0,
      59, 0, 57, 0, 50, 0, 57, 0,
      55, 0, 62, 0, 60, 0, 55, 0,
      57, 0, 50, 50, 55, 0, 62, 0,
    ],
    drums: [
      1, 0, 2, 2, 1, 0, 3, 0,
      1, 0, 2, 2, 1, 2, 3, 0,
      1, 0, 2, 2, 1, 0, 3, 0,
      1, 2, 3, 2, 1, 0, 2, 0,
    ],
    leadVol: 0.032,
    bassVol: 0.04,
  },

  // Bright bustling Verdant City theme (~126 BPM, F major)
  city: {
    stepSec: 0.235,
    lead: [
      77, 81, 84, 81, 86, 0, 84, 0,
      82, 81, 79, 77, 79, 81, 79, 0,
      77, 81, 84, 89, 86, 84, 82, 81,
      79, 82, 81, 79, 77, 0, 0, 0,
    ],
    bass: [
      53, 0, 60, 0, 58, 0, 60, 0,
      55, 0, 60, 0, 53, 0, 55, 0,
      53, 0, 57, 0, 58, 0, 53, 0,
      55, 0, 60, 58, 53, 0, 60, 0,
    ],
    drums: [
      1, 0, 2, 0, 1, 2, 2, 0,
      1, 0, 2, 0, 1, 0, 3, 0,
      1, 0, 2, 0, 1, 2, 2, 0,
      1, 0, 3, 2, 1, 0, 2, 0,
    ],
    leadVol: 0.03,
    bassVol: 0.04,
  },

  // Fast urgent Wild Pokémon Battle loop (~172 BPM, D minor)
  wildBattle: {
    stepSec: 0.155,
    lead: [
      74, 77, 81, 74, 82, 81, 77, 74,
      72, 76, 79, 72, 81, 79, 76, 0,
      74, 77, 81, 86, 84, 81, 79, 77,
      76, 79, 81, 79, 74, 0, 81, 0,
    ],
    bass: [
      50, 50, 57, 50, 46, 46, 53, 46,
      48, 48, 55, 48, 45, 45, 52, 45,
      50, 50, 57, 50, 46, 46, 53, 46,
      48, 48, 45, 45, 50, 50, 57, 45,
    ],
    drums: [
      1, 2, 3, 2, 1, 2, 3, 2,
      1, 2, 3, 2, 1, 2, 3, 3,
      1, 2, 3, 2, 1, 2, 3, 2,
      1, 2, 3, 1, 1, 3, 3, 2,
    ],
    leadVol: 0.035,
    bassVol: 0.045,
  },
};

class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicEnabled = true;
    try {
      this.muted = localStorage.getItem(MUTE_STORAGE_KEY) === '1';
      const mPref = localStorage.getItem(MUSIC_STORAGE_KEY);
      if (mPref !== null) this.musicEnabled = mPref === '1';
    } catch {
      this.muted = false;
      this.musicEnabled = true;
    }

    // Chiptune BGM sequencer state
    this.currentTrack = null;
    this.seqStep = 0;
    this.nextStepTime = 0;
    this.seqTimer = null;
  }

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      this.ctx = new AudioCtx();
      if (this.currentTrack) {
        this.nextStepTime = this.ctx.currentTime + 0.06;
      }
    } catch {
      this.ctx = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, this.muted ? '1' : '0');
    } catch {
      // Ignore
    }
    if (!this.muted) {
      this.unlock();
      this.blip();
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    try {
      localStorage.setItem(MUSIC_STORAGE_KEY, this.musicEnabled ? '1' : '0');
    } catch {
      // Ignore
    }
    if (this.musicEnabled && this.ctx) {
      this.nextStepTime = this.ctx.currentTime + 0.05;
    }
    return this.musicEnabled;
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  /** Switch the active chiptune music loop ('town' | 'indoors' | 'lab' | 'battle' | null). */
  playTrack(trackName) {
    if (this.currentTrack === trackName) return;
    this.currentTrack = trackName;
    this.seqStep = 0;

    if (!trackName) {
      if (this.seqTimer) {
        clearInterval(this.seqTimer);
        this.seqTimer = null;
      }
      return;
    }

    if (this.ctx) {
      this.nextStepTime = this.ctx.currentTime + 0.08;
    }
    if (!this.seqTimer) {
      this.seqTimer = setInterval(() => this._scheduleMusic(), 80);
    }
  }

  _scheduleMusic() {
    if (!this.currentTrack || this.muted || !this.musicEnabled) return;
    if (!this.ctx || this.ctx.state !== 'running') return;

    const track = TRACKS[this.currentTrack];
    if (!track) return;

    const now = this.ctx.currentTime;
    if (this.nextStepTime < now) {
      this.nextStepTime = now + 0.04;
    }

    while (this.nextStepTime < now + 0.22) {
      const idx = this.seqStep % track.lead.length;
      const t = this.nextStepTime;
      const dur = track.stepSec * 0.85;

      const leadMidi = track.lead[idx];
      if (leadMidi) {
        this._scheduleNoteAt(t, midiToHz(leadMidi), dur, 'square', track.leadVol);
      }

      const bassMidi = track.bass[idx];
      if (bassMidi) {
        this._scheduleNoteAt(t, midiToHz(bassMidi), dur * 0.92, 'triangle', track.bassVol);
      }

      const drum = track.drums[idx];
      if (drum === 1) {
        // Soft retro kick thump
        this._scheduleKickAt(t, 0.04);
      } else if (drum === 2) {
        // Light hi-hat tick
        this._scheduleHatAt(t, 0.015);
      } else if (drum === 3) {
        // Crisp battle snare
        this._scheduleHatAt(t, 0.032, 0.055);
      }

      this.nextStepTime += track.stepSec;
      this.seqStep = (this.seqStep + 1) % track.lead.length;
    }
  }

  _scheduleNoteAt(when, freq, duration, type, volume) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);

    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(volume, when + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(when);
    osc.stop(when + duration + 0.01);
  }

  _scheduleKickAt(when, volume) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(135, when);
    osc.frequency.exponentialRampToValueAtTime(48, when + 0.065);
    gain.gain.setValueAtTime(volume, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.07);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(when);
    osc.stop(when + 0.08);
  }

  _scheduleHatAt(when, volume, dur = 0.025) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1680, when);
    osc.frequency.exponentialRampToValueAtTime(420, when + dur);
    gain.gain.setValueAtTime(volume, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(when);
    osc.stop(when + dur + 0.01);
  }

  // =========================================================================
  // 8-BIT SOUND EFFECTS
  // =========================================================================

  _tone({ freq, endFreq = null, duration = 0.06, delay = 0, type = 'square', volume = 0.08 }) {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  blip() {
    this._tone({ freq: 780, endFreq: 980, duration: 0.045, type: 'square', volume: 0.06 });
  }

  confirm() {
    this._tone({ freq: 660, duration: 0.05, delay: 0, type: 'square', volume: 0.07 });
    this._tone({ freq: 990, duration: 0.07, delay: 0.045, type: 'square', volume: 0.07 });
  }

  cancel() {
    this._tone({ freq: 520, endFreq: 330, duration: 0.07, type: 'triangle', volume: 0.09 });
  }

  textTick() {
    this._tone({ freq: 620, duration: 0.022, type: 'triangle', volume: 0.04 });
  }

  door() {
    this._tone({ freq: 440, endFreq: 260, duration: 0.08, delay: 0, type: 'square', volume: 0.065 });
    this._tone({ freq: 330, endFreq: 180, duration: 0.11, delay: 0.07, type: 'triangle', volume: 0.08 });
  }

  bump() {
    this._tone({ freq: 145, endFreq: 70, duration: 0.075, type: 'triangle', volume: 0.12 });
  }

  /** Classic Gen 3 ledge jump hop sound. */
  hop() {
    this._tone({ freq: 260, endFreq: 520, duration: 0.09, delay: 0, type: 'triangle', volume: 0.1 });
    this._tone({ freq: 500, endFreq: 310, duration: 0.08, delay: 0.09, type: 'triangle', volume: 0.08 });
  }

  alert() {
    this._tone({ freq: 880, duration: 0.055, delay: 0, type: 'square', volume: 0.07 });
    this._tone({ freq: 1175, duration: 0.09, delay: 0.055, type: 'square', volume: 0.07 });
  }

  chirp() {
    this._tone({ freq: 1480, endFreq: 2100, duration: 0.055, delay: 0, type: 'triangle', volume: 0.04 });
    this._tone({ freq: 1620, endFreq: 2350, duration: 0.06, delay: 0.065, type: 'triangle', volume: 0.035 });
  }

  rustle() {
    this._tone({ freq: 340, endFreq: 190, duration: 0.045, type: 'triangle', volume: 0.035 });
  }

  battleStart() {
    const seq = [
      { f: 440, d: 0.06, t: 0.00 },
      { f: 523, d: 0.06, t: 0.06 },
      { f: 659, d: 0.06, t: 0.12 },
      { f: 587, d: 0.06, t: 0.18 },
      { f: 698, d: 0.06, t: 0.24 },
      { f: 880, d: 0.08, t: 0.30 },
      { f: 784, d: 0.07, t: 0.39 },
      { f: 880, d: 0.07, t: 0.47 },
      { f: 1046, d: 0.22, t: 0.55 },
    ];
    for (const n of seq) {
      this._tone({ freq: n.f, duration: n.d, delay: n.t, type: 'square', volume: 0.075 });
      this._tone({ freq: n.f * 0.5, duration: n.d, delay: n.t, type: 'triangle', volume: 0.065 });
    }
  }

  heal() {
    const notes = [
      { f: 587.33, d: 0.11, t: 0.00 },
      { f: 587.33, d: 0.11, t: 0.13 },
      { f: 587.33, d: 0.11, t: 0.26 },
      { f: 493.88, d: 0.12, t: 0.39 },
      { f: 783.99, d: 0.30, t: 0.52 },
    ];
    for (const n of notes) {
      this._tone({ freq: n.f, duration: n.d, delay: n.t, type: 'triangle', volume: 0.11 });
      this._tone({ freq: n.f * 2, duration: n.d * 0.7, delay: n.t, type: 'sine', volume: 0.035 });
    }
  }

  ballThrow() {
    this._tone({ freq: 340, endFreq: 760, duration: 0.12, delay: 0, type: 'triangle', volume: 0.07 });
    this._tone({ freq: 920, endFreq: 1380, duration: 0.06, delay: 0.18, type: 'square', volume: 0.065 });
  }

  hit() {
    this._tone({ freq: 220, endFreq: 75, duration: 0.11, type: 'square', volume: 0.095 });
    this._tone({ freq: 140, endFreq: 55, duration: 0.12, delay: 0.02, type: 'sawtooth', volume: 0.07 });
  }

  hitSuper() {
    this._tone({ freq: 360, endFreq: 95, duration: 0.14, type: 'sawtooth', volume: 0.1 });
    this._tone({ freq: 540, endFreq: 140, duration: 0.14, delay: 0.05, type: 'square', volume: 0.09 });
  }

  hitWeak() {
    this._tone({ freq: 180, endFreq: 110, duration: 0.08, type: 'triangle', volume: 0.08 });
  }

  slash() {
    this._tone({ freq: 1280, endFreq: 420, duration: 0.05, delay: 0.0, type: 'sawtooth', volume: 0.055 });
    this._tone({ freq: 1420, endFreq: 480, duration: 0.05, delay: 0.06, type: 'sawtooth', volume: 0.055 });
    this._tone({ freq: 1580, endFreq: 520, duration: 0.06, delay: 0.12, type: 'sawtooth', volume: 0.06 });
  }

  statDown() {
    this._tone({ freq: 620, endFreq: 420, duration: 0.08, delay: 0.0, type: 'triangle', volume: 0.09 });
    this._tone({ freq: 480, endFreq: 300, duration: 0.10, delay: 0.08, type: 'triangle', volume: 0.09 });
    this._tone({ freq: 360, endFreq: 200, duration: 0.13, delay: 0.18, type: 'triangle', volume: 0.09 });
  }

  statUp() {
    this._tone({ freq: 380, endFreq: 560, duration: 0.08, delay: 0.0, type: 'triangle', volume: 0.09 });
    this._tone({ freq: 520, endFreq: 740, duration: 0.10, delay: 0.08, type: 'triangle', volume: 0.09 });
    this._tone({ freq: 680, endFreq: 960, duration: 0.13, delay: 0.17, type: 'triangle', volume: 0.09 });
  }

  cry(speciesId = 1) {
    if (speciesId === 1) {
      this._tone({ freq: 320, endFreq: 460, duration: 0.10, delay: 0, type: 'square', volume: 0.065 });
      this._tone({ freq: 440, endFreq: 290, duration: 0.16, delay: 0.09, type: 'triangle', volume: 0.09 });
    } else if (speciesId === 4) {
      this._tone({ freq: 520, endFreq: 780, duration: 0.09, delay: 0, type: 'square', volume: 0.065 });
      this._tone({ freq: 740, endFreq: 580, duration: 0.14, delay: 0.08, type: 'square', volume: 0.06 });
    } else {
      this._tone({ freq: 420, endFreq: 680, duration: 0.08, delay: 0, type: 'triangle', volume: 0.09 });
      this._tone({ freq: 580, endFreq: 860, duration: 0.12, delay: 0.07, type: 'square', volume: 0.06 });
    }
  }

  faint() {
    this._tone({ freq: 380, endFreq: 90, duration: 0.28, type: 'triangle', volume: 0.1 });
  }

  levelUp() {
    const notes = [
      { f: 523.25, d: 0.08, t: 0.00 },
      { f: 659.25, d: 0.08, t: 0.08 },
      { f: 783.99, d: 0.08, t: 0.16 },
      { f: 1046.5, d: 0.10, t: 0.24 },
      { f: 1318.5, d: 0.28, t: 0.35 },
    ];
    for (const n of notes) {
      this._tone({ freq: n.f, duration: n.d, delay: n.t, type: 'square', volume: 0.075 });
    }
  }

  lowHpBeep() {
    this._tone({ freq: 980, duration: 0.055, delay: 0, type: 'square', volume: 0.045 });
    this._tone({ freq: 740, duration: 0.065, delay: 0.075, type: 'square', volume: 0.04 });
  }

  coin() {
    this._tone({ freq: 987.77, duration: 0.07, delay: 0, type: 'square', volume: 0.075 });
    this._tone({ freq: 1318.5, duration: 0.22, delay: 0.075, type: 'square', volume: 0.075 });
  }

  /** Wild grass encounter intro jingle (distinct from trainer battleStart). */
  wildEncounter() {
    const seq = [
      { f: 587, d: 0.05, t: 0.00 },
      { f: 659, d: 0.05, t: 0.05 },
      { f: 784, d: 0.05, t: 0.10 },
      { f: 880, d: 0.05, t: 0.15 },
      { f: 784, d: 0.05, t: 0.20 },
      { f: 988, d: 0.06, t: 0.25 },
      { f: 1175, d: 0.18, t: 0.32 },
    ];
    for (const n of seq) {
      this._tone({ freq: n.f, duration: n.d, delay: n.t, type: 'square', volume: 0.07 });
    }
  }

  /** Poké Ball wobble shake tick during catching. */
  ballShake() {
    this._tone({ freq: 340, endFreq: 210, duration: 0.07, delay: 0, type: 'triangle', volume: 0.1 });
    this._tone({ freq: 420, endFreq: 280, duration: 0.06, delay: 0.08, type: 'triangle', volume: 0.07 });
  }

  /** Click + celebratory catch jingle! */
  catchSuccess() {
    this._tone({ freq: 1100, duration: 0.04, delay: 0.0, type: 'square', volume: 0.07 });
    const notes = [
      { f: 523.25, d: 0.09, t: 0.10 },
      { f: 659.25, d: 0.09, t: 0.20 },
      { f: 783.99, d: 0.09, t: 0.30 },
      { f: 1046.5, d: 0.28, t: 0.40 },
    ];
    for (const n of notes) {
      this._tone({ freq: n.f, duration: n.d, delay: n.t, type: 'square', volume: 0.08 });
      this._tone({ freq: n.f * 0.5, duration: n.d, delay: n.t, type: 'triangle', volume: 0.07 });
    }
  }

  /** Bubbly tick when Poison status deals end-of-turn damage. */
  poisonTick() {
    this._tone({ freq: 240, endFreq: 160, duration: 0.07, delay: 0, type: 'sawtooth', volume: 0.06 });
    this._tone({ freq: 200, endFreq: 130, duration: 0.09, delay: 0.08, type: 'sawtooth', volume: 0.06 });
  }

  fanfare() {
    const notes = [
      { f: 523.25, d: 0.09, t: 0.00 },
      { f: 659.25, d: 0.09, t: 0.10 },
      { f: 783.99, d: 0.09, t: 0.20 },
      { f: 1046.5, d: 0.16, t: 0.30 },
      { f: 880.00, d: 0.09, t: 0.48 },
      { f: 987.77, d: 0.09, t: 0.58 },
      { f: 1046.5, d: 0.34, t: 0.68 },
    ];
    for (const n of notes) {
      this._tone({ freq: n.f, duration: n.d, delay: n.t, type: 'square', volume: 0.075 });
      this._tone({ freq: n.f * 0.5, duration: n.d, delay: n.t, type: 'triangle', volume: 0.065 });
    }
  }
}

export const audio = new AudioManager();
