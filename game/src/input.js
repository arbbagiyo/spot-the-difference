// input.js — mouse, touch and keyboard. Maps a canvas click to a panel and
// a scene point, hit-tests it against the unfound differences, and routes
// button clicks for the current screen. Button rectangles come from
// render.js's buttonRects(state) so the drawn buttons and the hit areas are
// always the same rectangles.

import { PANELS, CLICK_TOLERANCE, LEVELS } from './config.js';
import { hitTest } from './differences.js';
import { buttonRects } from './render.js';
import {
  startLevel,
  markFound,
  markWrong,
  useHint,
  togglePause,
  backToTitle,
} from './state.js';
import { unlockAudio, setMuted, playClick } from './audio.js';

function inside(x, y, r) {
  return r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function panelAt(x, y) {
  for (let i = 0; i < PANELS.length; i += 1) {
    const p = PANELS[i];
    if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return i;
  }
  return -1;
}

function handlePlayClick(state, x, y) {
  const rects = buttonRects(state);
  if (inside(x, y, rects.hint)) { useHint(state); return; }
  if (inside(x, y, rects.pause)) { togglePause(state); return; }
  if (inside(x, y, rects.restart)) { startLevel(state, state.level); return; }
  if (inside(x, y, rects.mute)) {
    state.muted = !state.muted;
    setMuted(state.muted);
    playClick();
    return;
  }
  if (state.paused) return;
  const panel = panelAt(x, y);
  if (panel === -1) return;
  const sceneX = x - PANELS[panel].x;
  const sceneY = y - PANELS[panel].y;
  const hit = hitTest(state.level, sceneX, sceneY, state.found, CLICK_TOLERANCE);
  if (hit >= 0) markFound(state, hit, panel, sceneX, sceneY);
  else markWrong(state, panel, sceneX, sceneY);
}

export function handlePointer(state, x, y) {
  unlockAudio();
  const rects = buttonRects(state);
  if (state.screen === 'title') {
    if (inside(x, y, rects.start)) { state.score = 0; startLevel(state, 0); return; }
    for (let i = 0; i < LEVELS.length; i += 1) {
      if (inside(x, y, rects[`card${i}`])) { state.score = 0; startLevel(state, i); return; }
    }
    return;
  }
  if (state.screen === 'play') {
    if (state.paused) {
      if (inside(x, y, rects.resume)) { togglePause(state); return; }
      if (inside(x, y, rects.restart)) { startLevel(state, state.level); return; }
      if (inside(x, y, rects.title)) { backToTitle(state); return; }
      return;
    }
    handlePlayClick(state, x, y);
    return;
  }
  if (state.screen === 'levelComplete') {
    if (inside(x, y, rects.next)) {
      if (state.level >= LEVELS.length - 1) state.screen = 'victory';
      else startLevel(state, state.level + 1);
      return;
    }
    if (inside(x, y, rects.title)) { backToTitle(state); return; }
    return;
  }
  if (state.screen === 'gameOver') {
    if (inside(x, y, rects.retry)) { startLevel(state, state.level); return; }
    if (inside(x, y, rects.title)) { backToTitle(state); return; }
    return;
  }
  if (state.screen === 'victory') {
    if (inside(x, y, rects.again)) { startLevel(state, 0); state.score = 0; return; }
    if (inside(x, y, rects.title)) { backToTitle(state); return; }
  }
}

export function handleKey(state, key) {
  unlockAudio();
  if (key === 'm' || key === 'M') {
    state.muted = !state.muted;
    setMuted(state.muted);
    return;
  }
  if (state.screen === 'title') {
    if (key === 'Enter' || key === ' ') { state.score = 0; startLevel(state, 0); }
    if (key === '1') { state.score = 0; startLevel(state, 0); }
    if (key === '2') { state.score = 0; startLevel(state, 1); }
    if (key === '3') { state.score = 0; startLevel(state, 2); }
    return;
  }
  if (state.screen === 'play') {
    if (key === 'p' || key === 'P' || key === 'Escape') { togglePause(state); return; }
    if (key === 'h' || key === 'H') { useHint(state); return; }
    if (key === 'r' || key === 'R') { startLevel(state, state.level); return; }
    return;
  }
  if (state.screen === 'levelComplete' && key === 'Enter') {
    if (state.level >= LEVELS.length - 1) state.screen = 'victory';
    else startLevel(state, state.level + 1);
  }
  if (state.screen === 'gameOver' && (key === 'Enter' || key === 'r' || key === 'R')) {
    startLevel(state, state.level);
  }
  if (state.screen === 'victory' && key === 'Enter') { startLevel(state, 0); state.score = 0; }
}

export function attachInput(canvas, state) {
  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * canvas.width;
    const y = ((e.clientY - r.top) / r.height) * canvas.height;
    handlePointer(state, x, y);
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('keydown', (e) => {
    if ([' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
    handleKey(state, e.key);
  });
}
