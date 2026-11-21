// audio.js — every sound is synthesized with WebAudio. No audio files,
// no network. The context is created lazily on the first user gesture
// (browsers block audio before that); every call is guarded so a suspended
// or missing context never throws.

let ctx = null;
let muted = false;

function ensureCtx() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch {
    ctx = null;
  }
  return ctx;
}

export function unlockAudio() {
  const c = ensureCtx();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

export function setMuted(m) {
  muted = m;
}

export function isMuted() {
  return muted;
}

// One short note: oscillator + gain envelope.
function tone(freq, dur, type, vol, when = 0, slideTo = null) {
  if (muted) return;
  const c = ensureCtx();
  if (!c || c.state !== 'running') return;
  try {
    const t0 = c.currentTime + when;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch {
    /* audio must never break the game */
  }
}

// A satisfying two-note chime when a difference is found.
export function playFound() {
  tone(659.25, 0.16, 'sine', 0.22); // E5
  tone(880.0, 0.28, 'sine', 0.22, 0.09); // A5
  tone(1318.5, 0.2, 'triangle', 0.08, 0.09); // E6 sparkle
}

// A dull low buzz for a wrong click.
export function playWrong() {
  tone(110, 0.22, 'sawtooth', 0.12, 0, 82);
}

// A soft pluck when a hint is spent.
export function playHint() {
  tone(523.25, 0.14, 'triangle', 0.15);
  tone(783.99, 0.2, 'triangle', 0.12, 0.07);
}

// A UI click.
export function playClick() {
  tone(440, 0.06, 'square', 0.05);
}

// A short blip for the last ten seconds of the timer.
export function playTick() {
  tone(980, 0.05, 'square', 0.05);
}

// A little arpeggio when a level is cleared.
export function playWin() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.24, 'sine', 0.2, i * 0.11));
  tone(1318.5, 0.5, 'sine', 0.16, 0.48);
}

// A descending phrase for game over.
export function playLose() {
  [392, 329.63, 261.63].forEach((f, i) => tone(f, 0.3, 'triangle', 0.14, i * 0.16));
}
