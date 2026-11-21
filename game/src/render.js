// render.js — everything the player sees, drawn on one 1280x720 canvas.
// buttonRects(state) is the single source of truth for button rectangles:
// render.js draws them, input.js hit-tests the same rectangles.
//
// Scene pictures are painted once per (scene, variant, seed) by scenes.js
// and cached here; each frame just draws the two cached pictures.

import { CANVAS_W, CANVAS_H, PANELS, HEADER_H, LEVELS, MARKER_R, SCENE_W, SCENE_H } from './config.js';
import { DIFFS } from './differences.js';
import { paintScene } from './scenes.js';
import { formatTime } from './state.js';

const sceneCache = new Map();

export function getSceneCanvas(scene, variant, seed) {
  const key = `${scene}:${variant}:${seed}`;
  if (!sceneCache.has(key)) sceneCache.set(key, paintScene(scene, variant, seed));
  return sceneCache.get(key);
}

// ---------- buttons ----------
export function buttonRects(state) {
  if (state.screen === 'title') {
    return {
      start: { x: 490, y: 500, w: 300, h: 64 },
      card0: { x: 100, y: 250, w: 300, h: 210 },
      card1: { x: 490, y: 250, w: 300, h: 210 },
      card2: { x: 880, y: 250, w: 300, h: 210 },
    };
  }
  if (state.screen === 'play' && state.paused) {
    return {
      resume: { x: 490, y: 330, w: 300, h: 48 },
      restart: { x: 490, y: 390, w: 300, h: 48 },
      title: { x: 490, y: 450, w: 300, h: 48 },
    };
  }
  if (state.screen === 'play') {
    return {
      hint: { x: 24, y: 580, w: 170, h: 56 },
      pause: { x: 210, y: 580, w: 170, h: 56 },
      restart: { x: 396, y: 580, w: 170, h: 56 },
      mute: { x: 582, y: 580, w: 170, h: 56 },
    };
  }
  if (state.screen === 'levelComplete') {
    return {
      next: { x: 490, y: 500, w: 300, h: 56 },
      title: { x: 540, y: 570, w: 200, h: 40 },
    };
  }
  if (state.screen === 'gameOver') {
    return {
      retry: { x: 490, y: 430, w: 300, h: 56 },
      title: { x: 540, y: 500, w: 200, h: 40 },
    };
  }
  if (state.screen === 'victory') {
    return {
      again: { x: 490, y: 480, w: 300, h: 56 },
      title: { x: 540, y: 550, w: 200, h: 40 },
    };
  }
  return {};
}

// ---------- small draw helpers ----------
function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function pill(c, x, y, w, h, bg, border) {
  rr(c, x, y, w, h, h / 2);
  c.fillStyle = bg;
  c.fill();
  if (border) { c.lineWidth = 2; c.strokeStyle = border; c.stroke(); }
}

function label(c, s, x, y, font, color, align) {
  c.font = font;
  c.fillStyle = color;
  c.textAlign = align || 'center';
  c.textBaseline = 'middle';
  c.fillText(s, x, y);
}

function drawButton(c, rect, text, opts = {}) {
  const { disabled = false, accent = false, sub = '' } = opts;
  rr(c, rect.x, rect.y, rect.w, rect.h, 12);
  c.fillStyle = disabled ? '#2a3550' : accent ? '#e8a34c' : '#33415e';
  c.fill();
  c.lineWidth = 2;
  c.strokeStyle = disabled ? '#3a4a6b' : accent ? '#ffd94d' : '#55688f';
  c.stroke();
  label(
    c,
    text,
    rect.x + rect.w / 2,
    rect.y + rect.h / 2 + (sub ? -8 : 0),
    `bold ${rect.h > 50 ? 20 : 17}px system-ui, "Segoe UI", Arial, sans-serif`,
    disabled ? '#7d8aa8' : accent ? '#241a08' : '#f2f5ff',
  );
  if (sub) {
    label(c, sub, rect.x + rect.w / 2, rect.y + rect.h / 2 + 14, '13px system-ui, Arial, sans-serif', disabled ? '#5d6a88' : '#c9d4ee');
  }
}

