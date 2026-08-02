/* Episode 3 — molecular and cellular primitives.
   Each object is defined in its own local space and placed by the scene, so the
   same magnesium ion, the same glycine, the same receptor read identically
   across all twelve blocks. */

/* A charged ion: filled disc, soft corona, optional charge ticks */
function ion(ctx, x, y, r, color, t, seed, charge) {
  glow(ctx, x, y, r * 3.4, color, .45);
  blobPath(ctx, x, y, r, .035, t * .7 + seed, seed, 6);
  ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = hexA('#FFFFFF', .35); ctx.lineWidth = Math.max(1.5, r * .1); ctx.stroke();
  if (charge) {
    ctx.save();
    ctx.strokeStyle = hexA('#FFFFFF', .8);
    ctx.lineWidth = Math.max(2, r * .13);
    ctx.lineCap = 'round';
    const s = r * .34;
    ctx.beginPath();
    ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
    ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
    ctx.stroke();
    ctx.restore();
  }
}

/* Glycine: the smallest amino acid — backbone with an amine and a carboxyl arm.
   Drawn as a compact three-node cluster so it stays legible at small scale. */
function glycine(ctx, x, y, s, rot, color, t, seed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.strokeStyle = hexA(color, .85);
  ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-26, 10); ctx.lineTo(0, -6); ctx.lineTo(26, 10);
  ctx.stroke();
  const nodes = [[-26, 10, 11], [0, -6, 14], [26, 10, 11]];
  nodes.forEach((n, i) => {
    const w = 1 + .06 * Math.sin(t * 2 + seed + i);
    ctx.fillStyle = hexA(color, i === 1 ? .95 : .75);
    ctx.beginPath(); ctx.arc(n[0], n[1], n[2] * w, 0, TAU); ctx.fill();
  });
  ctx.restore();
}

/* The bisglycinate chelate: one Mg ion clamped by two glycines.
   `close` in [0,1] drives the two halves shutting around the ion. */
