# spot-the-difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/arbbagiyo/spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/arbbagiyo/spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Spot the Difference — Curious Corners.** Two near-identical pictures, side by side.
Find every hidden difference before the clock runs out. Three original scenes,
25 planted differences, hints, a timer, and a score to chase.

## How to play

- Click a difference on either picture to circle it — green ring, +100 points.
- Wrong clicks cost 5 seconds. Watch the clock: 3:00, 2:30, then 2:00 per level.
- `H` spends a hint (3 per level, 10s cooldown, −25 points): a golden ring pulses
  on one difference you haven't found yet.
- `P` pauses, `R` restarts the level, `M` mutes the sounds. All sounds are
  synthesized with WebAudio — no audio files.
- Clear a level to bank a time bonus (+5 points per second left). Clear all three
  to win; your best score is kept in the browser.

## The scenes

| Level | Scene | Differences | Time |
| --- | --- | --- | --- |
| 1 | The Corner Café — morning light, a cat on the sill, a chalkboard menu | 7 | 3:00 |
| 2 | Lantern Night Market — string lights, stalls, a sleeping cat | 8 | 2:30 |
| 3 | Sunset Cove Beach — umbrella, sandcastle, boat on a pink sea | 10 | 2:00 |

Every scene is drawn in code (canvas 2D) for this game — no photos, no borrowed
art, no network requests. The two panels are painted by the same painter with a
variant flag, so each difference is a real change in the picture, hidden by design.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no
dependencies: `game/` is plain static files.

Screenshot states (deterministic, for the entry's screenshots):

```sh
http://localhost:8080/?shot=start&seed=1    # title screen
http://localhost:8080/?shot=play&seed=1     # café, 3 of 7 found
http://localhost:8080/?shot=market&seed=1   # night market, 3 of 8 found
http://localhost:8080/?shot=end&seed=1      # beach, all 10 found
```

## Files

- `game/index.html` — the page; one canvas, one module script.
- `game/src/config.js` — canvas, panels, levels, scoring.
- `game/src/scenes.js` — the three scene painters (all the art).
- `game/src/differences.js` — where every planted difference lives.
- `game/src/state.js` — screens, levels, timer, hints, scoring.
- `game/src/input.js` — mouse, touch and keyboard.
- `game/src/render.js` — header, panels, markers, HUD, overlays.
- `game/src/audio.js` — synthesized sounds (WebAudio).
- `game/src/rng.js` — deterministic random for seeded renders.
- `game/src/main.js` — bootstrap and game loop.
- `main.ts` — hands `game/` and `screenshots/` in with a dossier (make.fun kit).
- `screenshots/` — 4 screenshots of the game itself (the first is the cover).

---

<sub>Entered on [make.fun](https://make.fun/?ref=zaqk8shq&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
