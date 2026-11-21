// scenes.js — three original scenes, painted procedurally on canvas.
// Every scene is drawn twice: variant 0 (the original, left panel) and
// variant 1 (the altered copy, right panel). The alterations are exactly the
// planted differences listed in differences.js — same coordinates, same spots.
// All art is drawn in code: no images, no copied art, no network.
//
// paintScene(scene, variant, seed) returns a 600x420 canvas.

import { SCENE_W, SCENE_H } from './config.js';

// ---------- tiny drawing helpers ----------
function circle(c, x, y, r, fill) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { c.fillStyle = fill; c.fill(); }
}
function ellipse(c, x, y, rx, ry, fill) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) { c.fillStyle = fill; c.fill(); }
}
function rr(c, x, y, w, h, r, fill) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); }
}
function poly(c, pts, fill) {
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i += 1) c.lineTo(pts[i][0], pts[i][1]);
  c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); }
}
function line(c, x1, y1, x2, y2, color, w) {
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.strokeStyle = color;
  c.lineWidth = w || 2;
  c.stroke();
}
function text(c, s, x, y, font, color, align) {
  c.font = font;
  c.fillStyle = color;
  c.textAlign = align || 'left';
  c.textBaseline = 'middle';
  c.fillText(s, x, y);
}
function grad(c, x0, y0, x1, y1, stops) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  for (const [o, col] of stops) g.addColorStop(o, col);
  return g;
}

// A sitting cat, drawn from shapes. `pose` shifts the tail curl.
function drawCat(c, x, y, s, color, pose) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  // tail
  c.beginPath();
  c.moveTo(14, 8);
  c.quadraticCurveTo(28, 6, 26, -8 + (pose ? 3 : 0));
  c.quadraticCurveTo(25, -14, 20, -12);
  c.lineWidth = 5;
  c.strokeStyle = color;
  c.stroke();
  // body
  ellipse(c, 0, 0, 15, 13, color);
  // head
  circle(c, -2, -16, 10, color);
  // ears
  poly(c, [[-10, -22], [-12, -30], [-5, -25]], color);
  poly(c, [[4, -24], [7, -31], [10, -23]], color);
  // eyes (closed, content)
  line(c, -6, -16, -3, -16, '#3a2a1a', 1.5);
  line(c, 1, -16, 4, -16, '#3a2a1a', 1.5);
  // whiskers
  line(c, -10, -13, -18, -15, '#fff8', 1);
  line(c, -10, -11, -18, -10, '#fff8', 1);
  c.restore();
}

