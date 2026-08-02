# Episode 2 — "The Hormone That Talks Your Brain Out of Hunger"

**Subject:** what GLP-1 / GIP dual agonists (tirzepatide — Zepbound) actually do to the body to suppress hunger and drive weight loss.
**Channel:** faceless science-explainer (Kurzgesagt-style)
**Format:** 12 × 10s blocks = **2:00 exact**, 1920×1080, 16:9
**Voice:** Seed Audio 1.0, narrator "Cillian" (`d8ba9f14-8a24-44db-932b-99e16c45bd32`, preset) — same as Episode 1
**Production route:** hybrid — animation rendered locally (SVG/CSS motion graphics → Chromium frame capture → ffmpeg), narration generated on Higgsfield to keep the channel voice consistent.

## Why local animation for this episode
The subject is anatomical and pharmacological. Generative video invents plausible-looking but wrong organs, wrong receptor sites, and wrong molecule behaviour. Hand-authored vector animation puts the arcuate nucleus, the pancreatic beta cell and the vagal afferents exactly where they belong, and keeps them there across all 12 blocks.

## Style bible (carried over from Episode 1)
- **Render:** mixed-media flat 2D — cut-paper layers, gouache grain, ink linework. Strictly non-photorealistic.
- **Palette:** deep crimson interior · electric teal (the drug / the signal) · bioluminescent gold (neural + hormonal activity) · warm cream paper.
- **Hero:** the tirzepatide molecule — a luminous teal peptide ribbon that threads gut → blood → pancreas → stomach → brain.
- **Antagonist:** hunger drive, rendered as restless acid-yellow AgRP/NPY neurons.
- **No on-screen text in the artwork**; captions optional at assembly.

## Pharmacology the animation is built on
| Claim in narration | Basis |
|---|---|
| GLP-1 and GIP released from intestinal L-cells and K-cells after eating | incretin physiology; incretins account for ~50–70% of postprandial insulin response |
| Native GLP-1 half-life ~1–2 min, cleaved by DPP-4 | established enzymology |
| Tirzepatide = single peptide, dual GIP + GLP-1 receptor agonist | Zepbound / Mounjaro mechanism |
| Weekly subcutaneous dosing, half-life ≈ 5 days | supports once-weekly schedule |
| Glucose-dependent insulin release, glucagon suppression | incretin effect at pancreatic β/α cells |
| Delayed gastric emptying → prolonged satiety | documented GLP-1 RA effect |
| Arcuate nucleus: POMC/CART activated, AgRP/NPY inhibited | hypothalamic appetite circuit |
| NTS + area postrema signalling → nausea in early titration | brainstem GLP-1 receptor expression |
| GIP receptors on adipocytes + CNS; may blunt nausea, improving tolerability of higher doses | proposed dual-agonist advantage |
| ~20% mean body-weight reduction at 72 weeks | SURMOUNT-1, tirzepatide 15 mg |

## The 12 blocks

| # | Narration (VO) | Visual |
|---|---|---|
| 1 | Right now, inside your gut, a hormone is deciding whether you feel hungry. For most of human history, we had no say in that conversation. Now, we do. | Cut-paper human silhouette, gut glowing faint gold; slow push-in. |
| 2 | After you eat, cells lining your small intestine release two hormones: GLP-1 and GIP. Scientists call them incretins. Your body calls them the signal to stop. | Intestinal wall cross-section; L-cells and K-cells pulse and shed gold hormone particles. |
| 3 | But there's a problem. Natural GLP-1 is destroyed in about two minutes by an enzyme called DPP-4. The message is gone almost before it arrives. | Gold particles drift into bloodstream and are snipped apart by DPP-4 scissors; a countdown of fading dots. |
| 4 | Tirzepatide, sold as Zepbound, is a synthetic peptide built to survive. One molecule, engineered to press both incretin receptors at once, for days at a time. | The teal peptide ribbon assembles; two receptor keyholes (GIP + GLP-1) light up as it docks into both. |
| 5 | Injected under the skin once a week, it enters the bloodstream with a half-life near five days. Your incretin signal stops flickering, and simply stays on. | Subcutaneous injection; teal thread enters vessel highway; a flickering signal bar steadies to solid. |
| 6 | Its first stop is the pancreas, where it tells beta cells to release insulin, but only when blood sugar is high, while quieting the glucagon that pushes sugar up. | Pancreas cross-section; β-cells bloom teal and release insulin only as glucose dots rise; α-cells dim. |
| 7 | Next, the stomach. The drug slows gastric emptying, so food lingers longer. Stretch receptors in the stomach wall keep sending one message upward: still full. | Stomach fills; pyloric valve slows to a near-stop; vagal fibres pulse gold up toward the brainstem. |
| 8 | But the real target is your brain. Deep in the hypothalamus sits the arcuate nucleus, a small cluster of neurons that sets your appetite. | Camera travels up the vagus into a paper-cut brain; hypothalamus, then the arcuate nucleus, isolate and glow. |
| 9 | There, it switches on POMC neurons, the ones that say enough, and silences AgRP and NPY neurons, the ones that scream: find food now. | Two neuron clusters: teal POMC ignites and spreads; acid-yellow AgRP/NPY thrash, then fade to grey. |
| 10 | It also reaches the brainstem, the nucleus of the solitary tract and the area postrema. That's why the first weeks can bring nausea, as your body recalibrates. | Brainstem highlighted; NTS and area postrema flare; a queasy green ripple washes through and settles. |
| 11 | The GIP half is the twist. GIP receptors sit on fat cells and in the brain, improving how fat is stored, and blunting nausea, so higher doses become tolerable. | Adipocytes shrink and reorganise; the green nausea ripple is damped by a second teal wave; dose dial turns up. |
| 12 | The result, in trial data: around twenty percent of body weight, lost over seventy-two weeks. Not willpower. A conversation your body was always having, finally translated. | Pull back to the full figure; silhouette narrows; the gut-to-brain teal thread pulses once, calm. |

## Pipeline status — ✅ COMPLETE
- 12 × locally-rendered clips @ 1920×1080, 30 fps, 10s each: ✅
- 12 × Seed Audio narration takes (voice Cillian): ✅
- Final assembly (`explainer_video`, 1920×1080, burned-in captions): ✅ job `1506fa2c-222a-4c2a-9c56-4a585f665ab1`
- **Final MP4:** https://d8j0ntlcm91z4.cloudfront.net/user_3EMGm7xzkClXL1IjHLUtSDY9muk/hf_20260802_021619_1506fa2c-222a-4c2a-9c56-4a585f665ab1.mp4
- Runtime: 2:00 exact · **Credits spent: ~13** (Episode 1 was ~1,095 for the same runtime)

## Assets
- Narration takes + media IDs: `ep2-job-manifest.json`
- Full asset index and rebuild instructions: `ep2-asset-index.md`
- Animation source: `animation/ep2/`
- Silent master: `output/ep2-glp1-gip-silent.mp4`
