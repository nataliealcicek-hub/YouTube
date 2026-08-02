/* Episode 2 — anatomical primitives, drawn as flat cut-paper shapes.
   Every organ is defined in its own local coordinate space and placed by the
   scene with translate/scale, so anatomy stays consistent across blocks. */

/* Standing human figure, front view, centred on (0,0), total height ~900 */
function figurePath(ctx, narrow) {
  const w = 1 - (narrow || 0);           // torso width multiplier
  const hipW = 108 * w, shW = 128 * w, waistW = 96 * w;
  ctx.beginPath();
  ctx.moveTo(0, -450);                                    // top of head
  ctx.bezierCurveTo(52, -450, 58, -378, 34, -352);        // skull right
  ctx.lineTo(30, -330);
  ctx.bezierCurveTo(70, -318, shW, -300, shW, -250);      // shoulder right
  ctx.bezierCurveTo(shW + 30, -150, shW + 22, -60, shW + 10, 10);
  ctx.lineTo(shW - 26, 14);
  ctx.bezierCurveTo(shW - 18, -70, waistW + 6, -140, waistW, -170);
  ctx.bezierCurveTo(waistW + 16, -80, hipW, -30, hipW, 40);
  ctx.bezierCurveTo(hipW, 130, 84, 190, 74, 300);         // right leg
  ctx.lineTo(66, 440);
  ctx.lineTo(16, 440);
  ctx.lineTo(10, 300);
  ctx.bezierCurveTo(6, 220, 4, 200, 0, 180);
  ctx.bezierCurveTo(-4, 200, -6, 220, -10, 300);
  ctx.lineTo(-16, 440);
  ctx.lineTo(-66, 440);
  ctx.lineTo(-74, 300);
  ctx.bezierCurveTo(-84, 190, -hipW, 130, -hipW, 40);
  ctx.bezierCurveTo(-hipW, -30, -waistW - 16, -80, -waistW, -170);
  ctx.bezierCurveTo(-waistW - 6, -140, -shW + 18, -70, -shW + 26, 14);
  ctx.lineTo(-shW - 10, 10);
  ctx.bezierCurveTo(-shW - 22, -60, -shW - 30, -150, -shW, -250);
  ctx.bezierCurveTo(-shW, -300, -70, -318, -30, -330);
  ctx.lineTo(-34, -352);
  ctx.bezierCurveTo(-58, -378, -52, -450, 0, -450);
  ctx.closePath();
}

/* Coiled small intestine — serpentine loops, roughly x[-95,95] y[-30,150] */
function intestinePath(ctx, phase) {
  ctx.beginPath();
  const steps = 400, rows = 6.5, top = -26, span = 176, w = 86;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const amp = w * (.62 + .38 * Math.sin(u * 5.1 + 1.2));
    const x = Math.sin(u * Math.PI * rows) * amp
            + Math.sin(u * Math.PI * rows * .41 + .8) * 20;
    const y = top + (u * .82 + .18 * u * u) * span
            + Math.sin(u * Math.PI * rows * 2 + 1.1) * 7
            + Math.sin(u * 19 + (phase || 0)) * 2.5;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
}

/* Smoothly continue the current path through a list of points */
function smoothTo(ctx, pts) {
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i], p1 = pts[i + 1];
    ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
  }
  ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
}

/* Stomach, J-shaped sac seen from the front: fundus upper-left, body, antrum
   sweeping right and down to the pylorus. Local ~ x[-165,175] y[-175,195] */
function stomachPath(ctx, fill) {
  const b = 1 + (fill || 0) * .13;
  const outer = [                      // greater curvature (left + inferior)
    [-30, -172], [-104 * b, -128 * b], [-150 * b, -30 * b], [-140 * b, 62 * b],
    [-104 * b, 140 * b], [-20, 182], [62, 170], [124, 126], [158, 62], [166, 34],
  ];
  const inner = [                      // lesser curvature: shallow concave arc back to the cardia
    [132, 26], [98, 2], [56, -34], [12, -74], [-22, -116], [-28, -152],
  ];
  ctx.beginPath();
  ctx.moveTo(outer[0][0], outer[0][1]);
  smoothTo(ctx, outer);
  ctx.lineTo(inner[0][0], inner[0][1]);
  smoothTo(ctx, inner);
  ctx.closePath();
}

/* Pancreas, leaf/tadpole shape. Local ~ x[-190,190] y[-70,70] */
function pancreasPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(-186, -6);
  ctx.bezierCurveTo(-150, -54, -80, -66, -10, -50);
  ctx.bezierCurveTo(70, -32, 130, -20, 178, -44);
  ctx.bezierCurveTo(196, 2, 168, 34, 122, 32);
  ctx.bezierCurveTo(60, 30, 0, 16, -60, 24);
  ctx.bezierCurveTo(-118, 32, -158, 44, -186, -6);
  ctx.closePath();
}

/* Brain, mid-sagittal profile facing left. Local ~ x[-260,240] y[-210,240] */
function brainPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(-210, 30);
  ctx.bezierCurveTo(-238, -60, -186, -168, -80, -196);
  ctx.bezierCurveTo(30, -226, 168, -178, 208, -78);
  ctx.bezierCurveTo(240, 2, 214, 74, 150, 104);
  ctx.bezierCurveTo(104, 126, 60, 118, 22, 116);
  ctx.bezierCurveTo(-10, 114, -30, 122, -44, 140);         // toward brainstem
  ctx.bezierCurveTo(-60, 118, -86, 104, -120, 94);
  ctx.bezierCurveTo(-176, 78, -196, 70, -210, 30);
  ctx.closePath();
}

