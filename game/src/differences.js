// differences.js — where every planted difference lives.
// One entry per difference: scene coordinates (600 x 420 space), the click
// radius, and a short name shown in the level-complete list. The painters in
// scenes.js draw the altered version of exactly these spots on the right
// panel; render.js draws the green marker circles at these coordinates on
// both panels once a difference is found.

export const DIFFS = [
  // Level 1 — The Corner Café (7)
  [
    { x: 150, y: 182, r: 26, label: 'Cat on the windowsill' },
    { x: 302, y: 72, r: 26, label: 'Clock hands' },
    { x: 152, y: 330, r: 24, label: 'Cup colour' },
    { x: 470, y: 240, r: 22, label: 'Pastry in the display' },
    { x: 425, y: 156, r: 24, label: 'Menu word' },
    { x: 548, y: 378, r: 26, label: 'Plant leaves' },
    { x: 212, y: 344, r: 20, label: 'Spoon on the table' },
  ],
  // Level 2 — Lantern Night Market (8)
  [
    { x: 520, y: 62, r: 28, label: 'The moon' },
    { x: 200, y: 72, r: 18, label: 'String-light bulb' },
    { x: 330, y: 152, r: 24, label: 'Red lantern' },
    { x: 122, y: 300, r: 20, label: 'Apple in the basket' },
    { x: 480, y: 182, r: 22, label: 'Balloons' },
    { x: 300, y: 232, r: 20, label: 'Vendor hat stripe' },
    { x: 92, y: 362, r: 24, label: 'Cat on the crate' },
    { x: 542, y: 372, r: 22, label: 'Lantern on the ground' },
  ],
  // Level 3 — Sunset Cove Beach (10)
  [
    { x: 122, y: 62, r: 26, label: 'Cloud' },
    { x: 302, y: 82, r: 20, label: 'Seagulls' },
    { x: 422, y: 202, r: 26, label: 'Boat sail' },
    { x: 82, y: 182, r: 22, label: 'Palm coconuts' },
    { x: 302, y: 302, r: 26, label: 'Umbrella stripe' },
    { x: 442, y: 288, r: 20, label: 'Sandcastle flag' },
    { x: 202, y: 352, r: 22, label: 'Beach ball' },
    { x: 522, y: 362, r: 20, label: 'Starfish' },
    { x: 352, y: 392, r: 24, label: 'Footprints' },
    { x: 92, y: 392, r: 18, label: 'Shell on the sand' },
  ],
];

// Nearest unfound difference to a scene point, within its radius + tolerance.
export function hitTest(level, x, y, found, tolerance) {
  const list = DIFFS[level];
  let best = -1;
  let bestD = Infinity;
  for (let i = 0; i < list.length; i += 1) {
    if (found.has(i)) continue;
    const d = Math.hypot(x - list[i].x, y - list[i].y);
    const reach = list[i].r + tolerance;
    if (d <= reach && d < bestD) {
      best = i;
      bestD = d;
    }
  }
  return best;
}
