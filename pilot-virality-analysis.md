# Virality Analysis — "The War Inside Your Body" (Pilot POC)

Tool: **Higgsfield Virality Predictor** (neural-attention "brain_activity" proxy model).
Scores are normalized 0–100 prediction proxies — *predictive, not guaranteed performance.*
The predictor accepts clips **≤16s only**, so it runs on individual 10s blocks, not the full 2:00 video. For long-form, the **hook clip is the meaningful test.**

## Results

| Metric (/100) | **Block 1 — Hook** (sleeping body push-in) | Block 7 — Macrophage engulfs bacterium |
|---|---|---|
| **Viral potential** | **51** | 43 |
| Overall engagement | 50 | 44 |
| **Hook strength (first 3s)** | **32** | 28 |
| Brain engagement | 44 | 34 |
| Sustain (attention holds) | 100 | 100 |
| Peak attention at | second 10 (the end) | second 10 (the end) |

**Dashboards (interactive, in Higgsfield UI):**
- Block 1 hook: job `cff2ebb8-0279-4fe5-ac73-a27febfe5b97` → `https://d8j0ntlcm91z4.cloudfront.net/user_3EMGm7xzkClXL1IjHLUtSDY9muk/hf_20260720_000630_cff2ebb8-0279-4fe5-ac73-a27febfe5b97.html`
- Block 7: job `d3cd6852-c7e9-47b5-b9d6-08c4195893fe` → `https://d8j0ntlcm91z4.cloudfront.net/user_3EMGm7xzkClXL1IjHLUtSDY9muk/hf_20260720_000437_d3cd6852-c7e9-47b5-b9d6-08c4195893fe.html`

## By brain region (Block 1 hook)
| Region | Mean | Read |
|---|---|---|
| Visual cortex | 0.47 (peak 0.55 @8s) | Strongest driver — visuals carry it |
| Auditory/temporal | 0.40 (peak @10s) | Builds late (clip is silent — VO added at assembly) |
| Language network | 0.42 | Builds late |
| Frontoparietal/attention | 0.45 (peak @10s) | Attention climbs to the cut |
| Default Mode (lower=better) | 0.62, high early (0.68 @3s) → drops to 0.38 @10s | **Mind-wandering in the first seconds** — the hook problem |

## Interpretation — the one clear pattern

Both clips show the **same shape: a soft first 3 seconds, then attention builds to a peak at the very end.** Sustain is maxed (100) — once people are in, they stay — but the **hook scores are weak (32 and 28).** The Default Mode Network is high early (mind-wandering) and only quiets down toward the end.

**Why:** the clips open on slow, cinematic push-ins. Beautiful and on-brand, but a slow drift doesn't *grab* in second one. The model rewards immediate motion/novelty up front, which these openings delay.

**Block 1 beats Block 7** on every metric — the hook shot is correctly the strongest of the two, which is a good sign the ordering is right.

## Recommendations (to raise the hook score)

1. **Front-load the punch.** Open Block 1 on the strongest visual event, not a slow approach — e.g., start already close on the body with immediate motion, or hard-cut to the macrophage's eyes in the first second, then pull back. The "slow build" can come *after* the grab.
2. **Add a cold-open teaser frame.** Consider a 1–2s flash of the most dramatic shot (Block 7/8 combat) *before* Block 1 — a "you're going to see this" promise — then start the narration. Classic retention trick.
3. **Kill early mind-wandering with a face/eyes.** The macrophage's dot-eyes are the most attention-grabbing asset; getting a character on screen sooner in the hook would pull Default Mode down faster.
4. **Burn captions.** Faceless retention lifts with on-screen text synced to VO — cheap to add at assembly.
5. **Remember the silence caveat.** These scores are for *silent* clips. The finished video's narration drives the auditory/language channels that here only spike at the end — real engagement is higher than these numbers alone suggest.

## Verdict

A **mid-tier (~50/100) viral-potential** result with **excellent sustain but a soft hook** — exactly the profile you'd expect from a gorgeous-but-slow cinematic open. The fix is cheap and specific: make the first 2 seconds hit harder. Worth a hook re-generation before scaling to the full video.
