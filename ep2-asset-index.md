# Episode 2 Asset Index — "The Hormone That Talks Your Brain Out of Hunger"

**Subject:** what GLP-1 / GIP dual agonists (tirzepatide — Zepbound) do to the body to control hunger and drive weight loss.
**Runtime:** 2:00 exact · 1920×1080 · 30 fps · voice "Cillian" (same as Episode 1)

## Final deliverable
| Asset | Job / path |
|---|---|
| **Final video (2:00, 1080p, narrated + captions)** | `1506fa2c-222a-4c2a-9c56-4a585f665ab1` → `.../hf_20260802_021619_1506fa2c-222a-4c2a-9c56-4a585f665ab1.mp4` |
| Silent master (local) | `output/ep2-glp1-gip-silent.mp4` |
| Per-block clips (local) | `animation/ep2/clips/block-01…12.mp4` |

CDN base: `https://d8j0ntlcm91z4.cloudfront.net/user_3EMGm7xzkClXL1IjHLUtSDY9muk/`
(reachable from a browser; blocked from this container's egress — see note below.)

## How this episode was made differently from Episode 1
Episode 1 used Seedance 2.0 generative clips (~1,095 credits). This episode is a **hybrid**:

| Stage | Where | Cost |
|---|---|---|
| Animation (12 × 10s, 1080p) | local — deterministic canvas renderer driven frame-by-frame in Chromium, piped to ffmpeg | 0 |
| Narration (12 takes) | Higgsfield `seed_audio`, voice Cillian | 12 credits |
| Captions | Higgsfield (Whisper transcription, burned in) | ~0.6 credits |
| Final mux | Higgsfield `explainer_video` | free |
| **Total** | | **~13 credits** |

The animation is hand-authored vector motion graphics rather than generative video because the
subject is anatomical and pharmacological: the arcuate nucleus, the pancreatic β/α cells and the
vagal afferents have to be in the right place and stay there across all twelve blocks.

## Egress constraint encountered
This container's egress policy returns 403 on CONNECT for `d8j0ntlcm91z4.cloudfront.net`,
`upload.higgsfield.ai` and `speech.platform.bing.com`. Consequences:
- the generated narration could not be downloaded for a local mux;
- the local clips could not be uploaded to Higgsfield directly.

Resolved by serving the clips to Higgsfield's *servers* from this public repo through jsDelivr
(`https://cdn.jsdelivr.net/gh/nataliealcicek-hub/YouTube@<sha>/animation/ep2/clips/block-NN.mp4`),
then assembling server-side. `raw.githubusercontent.com` does not work for this — it serves
`application/octet-stream`, which the importer rejects.

## Source clips → imported media IDs
| # | Local file | Higgsfield media_id | Narration job |
|---|---|---|---|
| 1 | `block-01.mp4` | `dffe67f6-ad84-4ba1-82ed-45a841ab0472` | `991bfb72-f720-4aff-aefd-d3eba8bed0f3` |
| 2 | `block-02.mp4` | `20dcaab5-e0a6-407c-aa62-37ac34f1e05b` | `2eaa03d8-4b9f-44a1-930e-fd1a4a4d1626` |
| 3 | `block-03.mp4` | `81632f74-d100-4edc-9026-fa29f0275ca2` | `58722625-e839-4cf6-949d-80f3524c5310` |
| 4 | `block-04.mp4` | `f643f9d3-6ee8-4496-bf8a-279b736d6a8c` | `293b9c75-aace-48ee-bee0-9f8fdea03261` |
| 5 | `block-05.mp4` | `58407c7a-c764-400c-86c0-744fcc7b0d04` | `5295ed68-03af-4c5e-9199-98ee1549fd2f` |
| 6 | `block-06.mp4` | `07b8581c-4432-4eda-987d-938c44cfa194` | `0919fcb3-ab3e-417d-b6c1-8959282dc8a1` |
| 7 | `block-07.mp4` | `187318df-10f1-4eba-8c57-85c2757da0bf` | `a8ae4759-ae1d-4805-b3d5-967515b34e87` |
| 8 | `block-08.mp4` | `f16d56d6-78ba-4b26-863e-2391331299be` | `fa270003-bc37-4b6d-8038-d43bd724ee70` |
| 9 | `block-09.mp4` | `604aed93-2758-429a-9dd5-56c270d71b80` | `7bbb5465-c1f7-4df8-87bd-e23ad5dc05d5` |
| 10 | `block-10.mp4` | `0c848d3c-7866-46ea-831a-594fd1df301e` | `514d353f-8e78-4cbf-aa38-b1460e37aa28` |
| 11 | `block-11.mp4` | `1217dd6e-ed45-4029-924e-86c5666a31d4` | `a7f9790b-e3b0-4401-ba84-98d4b92c8001` |
| 12 | `block-12.mp4` | `9f807a4c-ab65-4908-82e7-3a1fdf0b2dfe` | `804050c0-cb12-45e5-937b-10cf7b61486a` |

## Animation source
| File | Role |
|---|---|
| `animation/ep2/lib.js` | palette, grain, easing, deterministic PRNG, labels with safe-area clamping |
| `animation/ep2/anatomy.js` | organ primitives — figure, intestine, stomach, pancreas, brain, brainstem, neuron, adipocyte, 7TM receptor, peptide ribbon |
| `animation/ep2/scenes.js` | the twelve blocks, each a pure function of scene time `t` |
| `animation/ep2/page.html` | 1920×1080 canvas host |
| `animation/ep2/render.js` | frame driver — Chromium → JPEG → ffmpeg (`node render.js`, `--preview` for QA stills) |

Re-render everything with `cd animation/ep2 && node render.js`. Because every frame is a pure
function of `t`, individual blocks can be re-rendered in isolation (`node render.js 7`) without
touching the rest.

## Companion files
- `ep2-glp1-gip-zepbound-script.md` — 12-block script, style bible, and the claim→evidence table
- `ep2-job-manifest.json` — machine-readable clip↔voice pairing