// ---------- Scene 0: The Corner Café ----------
function drawCafe(c, v, rng) {
  // wall + floor
  c.fillStyle = grad(c, 0, 0, 0, 340, [[0, '#fbeed3'], [1, '#f3d9a8']]);
  c.fillRect(0, 0, 600, 340);
  c.fillStyle = '#c98d4e';
  c.fillRect(0, 340, 600, 80);
  for (let i = 0; i < 6; i += 1) line(c, 0, 352 + i * 12, 600, 352 + i * 12, '#a9763c', 1.5);
  for (let i = 0; i < 9; i += 1) line(c, 40 + i * 68, 340, 40 + i * 68, 420, '#a9763c', 1);
  // rug
  ellipse(c, 300, 392, 170, 20, '#c65b4e');
  ellipse(c, 300, 392, 130, 14, '#e8a34c');

  // window with morning sky
  c.fillStyle = '#fff';
  c.fillRect(36, 36, 228, 178);
  c.fillStyle = grad(c, 0, 44, 0, 206, [[0, '#9fd4f0'], [1, '#e8f6ff']]);
  c.fillRect(44, 44, 212, 162);
  circle(c, 222, 78, 20, '#ffd94d'); // sun
  ellipse(c, 90, 80, 30, 12, '#ffffff');
  ellipse(c, 120, 92, 24, 10, '#ffffff');
  ellipse(c, 180, 130, 28, 11, '#ffffff');
  // rooftops outside
  poly(c, [[44, 206], [44, 168], [90, 168], [110, 150], [150, 150], [150, 206]], '#7d9bb5');
  poly(c, [[150, 206], [150, 176], [200, 176], [220, 158], [256, 158], [256, 206]], '#6b8aa8');
  line(c, 150, 44, 150, 206, '#fff', 6);
  line(c, 44, 122, 256, 122, '#fff', 6);
  // windowsill
  c.fillStyle = '#a9763c';
  c.fillRect(30, 214, 240, 12);
  // DIFFERENCE 1: the cat on the windowsill
  if (v === 0) drawCat(c, 150, 196, 1.15, '#e88f3a', 0);

  // pendant lamps
  for (const lx of [120, 480]) {
    line(c, lx, 0, lx, 52, '#5a4632', 3);
    poly(c, [[lx - 22, 52], [lx + 22, 52], [lx + 12, 76], [lx - 12, 76]], '#3f6b4f');
    circle(c, lx, 80, 7, '#ffe9a8');
    ellipse(c, lx, 88, 26, 6, '#ffe9a855');
  }

  // clock — DIFFERENCE 2: hands at 9:00 vs 10:30
  circle(c, 302, 72, 27, '#fffdf5');
  c.lineWidth = 4; c.strokeStyle = '#5a4632';
  c.beginPath(); c.arc(302, 72, 27, 0, Math.PI * 2); c.stroke();
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    line(c, 302 + Math.cos(a) * 22, 72 + Math.sin(a) * 22, 302 + Math.cos(a) * 25, 72 + Math.sin(a) * 25, '#5a4632', 2);
  }
  if (v === 0) {
    line(c, 302, 72, 302 - 14, 72, '#333', 3.5); // hour -> 9
    line(c, 302, 72, 302, 72 - 20, '#333', 2.5); // minute -> 12
  } else {
    line(c, 302, 72, 302 - 10, 72 - 11, '#333', 3.5); // hour -> 10:30
    line(c, 302, 72, 302, 72 + 20, '#333', 2.5); // minute -> 6
  }
  circle(c, 302, 72, 3, '#c65b4e');

  // framed picture
  c.fillStyle = '#8a5a2e'; c.fillRect(318, 120, 52, 42);
  c.fillStyle = '#bfe3c0'; c.fillRect(323, 125, 42, 32);
  poly(c, [[323, 157], [340, 138], [352, 157]], '#5d8a5a');
  circle(c, 352, 132, 5, '#ffd94d');

  // chalkboard menu
  c.fillStyle = '#8a5a2e'; c.fillRect(376, 56, 188, 128);
  c.fillStyle = '#2f4f3e'; c.fillRect(382, 62, 176, 116);
  text(c, 'MENU', 470, 80, 'bold 17px Georgia, serif', '#fdf6d8', 'center');
  line(c, 410, 92, 530, 92, '#fdf6d855', 1);
  text(c, 'COFFEE', 402, 112, '15px Georgia, serif', '#fdf6d8');
  text(c, 'TEA', 402, 134, '15px Georgia, serif', '#fdf6d8');
  // DIFFERENCE 5: the third menu word
  text(c, v === 0 ? 'CAKE' : 'PIE', 402, 156, '15px Georgia, serif', '#fdf6d8');
  text(c, '★', 540, 80, '16px Georgia, serif', '#ffd94d', 'center');
  text(c, '★', 400, 80, '16px Georgia, serif', '#ffd94d', 'center');

  // counter
  c.fillStyle = '#b07a3e'; c.fillRect(340, 250, 240, 16);
  c.fillStyle = '#8a5a2e'; c.fillRect(340, 266, 240, 154);
  for (let i = 0; i < 4; i += 1) {
    c.fillStyle = '#7a4e26'; c.fillRect(352 + i * 58, 280, 46, 128);
  }
  // espresso machine
  c.fillStyle = '#3a3a3a'; rr(c, 356, 196, 74, 54, 6, '#3a3a3a');
  c.fillStyle = '#d8d8d8'; c.fillRect(368, 206, 50, 10);
  circle(c, 393, 240, 5, '#e8a34c');
  // cake dome, sitting on the counter top — DIFFERENCE 4: the pastry inside
  ellipse(c, 470, 250, 34, 8, '#e8e0d0');
  if (v === 0) {
    ellipse(c, 470, 240, 13, 12, '#f2a0b5');
    circle(c, 470, 226, 4, '#c65b4e');
  }
  c.beginPath();
  c.arc(470, 250, 30, Math.PI, 0);
  c.closePath();
  c.fillStyle = '#ffffff33';
  c.fill();
  c.lineWidth = 2; c.strokeStyle = '#ffffff88'; c.stroke();
  // jars on the counter
  rr(c, 524, 218, 26, 32, 4, '#cfe8d8');
  rr(c, 556, 222, 22, 28, 4, '#f2d8a0');

  // round table, left foreground
  c.fillStyle = '#6b4423'; c.fillRect(146, 360, 10, 58);
  ellipse(c, 150, 416, 34, 7, '#6b4423');
  ellipse(c, 150, 348, 110, 22, '#a9763c');
  ellipse(c, 150, 345, 110, 22, '#c08a4e');
  // vase with flower on the table
  poly(c, [[96, 330], [104, 330], [102, 312], [98, 312]], '#7fb3d5');
  circle(c, 100, 304, 7, '#e88fb0');
  circle(c, 100, 304, 3, '#ffd94d');
  line(c, 100, 312, 100, 322, '#3f6b4f', 2);
  // DIFFERENCE 3: the cup is red on the left, teal on the right
  ellipse(c, 152, 344, 20, 5, '#e8e0d0');
  rr(c, 138, 312, 28, 26, 5, v === 0 ? '#c65b4e' : '#2e8b8b');
  c.beginPath(); c.arc(168, 325, 8, -Math.PI / 2, Math.PI / 2); c.strokeStyle = v === 0 ? '#c65b4e' : '#2e8b8b'; c.lineWidth = 4; c.stroke();
  // steam
  c.beginPath();
  c.moveTo(146, 308); c.quadraticCurveTo(142, 298, 148, 290);
  c.moveTo(158, 308); c.quadraticCurveTo(162, 298, 156, 290);
  c.strokeStyle = '#ffffff99'; c.lineWidth = 2; c.stroke();
  // DIFFERENCE 7: the spoon beside the cup
  if (v === 0) {
    line(c, 200, 352, 224, 336, '#d8d8d8', 3);
    ellipse(c, 226, 335, 6, 4, '#d8d8d8');
  }

  // potted plant, bottom right — DIFFERENCE 6: five leaves vs four
  poly(c, [[528, 384], [568, 384], [562, 412], [534, 412]], '#c65b4e');
  const leafAngles = v === 0 ? [-70, -35, 0, 35, 70] : [-70, -35, 35, 70];
  for (const a of leafAngles) {
    const rad = (a * Math.PI) / 180;
    const lx = 548 + Math.sin(rad) * 20;
    const ly = 384 - Math.cos(rad) * 26;
    ellipse(c, lx, ly, 7, 16, '#3f8a4f');
  }
  // scattered crumbs / beans for texture (seeded)
  for (let i = 0; i < 8; i += 1) {
    circle(c, 40 + rng() * 520, 360 + rng() * 46, 2, '#8a5a2e66');
  }
}

