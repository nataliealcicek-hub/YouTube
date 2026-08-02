# scroll-demo

A worked example of the `canvas-scroll-scrub` skill (`.claude/skills/canvas-scroll-scrub/`).

The page is a scroll-scrubbed canvas frame sequence: a short clip is exported to
numbered JPGs, preloaded, and the frame painted to `<canvas>` is picked by scroll
progress.

## Rebuilding the frames

`frames/` and the source clip are gitignored — regenerate them:

```bash
# any continuous-motion clip, no hard cuts
bash ../.claude/skills/canvas-scroll-scrub/scripts/extract-frames.sh  <clip.mp4> frames/hero 180
bash ../.claude/skills/canvas-scroll-scrub/scripts/compress-frames.sh frames/hero 1600 88
```

Then set `frameCount` in the `SCRUB_SECTIONS` block at the bottom of `index.html`
to the count the extract script reports.

## Running

```bash
python3 -m http.server 8090
```

`Launch Demo.command` does the same via double-click on macOS.

## Status

Verified against a synthetic test clip (180 frames): the canvas advances across
scroll positions and the overlay copy fades on its `data-in` / `data-out`
windows. The intended hero footage — an AURELIA serum bottle rendered with
Higgsfield — is not included, because the CDN it is served from is blocked by
this environment's egress policy. Drop any continuous-motion clip in and rerun
the two scripts above.