/* Cerebellum + brainstem, sits under the brain */
function brainstemPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(-44, 112);
  ctx.bezierCurveTo(-30, 150, -26, 196, -30, 240);
  ctx.lineTo(-92, 240);
  ctx.bezierCurveTo(-96, 190, -100, 148, -114, 112);
  ctx.closePath();
}

/* A neuron: soma at (x,y) with dendrites and one axon toward angle `dir` */
function neuron(ctx, x, y, r, dir, color, glowA, t, seed, agitation) {
  const ag = agitation || 0;
  ctx.save();
  // dendrites
  ctx.strokeStyle = hexA(color, .85);
  ctx.lineWidth = Math.max(2, r * .16);
  ctx.lineCap = 'round';
  const n = 6;
  for (let i = 0; i < n; i++) {
    const a = dir + Math.PI + (i - (n - 1) / 2) * .46 + Math.sin(t * (2 + ag * 6) + seed + i) * (.05 + ag * .12);
    const L = r * (2.4 + rnd(seed + i) * 1.5);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8);
    const mx = x + Math.cos(a) * L * .6, my = y + Math.sin(a) * L * .6;
    ctx.quadraticCurveTo(mx, my, x + Math.cos(a + .28) * L, y + Math.sin(a + .28) * L);
    ctx.stroke();
    // terminal twigs
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a + .28) * L, y + Math.sin(a + .28) * L);
    ctx.lineTo(x + Math.cos(a + .55) * L * 1.22, y + Math.sin(a + .55) * L * 1.22);
    ctx.stroke();
  }
  // axon
  ctx.lineWidth = Math.max(2.5, r * .2);
  ctx.beginPath();
  ctx.moveTo(x + Math.cos(dir) * r * .85, y + Math.sin(dir) * r * .85);
  ctx.lineTo(x + Math.cos(dir) * r * 5.4, y + Math.sin(dir) * r * 5.4);
  ctx.stroke();
  // soma
  if (glowA > .01) glow(ctx, x, y, r * 4.2, color, glowA * .55);
  blobPath(ctx, x, y, r, .05, t * (1 + ag * 3) + seed, seed, 5);
  ctx.fillStyle = color; ctx.fill();
  ctx.restore();
}

/* Fat cell: big lipid droplet with a squeezed nucleus */
function adipocyte(ctx, x, y, r, t, seed, fillLevel) {
  blobPath(ctx, x, y, r, .04, t * .5 + seed, seed, 6);
  ctx.fillStyle = hexA(P.gold, .18); ctx.fill();
  ctx.strokeStyle = hexA(P.gold, .55); ctx.lineWidth = 3; ctx.stroke();
  const lr = r * (.45 + .45 * clamp(fillLevel, 0, 1));
  blobPath(ctx, x, y, lr, .05, t * .4 + seed * 2, seed + 9, 6);
  ctx.fillStyle = hexA(P.gold, .72); ctx.fill();
  ctx.fillStyle = hexA(P.crimDeep, .8);
  ctx.beginPath();
  ctx.ellipse(x + r * .62, y - r * .4, r * .17, r * .12, .4, 0, TAU);
  ctx.fill();
}

/* 7-transmembrane receptor embedded in a membrane at (x,y), opening upward */
function receptor(ctx, x, y, s, color, lit) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (lit > .01) glow(ctx, 0, -6, 92, color, lit * .8);
  ctx.strokeStyle = hexA(color, .55 + lit * .45);
  ctx.lineWidth = 9; ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const px = (i - 3) * 13;
    ctx.beginPath();
    ctx.moveTo(px, -26); ctx.lineTo(px + (i % 2 ? 3 : -3), 26);
    ctx.stroke();
  }
  // binding pocket
  ctx.beginPath();
  ctx.moveTo(-26, -26); ctx.quadraticCurveTo(0, -54, 26, -26);
  ctx.strokeStyle = hexA(color, .35 + lit * .65);
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.restore();
}

/* lipid-bilayer membrane band across the frame at height y */
function membrane(ctx, x0, x1, y, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha === undefined ? 1 : alpha;
  ctx.fillStyle = hexA(color, .22);
  ctx.fillRect(x0, y - 26, x1 - x0, 52);
  ctx.fillStyle = hexA(color, .5);
  for (let x = x0; x < x1; x += 22) {
    ctx.beginPath(); ctx.arc(x, y - 26, 7, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y + 26, 7, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

/* the tirzepatide peptide: a helical ribbon of `n` residues along a path */
function peptide(ctx, x, y, len, amp, t, built, color, thick) {
  const n = 34;
  ctx.save();
  const shown = Math.floor(n * clamp(built, 0, 1));
  for (let i = 0; i < shown; i++) {
    const u = i / (n - 1);
    const px = x + u * len;
    const py = y + Math.sin(u * 13 + t * 1.6) * amp;
    const r = (thick || 9) * (.7 + .5 * Math.sin(u * 13 + t * 1.6 + 1.6));
    const a = .35 + .65 * (.5 + .5 * Math.sin(u * 13 + t * 1.6));
    ctx.fillStyle = hexA(color, a);
    ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill();
  }
  if (shown > 1) {
    ctx.strokeStyle = hexA(color, .5); ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < shown; i++) {
      const u = i / (n - 1);
      const px = x + u * len, py = y + Math.sin(u * 13 + t * 1.6) * amp;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}