// ---------- Scene 1: Lantern Night Market ----------
function drawMarket(c, v, rng) {
  // night sky + stars
  c.fillStyle = grad(c, 0, 0, 0, 280, [[0, '#0d1b3e'], [1, '#27407a']]);
  c.fillRect(0, 0, 600, 280);
  for (let i = 0; i < 46; i += 1) {
    const sx = rng() * 600;
    const sy = rng() * 220;
    circle(c, sx, sy, rng() * 1.6 + 0.6, '#ffffff' + (rng() > 0.5 ? 'cc' : '66'));
  }
  // DIFFERENCE 1: crescent moon vs full moon
  circle(c, 520, 62, 24, '#ffeec2');
  if (v === 0) circle(c, 530, 56, 20, '#27407a');
  // distant rooftops
  c.fillStyle = '#101c38';
  poly(c, [[0, 280], [0, 232], [70, 232], [90, 214], [140, 214], [140, 280]], '#101c38');
  poly(c, [[180, 280], [180, 240], [260, 240], [280, 220], [340, 220], [340, 280]], '#101c38');
  poly(c, [[420, 280], [420, 238], [500, 238], [520, 222], [600, 222], [600, 280]], '#101c38');
  for (let i = 0; i < 10; i += 1) {
    c.fillStyle = '#ffd94d99';
    c.fillRect(20 + rng() * 560, 236 + rng() * 30, 6, 8);
  }
  // cobblestone ground
  c.fillStyle = '#3d3428';
  c.fillRect(0, 280, 600, 140);
  c.strokeStyle = '#2e261c';
  c.lineWidth = 2;
  for (let y = 296; y < 420; y += 22) {
    c.beginPath(); c.moveTo(0, y); c.lineTo(600, y); c.stroke();
  }
  for (let i = 0; i < 12; i += 1) line(c, 30 + i * 50, 280, 22 + i * 50, 420, '#2e261c', 2);

  // string lights (two swags)
  for (const [y0, sag] of [[58, 26], [96, 22]]) {
    c.beginPath();
    c.moveTo(0, y0);
    c.quadraticCurveTo(300, y0 + sag * 2, 600, y0);
    c.strokeStyle = '#0a0a0a';
    c.lineWidth = 2;
    c.stroke();
    for (let i = 0; i < 13; i += 1) {
      const t = i / 12;
      const bx = t * 600;
      const by = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (y0 + sag * 2) + t * t * y0;
      // DIFFERENCE 2: the bulb near x=200 on the top string is out on the right
      const dark = v === 1 && y0 === 58 && i === 4;
      circle(c, bx, by + 7, 5, dark ? '#555' : '#ffd94d');
      if (!dark) {
        circle(c, bx, by + 7, 10, '#ffd94d33');
      }
      line(c, bx, by, bx, by + 3, '#0a0a0a', 1.5);
    }
  }

  function awning(x, y, w, c1, c2) {
    for (let i = 0; i < 6; i += 1) {
      poly(c, [[x + (i * w) / 6, y], [x + ((i + 1) * w) / 6, y], [x + ((i + 1) * w) / 6, y + 26], [x + (i * w) / 6, y + 26]], i % 2 ? c1 : c2);
    }
    c.fillStyle = '#5a4632';
    c.fillRect(x - 4, y + 26, w + 8, 6);
  }
  function stallCounter(x, y, w) {
    c.fillStyle = '#8a5a2e'; c.fillRect(x, y, w, 66);
    c.fillStyle = '#6b4423';
    for (let i = 0; i < 3; i += 1) c.fillRect(x + 8 + i * ((w - 16) / 3), y + 8, (w - 16) / 3 - 6, 50);
  }

  // left stall — fruit
  awning(40, 196, 170, '#c65b4e', '#f7ead0');
  stallCounter(40, 306, 170);
  ellipse(c, 122, 306, 40, 12, '#6b4423'); // apple basket
  const appleSpots = [[104, 296], [122, 290], [140, 296], [112, 302], [132, 302]];
  appleSpots.forEach(([ax, ay], i) => {
    // DIFFERENCE 4: the top apple is missing on the right
    if (v === 1 && i === 1) return;
    circle(c, ax, ay, 9, '#d43d2a');
    line(c, ax, ay - 9, ax + 3, ay - 13, '#3f6b4f', 2);
  });
  ellipse(c, 182, 306, 26, 10, '#6b4423'); // orange basket
  circle(c, 172, 298, 8, '#f28c1e');
  circle(c, 188, 296, 8, '#f28c1e');
  circle(c, 180, 304, 8, '#f28c1e');

  // middle stall — lanterns + vendor
  awning(240, 196, 170, '#2e6b8a', '#f7ead0');
  stallCounter(240, 306, 170);
  // hanging lanterns
  for (const [lx, col] of [[272, '#e8a34c'], [330, '#d43d2a'], [380, '#e8a34c']]) {
    // DIFFERENCE 3: the red lantern is gone on the right
    if (v === 1 && lx === 330) continue;
    line(c, lx, 132, lx, 140, '#0a0a0a', 2);
    ellipse(c, lx, 156, 15, 18, col);
    line(c, lx - 15, 156, lx + 15, 156, '#8a2a1a', 2);
    circle(c, lx, 156, 16, col + '44');
  }
  // vendor — DIFFERENCE 6: hat stripe red vs green
  circle(c, 300, 252, 20, '#e8b48a'); // face
  poly(c, [[278, 246], [322, 246], [312, 222], [288, 222]], '#f7ead0'); // hat
  line(c, 282, 238, 318, 238, v === 0 ? '#d43d2a' : '#3f8a4f', 6);
  circle(c, 292, 250, 2.5, '#222');
  circle(c, 308, 250, 2.5, '#222');
  c.beginPath(); c.arc(300, 258, 6, 0.15 * Math.PI, 0.85 * Math.PI); c.strokeStyle = '#7a4e26'; c.lineWidth = 2; c.stroke();
  rr(c, 276, 272, 48, 34, 8, '#2e6b8a'); // shoulders/apron
  // stall name painted on the counter front
  text(c, 'NIGHT MARKET', 325, 340, 'bold 15px Georgia, serif', '#f7ead0', 'center');
  // jars on the middle counter
  rr(c, 356, 282, 20, 24, 3, '#cfe8d8');
  rr(c, 380, 284, 16, 22, 3, '#f2d8a0');

  // right stall — balloons
  awning(430, 196, 150, '#7b4ba6', '#f7ead0');
  stallCounter(430, 306, 150);
  const balloons = [[462, 170, '#e85d75'], [484, 158, '#4d9de0'], [506, 172, '#ffd94d']];
  if (v === 1) balloons.push([526, 158, '#7bd389']); // DIFFERENCE 5: an extra balloon
  for (const [bx, by, col] of balloons) {
    line(c, bx, by + 14, 486, 306, '#ffffff88', 1);
    ellipse(c, bx, by, 13, 16, col);
    poly(c, [[bx - 4, by + 15], [bx + 4, by + 15], [bx, by + 20]], col);
  }
  // toy shelf on the right counter
  circle(c, 452, 292, 9, '#e85d75');
  rr(c, 470, 284, 18, 16, 3, '#4d9de0');
  poly(c, [[506, 300], [514, 282], [522, 300]], '#7bd389');

  // crate with a sleeping cat — DIFFERENCE 7
  c.fillStyle = '#8a5a2e'; c.fillRect(56, 352, 74, 40);
  line(c, 56, 372, 130, 372, '#6b4423', 3);
  line(c, 93, 352, 93, 392, '#6b4423', 3);
  if (v === 0) {
    ellipse(c, 93, 348, 22, 9, '#e88f3a');
    circle(c, 112, 344, 8, '#e88f3a');
    poly(c, [[106, 338], [108, 331], [112, 338]], '#e88f3a');
  }
  // DIFFERENCE 8: paper lantern on the ground, right side
  if (v === 0) {
    ellipse(c, 542, 372, 16, 19, '#ffb347');
    circle(c, 542, 372, 20, '#ffb34744');
    line(c, 526, 372, 558, 372, '#8a2a1a', 2);
  }
  // scattered coins / petals
  for (let i = 0; i < 10; i += 1) {
    circle(c, 220 + rng() * 360, 330 + rng() * 70, 2, '#ffd94d88');
  }
}

