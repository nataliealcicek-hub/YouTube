/* scenes.js — the blocks. Copy this to scenes.js and replace the examples.
 *
 * The contract the renderer relies on:
 *   - SCENES is an array of functions (ctx, t, W, H) => void
 *   - t runs from 0 to DUR seconds within each block
 *   - a scene draws the SAME image for the same t every time it is called
 *
 * That last point is what makes this cheap. Do not use Date.now(), Math.random(),
 * or state that carries between frames. Derive every position from t and from
 * rnd(i) (the seeded hash in lib.js). Then a single block can be re-rendered
 * after a note without touching the other eleven.
 */

const DUR = 10;

/* ---------- example: a wide establishing shot ---------- */
function scene1(ctx, t, W, H) {
  bg(ctx, W, H, '#3A1020', '#150610');          // interior, warm and dark

  const z = lerp(0.88, 1.02, easeInOut(t / DUR));   // slow push-in over the block
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(z, z);
  ctx.translate(-W / 2, -H / 2);

  // a subject that breathes rather than sits still
  const beat = .55 + .45 * pulse(t, 1.8, 7);
  glow(ctx, W / 2, H / 2, 320, P.gold, .3 * beat);
  blobPath(ctx, W / 2, H / 2, 180, .06, t * .4, 3, 7);
  ctx.fillStyle = hexA(P.gold, .5 + .3 * beat);
  ctx.fill();

  ctx.restore();

  // labels fade in after the narration has introduced the idea
  label(ctx, W * .16, H * .28, W / 2 - 150, H / 2, 'THE THING', smoothstep(2.4, 3.8, t), P.gold);

  vignette(ctx, W, H, .75);
  grain(ctx, W, H, .1, document);
  seams(ctx, W, H, t, DUR);                      // dark in/out so blocks cut cleanly
}

/* ---------- example: a process with a beginning, middle and end ---------- */
function scene2(ctx, t, W, H) {
  bg(ctx, W, H, '#123038', '#07161C');

  // Stage the beat across the block instead of looping one idea for 10s.
  const arrive = smoothstep(0.4, 3.0, t);
  const act    = smoothstep(3.4, 6.5, t);
  const settle = smoothstep(7.0, 9.5, t);

  const x = lerp(-200, W * .5, arrive);
  glow(ctx, x, H * .5, 220, P.teal, .35);
  ctx.fillStyle = hexA(P.teal, .8);
  ctx.beginPath(); ctx.arc(x, H * .5, 46, 0, TAU); ctx.fill();

  if (act > .01) {
    // something changes because of what arrived
    for (let i = 0; i < 18; i++) {
      const u = ((t * .5 + i / 18) % 1);
      ctx.fillStyle = hexA(P.gold, (1 - u) * act * .8);
      ctx.beginPath();
      ctx.arc(W * .5 + Math.cos(i) * u * 340, H * .5 + Math.sin(i) * u * 340, 7, 0, TAU);
      ctx.fill();
    }
  }
  if (settle > .01) glow(ctx, W * .5, H * .5, 480, P.teal, settle * .25);

  vignette(ctx, W, H, .74);
  grain(ctx, W, H, .1, document);
  seams(ctx, W, H, t, DUR);
}

/* Order here is the order on screen. */
const SCENES = [scene1, scene2];
