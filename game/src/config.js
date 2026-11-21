// config.js — fixed numbers for "Spot the Difference — Curious Corners".
// One canvas, two panels, three levels. Nothing here touches the network.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

// One scene picture is drawn at this size; both panels show it 1:1.
export const SCENE_W = 600;
export const SCENE_H = 420;

// The two panels: left is the original, right is the altered copy.
export const PANELS = [
  { x: 24, y: 88, w: SCENE_W, h: SCENE_H }, // left: original
  { x: 656, y: 88, w: SCENE_W, h: SCENE_H }, // right: altered
];
export const HEADER_H = 72;
export const FOOTER_Y = 524;

// Three levels, rising difficulty: more differences, less time.
export const LEVELS = [
  { name: 'The Corner Café', scene: 0, differences: 7, time: 180, hints: 3 },
  { name: 'Lantern Night Market', scene: 1, differences: 8, time: 150, hints: 3 },
  { name: 'Sunset Cove Beach', scene: 2, differences: 10, time: 120, hints: 3 },
];

export const SCORE_FIND = 100;
export const SCORE_HINT_COST = 25;
export const WRONG_PENALTY_S = 5;
export const HINT_COOLDOWN_S = 10;
export const WIN_BONUS_PER_S = 5;
export const MARKER_R = 26; // radius of the green found-marker circle
export const CLICK_TOLERANCE = 10; // extra pixels of forgiveness around a difference