// ---------- header / footer ----------
function drawHeader(c, state) {
  const level = LEVELS[state.level];
  label(c, 'SPOT THE DIFFERENCE', 24, 30, 'bold 28px system-ui, "Segoe UI", Arial, sans-serif', '#ffd94d', 'left');
  label(c, 'Curious Corners', 24, 56, 'italic 15px Georgia, serif', '#c9d4ee', 'left');
  // level name, centred
  const lw = 300;
  pill(c, CANVAS_W / 2 - lw / 2, 16, lw, 40, '#ffffff14', '#ffffff2e');
  label(c, `LEVEL ${state.level + 1} · ${level.name.toUpperCase()}`, CANVAS_W / 2, 37, 'bold 16px system-ui, Arial, sans-serif', '#f2f5ff');
  // counter / timer / score pills, right
  const found = state.found.size;
  const total = level.differences;
  const urgent = state.timeLeft <= 10 && state.screen === 'play';
  pill(c, 812, 16, 132, 40, found === total ? '#2e7d4f' : '#ffffff14', found === total ? '#7bd389' : '#ffffff2e');
  label(c, `FOUND ${found} / ${total}`, 878, 37, 'bold 16px system-ui, Arial, sans-serif', '#f2f5ff');
  pill(c, 956, 16, 96, 40, urgent ? '#a93226' : '#ffffff14', urgent ? '#ff8a7a' : '#ffffff2e');
  label(c, formatTime(state.timeLeft), 1004, 37, 'bold 18px system-ui, Arial, sans-serif', urgent ? '#ffe1dc' : '#f2f5ff');
  pill(c, 1064, 16, 192, 40, '#ffffff14', '#ffffff2e');
  label(c, `SCORE ${state.score}`, 1160, 37, 'bold 16px system-ui, Arial, sans-serif', '#ffd94d');
}

function drawFooter(c, state) {
  const rects = buttonRects(state);
  const hintDisabled = state.hintsLeft <= 0;
  const hintSub = state.hintsLeft > 0
    ? (state.hintCooldown > 0 ? `${Math.ceil(state.hintCooldown)}s…` : `${state.hintsLeft} left`)
    : 'none left';
  drawButton(c, rects.hint, 'HINT  (H)', { disabled: hintDisabled, sub: hintSub });
  drawButton(c, rects.pause, 'PAUSE  (P)');
  drawButton(c, rects.restart, 'RESTART  (R)');
  drawButton(c, rects.mute, state.muted ? 'SOUND: OFF  (M)' : 'SOUND: ON  (M)');
  // level progress dots, right
  label(c, 'LEVELS', 900, 596, 'bold 14px system-ui, Arial, sans-serif', '#c9d4ee', 'left');
  for (let i = 0; i < LEVELS.length; i += 1) {
    const dx = 980 + i * 40;
    c.beginPath();
    c.arc(dx, 610, 12, 0, Math.PI * 2);
    c.fillStyle = i < state.level || (state.screen === 'victory') ? '#7bd389' : i === state.level ? '#ffd94d' : '#33415e';
    c.fill();
    c.lineWidth = 2; c.strokeStyle = '#f2f5ff88'; c.stroke();
    label(c, String(i + 1), dx, 611, 'bold 13px system-ui, Arial, sans-serif', '#141c30');
  }
  label(c, `BEST ${state.best}`, 1160, 610, 'bold 15px system-ui, Arial, sans-serif', '#c9d4ee', 'right');
  // message bar
  if (state.message && state.now < state.messageUntil) {
    label(c, state.message, CANVAS_W / 2, 540, '16px system-ui, Arial, sans-serif', '#ffe9a8');
  }
}

// ---------- panels ----------
function drawMarker(c, px, py, pulse) {
  const r = MARKER_R + (pulse ? Math.sin(performance.now() / 160) * 3 : 0);
  c.save();
  c.shadowColor = '#37d67a';
  c.shadowBlur = 14;
  c.beginPath();
  c.arc(px, py, r, 0, Math.PI * 2);
  c.fillStyle = '#37d67a22';
  c.fill();
  c.lineWidth = 5;
  c.strokeStyle = '#37d67a';
  c.stroke();
  c.restore();
  // check mark
  c.beginPath();
  c.moveTo(px - 10, py);
  c.lineTo(px - 3, py + 8);
  c.lineTo(px + 11, py - 8);
  c.lineWidth = 4;
  c.strokeStyle = '#eafff1';
  c.lineCap = 'round';
  c.stroke();
}

