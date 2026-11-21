// rng.js — a tiny deterministic random generator (mulberry32).
// Screenshot states pass a fixed seed so a ?shot=…&seed=N render is identical
// every run; gameplay uses a time-based seed.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick `count` distinct indices out of 0..total-1, in order, from a seeded rng.
export function pickIndices(seed, total, count) {
  const rng = mulberry32(seed);
  const pool = Array.from({ length: total }, (_, i) => i);
  const out = [];
  while (out.length < count && pool.length > 0) {
    const i = Math.floor(rng() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out.sort((a, b) => a - b);
}