// ---------- Scene 2: Sunset Cove Beach ----------
function drawBeach(c, v, rng) {
  // sunset sky
  c.fillStyle = grad(c, 0, 0, 0, 210, [[0, '#ff9a3d'], [0.55, '#ff6b8a'], [1, '#7b4ba6']]);
  c.fillRect(0, 0, 600, 210);
  // sun with glow
  circle(c, 470, 92, 46, '#ffdf6b33');
  circle(c, 470, 92, 34, '#ffdf6b');
  // DIFFERENCE 1: the cloud at top-left is gone on the right
  if (v === 0) {
    ellipse(c, 122, 62, 42, 14, '#fff2f2ee');
    ellipse(c, 150, 54, 30, 12, '#fff2f2ee');
    ellipse(c, 96, 54, 26, 11, '#fff2f2ee');
  }
  ellipse(c, 330, 48, 36, 12, '#fff2f2cc');
  ellipse(c, 356, 40, 24, 10, '#fff2f2cc');
  // seagulls — DIFFERENCE 2: three birds vs two (middle one missing)
  const birds = [[260, 76], [302, 82], [346, 70]];
  birds.forEach(([bx, by], i) => {
    if (v === 1 && i === 1) return;
    c.beginPath();
    c.moveTo(bx - 10, by);
    c.quadraticCurveTo(bx - 3, by - 7, bx, by);
    c.quadraticCurveTo(bx + 3, by - 7, bx + 10, by);
    c.strokeStyle = '#4a2c4a';
    c.lineWidth = 2.5;
    c.stroke();
  });
  // distant island
  poly(c, [[40, 210], [90, 178], [150, 210]], '#5a3a6e');
  poly(c, [[520, 210], [560, 186], [600, 210]], '#5a3a6e');

  // sea
  c.fillStyle = grad(c, 0, 210, 0, 292, [[0, '#e86a92'], [1, '#2e6b8a']]);
  c.fillRect(0, 210, 600, 82);
  for (let i = 0; i < 5; i += 1) {
    c.beginPath();
    for (let x = 0; x <= 600; x += 20) {
      const y = 226 + i * 14 + Math.sin((x + i * 40) / 46) * 3;
      if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.strokeStyle = '#ffffff55';
    c.lineWidth = 2;
    c.stroke();
  }
  // boat — DIFFERENCE 3: white sail vs coral sail
  poly(c, [[392, 232], [452, 232], [442, 246], [402, 246]], '#6b4423');
  line(c, 422, 232, 422, 178, '#5a4632', 3);
  poly(c, [[422, 180], [422, 226], [452, 226]], v === 0 ? '#fffdf5' : '#ff7f6b');
  poly(c, [[418, 184], [418, 226], [394, 226]], v === 0 ? '#fdf6d8' : '#ff9d8a');

  // sand
  c.fillStyle = grad(c, 0, 292, 0, 420, [[0, '#f2d8a0'], [1, '#e0b96f']]);
  c.fillRect(0, 292, 600, 128);
  for (let i = 0; i < 40; i += 1) {
    circle(c, rng() * 600, 296 + rng() * 118, 1.5, '#c9a35a88');
  }

  // palm tree, left — DIFFERENCE 4: three coconuts vs two
  c.beginPath();
  c.moveTo(58, 330);
  c.quadraticCurveTo(66, 250, 92, 190);
  c.lineWidth = 12;
  c.strokeStyle = '#7a4e26';
  c.stroke();
  for (let i = 0; i < 6; i += 1) {
    const a = (-30 - i * 26) * (Math.PI / 180);
    c.beginPath();
    c.moveTo(92, 190);
    c.quadraticCurveTo(92 + Math.cos(a) * 40, 190 + Math.sin(a) * 30 - 14, 92 + Math.cos(a) * 62, 190 + Math.sin(a) * 44 + 8);
    c.strokeStyle = '#3f8a4f';
    c.lineWidth = 6;
    c.stroke();
  }
  const nuts = [[74, 186], [88, 192], [96, 180]];
  nuts.forEach(([nx, ny], i) => {
    if (v === 1 && i === 2) return;
    circle(c, nx, ny, 7, '#6b4423');
  });

  // beach umbrella — DIFFERENCE 5: red stripes vs blue stripes
  line(c, 302, 306, 302, 372, '#8a5a2e', 5);
  for (let i = 0; i < 6; i += 1) {
    const a0 = Math.PI + (i * Math.PI) / 6;
    const a1 = Math.PI + ((i + 1) * Math.PI) / 6;
    c.beginPath();
    c.moveTo(302, 306);
    c.arc(302, 306, 62, a0, a1);
    c.closePath();
    c.fillStyle = i % 2 === 0 ? (v === 0 ? '#d43d2a' : '#2e6b8a') : '#fffdf5';
    c.fill();
  }
  circle(c, 302, 306, 4, '#8a5a2e');

  // sandcastle — DIFFERENCE 6: the flag on top
  c.fillStyle = '#e8c98a';
  rr(c, 402, 330, 62, 34, 4, '#e8c98a');
  rr(c, 408, 312, 16, 20, 3, '#e8c98a');
  rr(c, 442, 312, 16, 20, 3, '#e8c98a');
  poly(c, [[404, 312], [424, 296], [444, 312]], '#e8c98a');
  if (v === 0) {
    line(c, 432, 300, 432, 282, '#5a4632', 2);
    poly(c, [[432, 282], [452, 287], [432, 292]], '#d43d2a');
  }
  // bucket and spade
  poly(c, [[368, 352], [388, 352], [384, 372], [372, 372]], '#4d9de0');
  line(c, 392, 352, 404, 336, '#f2d8a0', 3);

  // beach ball — DIFFERENCE 7: red panels vs blue panels
  circle(c, 202, 352, 22, '#fffdf5');
  c.beginPath(); c.arc(202, 352, 22, -0.4, 1.1); c.lineTo(202, 352); c.closePath();
  c.fillStyle = v === 0 ? '#d43d2a' : '#2e6b8a'; c.fill();
  c.beginPath(); c.arc(202, 352, 22, 1.9, 3.0); c.lineTo(202, 352); c.closePath();
  c.fillStyle = v === 0 ? '#d43d2a' : '#2e6b8a'; c.fill();
  circle(c, 202, 352, 5, '#ffd94d');
  c.lineWidth = 2; c.strokeStyle = '#00000022';
  c.beginPath(); c.arc(202, 352, 22, 0, Math.PI * 2); c.stroke();

  // DIFFERENCE 8: starfish on the sand
  if (v === 0) {
    c.save();
    c.translate(522, 362);
    c.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? 14 : 6;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath();
    c.fillStyle = '#ff8c42';
    c.fill();
    c.restore();
  }
  // DIFFERENCE 9: footprints in the sand
  if (v === 0) {
    for (let i = 0; i < 5; i += 1) {
      ellipse(c, 330 + i * 12, 384 + (i % 2 ? -4 : 4), 5, 8, '#c9a35a');
    }
  }
  // DIFFERENCE 10: a shell on the sand
  if (v === 0) {
    c.beginPath();
    c.arc(92, 392, 10, Math.PI, 0);
    c.closePath();
    c.fillStyle = '#f2a0b5';
    c.fill();
    for (let i = 0; i < 4; i += 1) line(c, 84 + i * 5, 392, 86 + i * 5, 382, '#d47a90', 1.5);
  }
  // towel
  rr(c, 500, 396, 70, 14, 4, '#7bd389');
  line(c, 512, 396, 512, 410, '#fffdf5', 3);
  line(c, 532, 396, 532, 410, '#fffdf5', 3);
}

// ---------- public entry ----------
const PAINTERS = [drawCafe, drawMarket, drawBeach];

export function paintScene(scene, variant, seed) {
  const canvas = document.createElement('canvas');
  canvas.width = SCENE_W;
  canvas.height = SCENE_H;
  const ctx = canvas.getContext('2d');
  // Seeded scatter (stars, sand grains) so ?seed=N renders identically.
  let s = (seed >>> 0) || 1;
  const rng = () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  PAINTERS[scene](ctx, variant, rng);
  return canvas;
}