function drawPanels(c, state) {
  const level = LEVELS[state.level];
  const diffs = DIFFS[state.level];
  for (let p = 0; p < 2; p += 1) {
    const panel = PANELS[p];
    // frame
    c.save();
    c.shadowColor = '#00000088';
    c.shadowBlur = 16;
    c.shadowOffsetY = 4;
    rr(c, panel.x - 4, panel.y - 4, panel.w + 8, panel.h + 8, 10);
    c.fillStyle = '#e8c98a';
    c.fill();
    c.restore();
    c.drawImage(getSceneCanvas(level.scene, p, state.seed), panel.x, panel.y);
    // corner label chip
    pill(c, panel.x + 8, panel.y + 8, p === 0 ? 108 : 168, 24, '#141c30cc', '#ffffff33');
    label(c, p === 0 ? 'ORIGINAL' : 'FIND THE CHANGES', panel.x + (p === 0 ? 62 : 92), panel.y + 21, 'bold 12px system-ui, Arial, sans-serif', '#f2f5ff');
    // found markers on both panels
    for (const i of state.found) {
      const d = diffs[i];
      drawMarker(c, panel.x + d.x, panel.y + d.y, false);
    }
    // hint flash ring
    if (state.hintFlash && state.hintFlash.level === state.level) {
      const d = diffs[state.hintFlash.index];
      const pr = MARKER_R + 6 + Math.sin(state.now * 6) * 3;
      c.beginPath();
      c.arc(panel.x + d.x, panel.y + d.y, pr, 0, Math.PI * 2);
      c.fillStyle = '#ffd94d22';
      c.fill();
      c.lineWidth = 4;
      c.strokeStyle = '#ffd94d';
      c.stroke();
    }
    // wrong-click X
    if (state.wrongFlash && state.wrongFlash.panel === p) {
      const wx = panel.x + state.wrongFlash.x;
      const wy = panel.y + state.wrongFlash.y;
      c.beginPath();
      c.moveTo(wx - 12, wy - 12); c.lineTo(wx + 12, wy + 12);
      c.moveTo(wx + 12, wy - 12); c.lineTo(wx - 12, wy + 12);
      c.lineWidth = 5;
      c.strokeStyle = '#ff5a5a';
      c.lineCap = 'round';
      c.stroke();
    }
    // floating +100s
    for (const f of state.floaters) {
      if (f.panel !== p) continue;
      const age = 1.1 - (f.until - state.now);
      const alpha = Math.max(0, 1 - age / 1.1);
      c.globalAlpha = alpha;
      label(c, f.text, panel.x + f.x, panel.y + f.y - age * 26, 'bold 22px system-ui, Arial, sans-serif', f.color);
      c.globalAlpha = 1;
    }
  }
}

// ---------- screens ----------
function drawTitle(c, state) {
  label(c, 'SPOT THE DIFFERENCE', CANVAS_W / 2, 92, 'bold 58px system-ui, "Segoe UI", Arial, sans-serif', '#ffd94d');
  label(c, 'Curious Corners — three hand-drawn scenes, 25 hidden differences', CANVAS_W / 2, 138, 'italic 21px Georgia, serif', '#c9d4ee');
  label(c, 'Click a difference on either picture to circle it  ·  Wrong clicks cost 5 seconds  ·  H spends a hint', CANVAS_W / 2, 176, '16px system-ui, Arial, sans-serif', '#f2f5ff');
  label(c, 'Mouse + keyboard  ·  P pause  ·  M mute  ·  R restart', CANVAS_W / 2, 204, '15px system-ui, Arial, sans-serif', '#8fa0c2');
  const rects = buttonRects(state);
  for (let i = 0; i < LEVELS.length; i += 1) {
    const r = rects[`card${i}`];
    const level = LEVELS[i];
    rr(c, r.x, r.y, r.w, r.h, 14);
    c.fillStyle = '#232f4d';
    c.fill();
    c.lineWidth = 2;
    c.strokeStyle = '#55688f';
    c.stroke();
    c.drawImage(getSceneCanvas(level.scene, 0, 1), r.x + 10, r.y + 10, 280, 150);
    label(c, `LEVEL ${i + 1} — ${level.name}`, r.x + r.w / 2, r.y + 180, 'bold 16px system-ui, Arial, sans-serif', '#f2f5ff');
    label(c, `${level.differences} differences  ·  ${formatTime(level.time)}  ·  ${level.hints} hints`, r.x + r.w / 2, r.y + 200, '13px system-ui, Arial, sans-serif', '#c9d4ee');
  }
  drawButton(c, rects.start, 'START PLAYING', { accent: true, sub: 'or press Enter' });
  if (state.best > 0) {
    label(c, `Best score so far: ${state.best}`, CANVAS_W / 2, 600, 'bold 17px system-ui, Arial, sans-serif', '#ffd94d');
  }
  label(c, 'Every scene is drawn in code for this game — no photos, no borrowed art.', CANVAS_W / 2, 640, '14px system-ui, Arial, sans-serif', '#8fa0c2');
}

