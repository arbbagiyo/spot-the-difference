// state.js — the game state machine: screens, levels, scoring, timer, hints.
// Pure logic over a plain state object; render.js only reads it, input.js
// only calls these functions. All side effects (sounds) go through audio.js.

import {
  LEVELS,
  SCORE_FIND,
  SCORE_HINT_COST,
  WRONG_PENALTY_S,
  HINT_COOLDOWN_S,
  WIN_BONUS_PER_S,
} from './config.js';
import { DIFFS } from './differences.js';
import {
  playFound,
  playWrong,
  playHint,
  playWin,
  playLose,
  playTick,
  playClick,
} from './audio.js';

const BEST_KEY = 'spot-the-difference-best';

function loadBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(score) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    /* storage unavailable: best score just isn't kept */
  }
}

export function createState() {
  return {
    screen: 'title', // title | play | levelComplete | gameOver | victory
    level: 0,
    seed: 1,
    found: new Set(),
    foundOrder: [],
    score: 0,
    timeLeft: LEVELS[0].time,
    hintsLeft: LEVELS[0].hints,
    hintCooldown: 0,
    hintFlash: null, // { level, index, until }
    wrongFlash: null, // { panel, x, y, until }
    floaters: [], // { x, y, text, color, until }
    paused: false,
    muted: false,
    message: '',
    messageUntil: 0,
    levelBonus: 0,
    best: loadBest(),
    now: 0, // seconds since boot, advanced by the main loop
    lastTickSecond: -1,
    shotMode: false, // frozen deterministic state for ?shot=…
  };
}

export function startLevel(state, levelIndex, seed) {
  const level = LEVELS[levelIndex];
  state.level = levelIndex;
  state.seed = seed ?? Math.floor(Math.random() * 1e9);
  state.found = new Set();
  state.foundOrder = [];
  state.timeLeft = level.time;
  state.hintsLeft = level.hints;
  state.hintCooldown = 0;
  state.hintFlash = null;
  state.wrongFlash = null;
  state.floaters = [];
  state.paused = false;
  state.screen = 'play';
  state.levelBonus = 0;
  state.lastTickSecond = -1;
  setMessage(state, `Find ${level.differences} differences — click them on either picture!`);
  playClick();
}

export function setMessage(state, text, seconds = 3) {
  state.message = text;
  state.messageUntil = state.now + seconds;
}

export function markFound(state, index, panel, sceneX, sceneY) {
  const level = LEVELS[state.level];
  if (state.found.has(index)) return;
  state.found.add(index);
  state.foundOrder.push(index);
  state.score += SCORE_FIND;
  state.floaters.push({
    panel,
    x: sceneX,
    y: sceneY - 34,
    text: `+${SCORE_FIND}`,
    color: '#7bd389',
    until: state.now + 1.1,
  });
  playFound();
  const remaining = level.differences - state.found.size;
  if (remaining === 0) {
    state.levelBonus = Math.max(0, Math.ceil(state.timeLeft)) * WIN_BONUS_PER_S;
    state.score += state.levelBonus;
    state.screen = state.level === LEVELS.length - 1 ? 'victory' : 'levelComplete';
    if (state.score > state.best) {
      state.best = state.score;
      saveBest(state.score);
    }
    playWin();
  } else {
    setMessage(state, `${DIFFS[state.level][index].label} — ${remaining} to go!`);
  }
}

export function markWrong(state, panel, sceneX, sceneY) {
  state.timeLeft = Math.max(0, state.timeLeft - WRONG_PENALTY_S);
  state.wrongFlash = { panel, x: sceneX, y: sceneY, until: state.now + 0.6 };
  playWrong();
  setMessage(state, `Not a difference — minus ${WRONG_PENALTY_S} seconds!`);
  if (state.timeLeft <= 0) {
    state.screen = 'gameOver';
    playLose();
  }
}

export function useHint(state) {
  if (state.screen !== 'play' || state.paused) return;
  const level = LEVELS[state.level];
  if (state.hintsLeft <= 0) {
    setMessage(state, 'No hints left on this level!');
    return;
  }
  if (state.hintCooldown > 0) {
    setMessage(state, `Hint recharging — ${Math.ceil(state.hintCooldown)}s…`);
    return;
  }
  const remaining = DIFFS[state.level].map((_, i) => i).filter((i) => !state.found.has(i));
  if (remaining.length === 0) return;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - SCORE_HINT_COST);
  state.hintCooldown = HINT_COOLDOWN_S;
  state.hintFlash = { level: state.level, index: pick, until: state.now + 2.4 };
  playHint();
  setMessage(state, `Hint used (−${SCORE_HINT_COST} pts) — watch the golden ring!`);
}

export function togglePause(state) {
  if (state.screen !== 'play') return;
  state.paused = !state.paused;
  playClick();
}

export function backToTitle(state) {
  state.screen = 'title';
  state.paused = false;
  playClick();
}

// Advance the clock. Called once per animation frame from main.js.
export function tick(state, dt) {
  state.now += dt;
  state.floaters = state.floaters.filter((f) => f.until > state.now);
  if (state.hintFlash && state.hintFlash.until <= state.now) state.hintFlash = null;
  if (state.wrongFlash && state.wrongFlash.until <= state.now) state.wrongFlash = null;
  if (state.hintCooldown > 0) state.hintCooldown = Math.max(0, state.hintCooldown - dt);
  if (state.screen !== 'play' || state.paused || state.shotMode) return;
  state.timeLeft -= dt;
  const whole = Math.ceil(state.timeLeft);
  if (whole <= 10 && whole > 0 && whole !== state.lastTickSecond) {
    state.lastTickSecond = whole;
    playTick();
  }
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = 'gameOver';
    playLose();
  }
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
