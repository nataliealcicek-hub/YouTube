---
name: hybrid-explainer-video
description: Produce a narrated animated explainer video for ~13 credits instead of ~1,100 by rendering the animation locally (deterministic HTML-canvas motion graphics → Chromium frame capture → ffmpeg) and paying only for TTS narration and server-side assembly. Use this skill whenever the user wants an animated explainer, a faceless-channel video, a Kurzgesagt-style science video, a narrated 2-minute video, another episode "like the last one", or any animated video explaining how something works — and especially when they mention that generative video is expensive, ask to keep credits down, or want anatomical, mechanical, statistical or otherwise diagram-accurate visuals that generative video tends to get wrong.
---

# Hybrid explainer video

Generative video is the expensive part of an explainer, and for a lot of subjects it is
also the *wrong* part: it invents plausible-looking organs, mislabels mechanisms, and
redraws the subject differently in every shot. This pipeline replaces it with animation
you author as code, and buys only the two things that are genuinely hard to make locally —
a good narration voice and the final mux.

Roughly: **~1 credit per narration block, everything else free.** A 12-block, 2-minute
episode lands near 13 credits and about five minutes of render time.

## When this is the right tool

Strong fit when the visuals must be *correct*: anatomy, physiology, pharmacology,
engineering, orbital mechanics, data and quantities, anything with named parts and
arrows between them. Also strong when the user wants a consistent channel look across
episodes, since a shared drawing library gives you that for free.

Weak fit when the appeal is photoreal spectacle — landscapes, crowds, faces, texture,
"cinematic" live-action feel. Say so plainly and offer generative video instead. Being
honest here matters more than using this skill.

## The pipeline

1. **Write the block script.** Blocks are fixed windows, so narration length is a
   constraint, not an afterthought.
2. **Write the scenes** as code, using the bundled drawing library.
3. **Preview stills, fix, then render all frames.**
4. **Generate narration** on Higgsfield, one take per block.
5. **Assemble server-side**, which lays each take over its block and can burn captions.

### 1. Block script

Pick a block length (10s works well) and write one narration line per block at
**~26–28 words for a 10s block** (≈155 wpm). This is the single most common thing to get
wrong: assembly pads a short take with silence and speeds up a long one, so wildly
off-length lines make the pacing lurch.

Write the script to a markdown file with a table of block → narration → visual, and
include a claim→evidence table when the subject is technical. That table is what lets the
user check your facts without re-deriving them, and it keeps you honest while writing.

Structure that reliably works for a 12-block, 2-minute piece:

| Blocks | Job |
|---|---|
| 1 | Hook — a concrete claim about the viewer's own body/world, not a question |
| 2–3 | Set up the normal state, then break it (the problem or tension) |
| 4–8 | The mechanism, one step per block, each step caused by the previous |
| 9–11 | The complication or twist — the part a naive explanation misses |
| 12 | The payoff — what it means, ending on a reframe rather than a summary |

### 2. Scenes

Copy `scripts/` into a working directory, then copy `scenes-template.js` to `scenes.js`
and write the blocks. Read `references/visual-language.md` before drawing — it covers the
palette discipline, the cut-paper look, labels, and the staging rules that keep a 10-second
block from feeling like a loop.

The renderer requires only that a scene be a pure function of `t`. Keep it that way: no
`Math.random()`, no `Date.now()`, no state carried between frames. Everything random
should come from `rnd(i)` in `lib.js`, which is a stable hash. The payoff is that any
single block can be re-rendered after a note — `node render.js 7` — without disturbing the
others, which is what makes revision rounds nearly free.

`anatomy.js` has body primitives (figure, stomach, pancreas, brain, brainstem, intestine,
neuron, adipocyte, membrane receptor, peptide ribbon). For a non-anatomical subject, keep
`lib.js` and write your own primitives file in the same spirit — shapes defined in local
coordinates, placed by the scene with `translate`/`scale`, so the same object stays
consistent across blocks.

### 3. Render

```bash
npm install playwright        # the package; the browser can be one already on the machine
pip install imageio-ffmpeg    # only if ffmpeg is not installed
node render.js --preview      # 3 stills per scene
```

**Look at the stills before rendering all frames.** Rendering everything takes minutes;
finding a clipped label or a shape that reads wrong takes seconds. Read the images back
and judge them as images — an organ that you know is a stomach because you wrote the
coordinates may still read as a crescent to a viewer.

```bash
node render.js                # all blocks → clips/block-NN.mp4
```

Then verify durations are exact before spending anything on narration.

### 4. Narration

Use `generate_audio` with `model: "seed_audio"`, a `preset` voice, and one call per block.
Preflight once with `get_cost: true` — it should come back at 1 credit. Reuse the same
`voice_id` across episodes so the channel keeps one narrator.

### 5. Assembly

Use `explainer_video` with the blocks in play order, each `{video, audio}`. Pass
`subtitles: {font: "patrick"}` if captions are wanted. Assembly itself is free.

**The clips have to reach Higgsfield's servers.** Read
`references/delivery-and-egress.md` before this step — in a sandboxed environment the
obvious routes (uploading the files, downloading the narration) are often blocked by
egress policy, and that file documents the workaround that does work.

## Cost and honesty

Report costs from the job preflights, not by differencing the account balance — balances
move for unrelated reasons and will make your numbers look wrong or suspiciously good.

If you deviate from the user's stated spec (adding on-screen labels to a style bible that
says no text, for instance), say so explicitly and offer to revert. Deviations that go
unmentioned are the ones that erode trust.

## Reference files

- `references/visual-language.md` — palette, cut-paper technique, labels, staging a
  10-second block, common ways scenes read wrong. Read before writing scenes.
- `references/delivery-and-egress.md` — getting local clips to Higgsfield, the egress
  failures you will hit in a sandbox, and what actually works. Read before assembly.
- `scripts/lib.js` — palette, grain, vignette, easing, seeded PRNG, blobs, glow,
  cut-paper shadow, labels with safe-area clamping, travelling pulses.
- `scripts/anatomy.js` — human-body primitives.
- `scripts/render.js` — the frame driver. Handles ffmpeg/Chromium discovery.
- `scripts/page.html` — canvas host. Loads lib, anatomy, scenes in that order.
- `scripts/scenes-template.js` — starting point for `scenes.js`.