function dim(c) {
  c.fillStyle = '#0d1322d9';
  c.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function card(c, x, y, w, h) {
  rr(c, x, y, w, h, 18);
  c.fillStyle = '#232f4d';
  c.fill();
  c.lineWidth = 2;
  c.strokeStyle = '#e8a34c';
  c.stroke();
}

function drawLevelComplete(c, state) {
  dim(c);
  const level = LEVELS[state.level];
  card(c, 390, 140, 500, 380);
  label(c, 'LEVEL COMPLETE!', 640, 190, 'bold 36px system-ui, Arial, sans-serif', '#7bd389');
  label(c, level.name, 640, 228, 'italic 20px Georgia, serif', '#c9d4ee');
  label(c, `Found ${level.differences} / ${level.differences}  ·  Time bonus +${state.levelBonus}  ·  Score ${state.score}`, 640, 262, 'bold 17px system-ui, Arial, sans-serif', '#ffd94d');
  // the differences, named — proof the hunt was real
  const diffs = DIFFS[state.level];
  label(c, 'What you spotted:', 640, 296, 'bold 15px system-ui, Arial, sans-serif', '#f2f5ff');
  diffs.forEach((d, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    label(c, `✓ ${d.label}`, col === 0 ? 420 : 640, 322 + row * 22, '14px system-ui, Arial, sans-serif', '#c9d4ee', 'left');
  });
  const rects = buttonRects(state);
  const isLast = state.level === LEVELS.length - 1;
  drawButton(c, rects.next, isLast ? 'SEE YOUR RESULTS' : `NEXT: ${LEVELS[state.level + 1].name.toUpperCase()}`, { accent: true, sub: 'or press Enter' });
  drawButton(c, rects.title, 'BACK TO TITLE');
}

function drawGameOver(c, state) {
  dim(c);
  const level = LEVELS[state.level];
  card(c, 390, 170, 500, 360);
  label(c, "TIME'S UP!", 640, 224, 'bold 38px system-ui, Arial, sans-serif', '#ff8a7a');
  label(c, level.name, 640, 264, 'italic 20px Georgia, serif', '#c9d4ee');
  label(c, `You found ${state.found.size} of ${level.differences} differences`, 640, 300, 'bold 17px system-ui, Arial, sans-serif', '#f2f5ff');
  label(c, 'The rest were hiding in plain sight — try again!', 640, 330, '15px system-ui, Arial, sans-serif', '#c9d4ee');
  const rects = buttonRects(state);
  drawButton(c, rects.retry, 'TRY AGAIN', { accent: true, sub: 'or press Enter' });
  drawButton(c, rects.title, 'BACK TO TITLE');
}

function drawVictory(c, state) {
  dim(c);
  card(c, 340, 120, 600, 470);
  label(c, 'YOU FOUND THEM ALL!', 640, 172, 'bold 38px system-ui, Arial, sans-serif', '#ffd94d');
  label(c, 'All 25 differences across all three scenes', 640, 212, 'italic 19px Georgia, serif', '#c9d4ee');
  label(c, `FINAL SCORE  ${state.score}`, 640, 254, 'bold 26px system-ui, Arial, sans-serif', '#7bd389');
  if (state.score >= state.best && state.score > 0) {
    label(c, 'A new best score!', 640, 288, 'bold 16px system-ui, Arial, sans-serif', '#ffd94d');
  } else {
    label(c, `Best score: ${state.best}`, 640, 288, '16px system-ui, Arial, sans-serif', '#c9d4ee');
  }
  // the whole hunt, named
  let y = 322;
  for (let l = 0; l < LEVELS.length; l += 1) {
    label(c, `${LEVELS[l].name} — ${DIFFS[l].length} found`, 640, y, '15px system-ui, Arial, sans-serif', '#f2f5ff');
    y += 24;
  }
  label(c, 'Thanks for playing — every scene was drawn in code for this game.', 640, y + 16, '14px system-ui, Arial, sans-serif', '#8fa0c2');
  const rects = buttonRects(state);
  drawButton(c, rects.again, 'PLAY AGAIN', { accent: true, sub: 'or press Enter' });
  drawButton(c, rects.title, 'BACK TO TITLE');
}

function drawPaused(c, state) {
  dim(c);
  card(c, 440, 240, 400, 260);
  label(c, 'PAUSED', 640, 288, 'bold 34px system-ui, Arial, sans-serif', '#ffd94d');
  const rects = buttonRects(state);
  drawButton(c, rects.resume, 'RESUME  (P)');
  drawButton(c, rects.restart, 'RESTART LEVEL  (R)');
  drawButton(c, rects.title, 'BACK TO TITLE');
}

// ---------- main entry ----------
export function render(ctx, state) {
  // backdrop
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  g.addColorStop(0, '#1d2b45');
  g.addColorStop(1, '#121a2e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  if (state.screen === 'title') {
    drawTitle(ctx, state);
    return;
  }
  drawHeader(ctx, state);
  drawPanels(ctx, state);
  if (state.screen === 'play' && !state.paused) drawFooter(ctx, state);
  if (state.screen === 'levelComplete') drawLevelComplete(ctx, state);
  else if (state.screen === 'gameOver') drawGameOver(ctx, state);
  else if (state.screen === 'victory') drawVictory(ctx, state);
  else if (state.screen === 'play' && state.paused) drawPaused(ctx, state);
}
