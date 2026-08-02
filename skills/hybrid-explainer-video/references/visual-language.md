# Visual language

The goal is flat, illustrated motion graphics that look authored rather than generated —
the register of a good science channel. Everything here is a means to that end; deviate
when the subject calls for it.

## Palette discipline

Pick three roles and hold them for the whole episode:

- **Environment** — a deep, desaturated ground (interior crimson, ink blue, near-black).
- **Subject** — one saturated accent that means "the thing we are following". Reserve it.
  If teal is the drug, nothing else is teal.
- **Activity** — a warm accent for energy, signalling, quantity (gold works well).

Add a fourth only for an antagonist or failure state — acid yellow for a competing drive,
sick green for nausea. `lib.js` ships this as `P`.

The reason to be strict: with a consistent code, a viewer learns your visual grammar in
the first twenty seconds and can then read later blocks without labels. Break the code and
every block has to re-explain itself.

## The cut-paper look

Three cheap techniques do most of the work:

- **`paper(ctx, pathFn, fill, alpha, dx, dy)`** draws the shape twice — a dark offset copy
  underneath, then the fill. That offset shadow is what makes shapes read as layered paper
  rather than flat vector.
- **`grain(ctx, W, H, .1, document)`** overlays fixed noise in `overlay` blend mode. Subtle
  is the point; at 0.1 it reads as paper tooth, at 0.3 it reads as video noise.
- **`vignette(ctx, W, H, .75)`** pulls the eye to centre and hides the fact that flat
  backgrounds are empty.

Apply grain and vignette last, in that order, in every scene.

## Organic shapes

`blobPath(ctx, cx, cy, r, wobble, t, seed, lobes)` sums a few sine harmonics around a
circle. **Wobble is the dial that decides whether something reads as a cell or a star.**
Around `.05–.08` gives a soft living blob. Past `~.15` the lobes turn into spikes — if
your food particles look like asterisks, this is why.

Animate cells by passing `t` so they breathe. Keep the amplitude small; the eye reads
gentle continuous deformation as *alive* and large deformation as *wobbling jelly*.

## Labels

`label(ctx, tx, ty, ax, ay, text, alpha, color, size)` draws a leader line from an anchor
to a text block and clamps the text into a safe area, flipping sides if it would clip. Use
the clamping rather than hand-tuning positions — as scenes get rearranged, hand-tuned
label coordinates are the first thing to break, and clipped text is the most common defect
in a first render.

Fade labels in **after** the narration has introduced the term
(`smoothstep(2.4, 3.8, t)`), never at `t=0`. A label that appears before it is spoken
pulls the eye away from the animation and answers a question the viewer has not asked yet.

Two or three labels per block is plenty.

## Staging a 10-second block

The most common weakness is a block that establishes one image and then loops for ten
seconds. Give each block an internal arc using overlapping `smoothstep` windows:

```js
const arrive = smoothstep(0.4, 3.0, t);
const act    = smoothstep(3.4, 6.5, t);
const settle = smoothstep(7.0, 9.5, t);
```

Then drive position, opacity and scale from those. The viewer should be able to tell early
from late in a block from a still frame alone — that is a good test to apply to your
preview stills.

Slow continuous camera moves — `lerp(0.88, 1.02, easeInOut(t / DUR))` on scale — add life
almost for free. Keep them under about 15% or they read as a zoom effect rather than
presence.

Call `seams(ctx, W, H, t, DUR)` last so each block dips from and to black at its edges and
cuts cleanly against its neighbours.

## Reading your own stills honestly

When you check preview frames, judge them as a viewer who has not read the code:

- Does the organ read as that organ, or only as a shape you know the coordinates of?
- Is any text clipped at frame edges?
- Is the frame's centre of interest actually near the centre, or is one side dead?
- Can you tell this is second 8 rather than second 2?

An anatomical shape that reads wrong is usually a silhouette problem, not a detail
problem. Fix the outline before adding interior detail — a stomach whose inner curve dips
too far reads as a crescent no matter how good the rugae are.
