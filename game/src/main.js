// main.js — bootstrap: canvas, game loop, deterministic screenshot states.
// Normal play starts on the title screen. ?shot=start|play|market|end&seed=N
// builds a frozen, deterministic state for screenshots and sets
// window.__shotReady once it has rendered.

import { CANVAS_W, CANVAS_H, LEVELS } from './config.js';
import { DIFFS } from './differences.js';
import { createState, startLevel, tick } from './state.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { setMuted } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot') || '';
const seed = Number(params.get('seed') || '1') || 1;

const state = createState();
state.seed = seed;

// Deterministic screenshot states. The timer is frozen in shot mode, the
// score and the pre-found differences are fixed, so a screenshot is the
// same on every run.
if (shot === 'play') {
  state.shotMode = true;
  startLevel(state, 0, seed);
  state.found = new Set([0, 2, 4]);
  state.foundOrder = [0, 2, 4];
  state.timeLeft = 151;
  state.score = 300;
} else if (shot === 'market') {
  state.shotMode = true;
  startLevel(state, 1, seed);
  state.found = new Set([2, 4, 6]);
  state.foundOrder = [2, 4, 6];
  state.timeLeft = 121;
  state.score = 300;
} else if (shot === 'end') {
  state.shotMode = true;
  startLevel(state, 2, seed);
  state.found = new Set(DIFFS[2].map((_, i) => i));
  state.foundOrder = DIFFS[2].map((_, i) => i);
  state.timeLeft = 50;
  state.levelBonus = 250;
  state.score = 1450;
  state.screen = 'levelComplete';
} else if (shot === 'start') {
  state.shotMode = true;
  state.screen = 'title';
}

// Debug/probe handle (the starter's debug scripts used the same pattern).
window.__game = { state, DIFFS, LEVELS };

attachInput(canvas, state);

// Auto-pause when the tab loses focus mid-game (never in shot mode).
window.addEventListener('blur', () => {
  if (state.screen === 'play' && !state.paused && !state.shotMode) state.paused = true;
});

// Mute by default in shot mode: no user gesture has happened, so audio
// would be suspended anyway; keep the flag honest for the HUD.
if (state.shotMode) setMuted(true);

let last = performance.now();
let frames = 0;
window.__errs = [];

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  try {
    tick(state, dt);
    render(ctx, state);
  } catch (e) {
    // One bad frame must never freeze the game: record it and keep going.
    window.__errs.push(String(e && e.message ? e.message : e));
    console.error(e);
  }
  frames += 1;
  if (state.shotMode && frames >= 3) window.__shotReady = true;
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