function chelate(ctx, x, y, s, close, t, seed) {
  const gap = lerp(210, 74, easeInOut(close));
  const ang = lerp(.9, 0, easeInOut(close));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // the coordinating bonds snap in as the ring closes
  if (close > .25) {
    const a = smoothstep(.25, 1, close);
    ctx.strokeStyle = hexA(P.lav, .5 * a);
    ctx.lineWidth = 4; ctx.setLineDash([9, 9]);
    [-1, 1].forEach(d => {
      ctx.beginPath();
      ctx.moveTo(d * gap * .55, 0); ctx.lineTo(d * 30, 0);
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }
  glycine(ctx, -gap, 0, 1, -ang, P.lav, t, seed);
  glycine(ctx, gap, 0, 1, Math.PI + ang, P.lav, t, seed + 5);
  ion(ctx, 0, 0, 30, P.teal, t, seed, close < .55);
  // once closed the whole complex reads as neutral
  if (close > .85) {
    const a = smoothstep(.85, 1, close);
    ctx.strokeStyle = hexA(P.cream, .3 * a);
    ctx.lineWidth = 3; ctx.setLineDash([6, 10]);
    ctx.beginPath(); ctx.ellipse(0, 0, gap + 46, 66, 0, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

/* ATP: adenosine + three phosphates. `mg` lights the Mg-bound (active) state,
   `fire` releases the terminal phosphate as energy. */
function atp(ctx, x, y, s, mg, fire, t, seed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // adenosine body
  paper(ctx, () => { blobPath(ctx, -104, 0, 46, .05, t * .4 + seed, seed, 6); }, hexA(P.cream, .8), .3, 4, 6);
  ctx.strokeStyle = hexA(P.cream, .5); ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-58, 0); ctx.lineTo(-24, 0); ctx.stroke();
  // three phosphates
  for (let i = 0; i < 3; i++) {
    const px = i * 52, last = i === 2;
    const off = last ? fire * 190 : 0;
    const a = last ? 1 - fire * .85 : 1;
    ctx.save();
    ctx.translate(px + off, -off * .34);
    ctx.rotate(last ? fire * 1.5 : 0);
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const aa = (k / 6) * TAU - Math.PI / 2;
      const xx = Math.cos(aa) * 25, yy = Math.sin(aa) * 25;
      k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
    }
    ctx.closePath();
    ctx.fillStyle = hexA(P.gold, .55 * a); ctx.fill();
    ctx.strokeStyle = hexA(P.gold, .95 * a); ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
    if (i < 2) {
      ctx.strokeStyle = hexA(P.gold, .6); ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(px + 25, 0); ctx.lineTo(px + 27, 0); ctx.stroke();
    }
  }
  // the magnesium that makes it usable
  if (mg > .01) {
    glow(ctx, 78, 54, 150, P.teal, mg * .5);
    ion(ctx, 78, 54, 26, P.teal, t, seed + 2, false);
    ctx.strokeStyle = hexA(P.teal, .55 * mg); ctx.lineWidth = 4; ctx.setLineDash([7, 8]);
    ctx.beginPath();
    ctx.moveTo(78, 30); ctx.lineTo(60, 6);
    ctx.moveTo(78, 30); ctx.lineTo(110, 6);
    ctx.stroke(); ctx.setLineDash([]);
  }
  if (fire > .01) glow(ctx, 104 + fire * 190, -fire * 64, 230 * fire, P.gold, .55 * (1 - fire));
  ctx.restore();
}

/* Sarcomere: two Z-discs with actin/myosin between them.
   `contract` in [0,1] shortens it. */
function sarcomere(ctx, cx, cy, w, h, contract, t) {
  const half = w * .5 * lerp(1, .66, contract);
  ctx.save();
  ctx.translate(cx, cy);
  // Z-discs
  [-1, 1].forEach(d => {
    ctx.fillStyle = hexA(P.cream, .8);
    ctx.fillRect(d * half - 7, -h * .5, 14, h);
  });
  // thin filaments reaching in from each Z-disc
  ctx.strokeStyle = hexA(P.cream, .45); ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = -3; i <= 3; i++) {
    const y = i * (h / 8);
    [-1, 1].forEach(d => {
      ctx.beginPath();
      ctx.moveTo(d * half, y);
      ctx.lineTo(d * (half - w * .30), y);
      ctx.stroke();
    });
  }
  // thick filament in the middle, with cross-bridges that engage when contracted
  ctx.strokeStyle = hexA(P.amber, .5 + .35 * contract);
  ctx.lineWidth = 13;
  for (let i = -2; i <= 2; i++) {
    const y = i * (h / 6);
    ctx.beginPath();
    ctx.moveTo(-w * .22, y); ctx.lineTo(w * .22, y);
    ctx.stroke();
  }
  if (contract > .05) {
    ctx.strokeStyle = hexA(P.amber, .8 * contract); ctx.lineWidth = 4;
    for (let i = -2; i <= 2; i++) {
      const y = i * (h / 6);
      for (let k = -2; k <= 2; k++) {
        const x = k * (w * .09);
        const a = .5 + .5 * Math.sin(t * 6 + k + i);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 16 * a, y + (i < 0 ? -15 : 15));
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

/* A membrane-spanning channel. `open` widens the pore; `plug` seats an ion in it. */
function channel(ctx, x, y, s, color, open, t, seed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const spread = lerp(20, 44, open);
  ctx.strokeStyle = hexA(color, .9);
  ctx.lineWidth = 20; ctx.lineCap = 'round';
  [-1, 1].forEach(d => {
    ctx.beginPath();
    ctx.moveTo(d * (spread + 16), -54);
    ctx.lineTo(d * spread, 0);
    ctx.lineTo(d * (spread + 16), 54);
    ctx.stroke();
  });
  ctx.restore();
}

/* Intestinal wall with villi. Returns the y of the wall surface. */
function gutWall(ctx, W, H, wallY, t, color) {
  const p = () => {
    ctx.beginPath();
    ctx.moveTo(-60, H + 60);
    ctx.lineTo(-60, wallY);
    for (let x = -60; x <= W + 60; x += 8) {
      const u = x / 104;
      const h = 116 + Math.sin(u * 1.7) * 26;
      const y = wallY - Math.pow(Math.abs(Math.sin(u * Math.PI / 2 + Math.sin(x * .01 + t * .25) * .1)), .55) * h;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W + 60, H + 60);
    ctx.closePath();
  };
  paper(ctx, p, color, .4, 5, 9);
  return wallY;
}

/* Water molecule — a small bent trio, used for the osmosis beat */
function water(ctx, x, y, r, a, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = hexA('#7FC3E8', .9);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.fillStyle = hexA('#BFE3F5', .85);
  ctx.beginPath(); ctx.arc(-r * .95, -r * .75, r * .55, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(r * .95, -r * .75, r * .55, 0, TAU); ctx.fill();
  ctx.restore();
}
