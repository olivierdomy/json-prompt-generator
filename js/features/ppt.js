// js/features/ppt.js
// Auto-size image depuis le manifeste avec DPI configurable et garde-fous.

function parseWxH(s){
  if(!s) return null;
  const m = String(s).trim().match(/^(\d{2,5})x(\d{2,5})$/);
  if(!m) return null;
  return [parseInt(m[1],10), parseInt(m[2],10)];
}

function clampSize(w, h, minWH, maxWH){
  let W=w, H=h;
  if (!Number.isFinite(W) || !Number.isFinite(H) || W<=0 || H<=0) return null;

  // Scale up to meet minimums
  if (minWH){
    const sx = minWH[0] ? (minWH[0]/W) : 1;
    const sy = minWH[1] ? (minWH[1]/H) : 1;
    const sUp = Math.max(1, sx, sy);
    W *= sUp; H *= sUp;
  }

  // Scale down to respect maximums
  if (maxWH){
    const sx = maxWH[0] ? (maxWH[0]/W) : 1;
    const sy = maxWH[1] ? (maxWH[1]/H) : 1;
    const sDown = Math.min(1, sx, sy);
    W *= sDown; H *= sDown;
  }

  return [Math.max(1, Math.round(W)), Math.max(1, Math.round(H))];
}

function resolvePicturePH(layoutEntry, pictureRef){
  const PH = layoutEntry?.placeholders || [];
  const aliases = layoutEntry?.aliases || {};

  // 1) valeur passée (name ou idx)
  if (typeof pictureRef === 'string'){
    // name exact
    const byName = PH.find(p=>p.name===pictureRef);
    if (byName) return byName;
    // "idx:NN"
    const m = pictureRef.match(/^idx:(\d+)$/);
    if (m){
      const idx = parseInt(m[1],10);
      const byIdx = PH.find(p=>p.idx===idx);
      if (byIdx) return byIdx;
    }
  } else if (Number.isFinite(pictureRef)) {
    const byIdx = PH.find(p=>p.idx===Number(pictureRef));
    if (byIdx) return byIdx;
  }

  // 2) alias picture du layout
  if (aliases?.picture){
    const a = aliases.picture;
    if (a.name){
      const byAliasName = PH.find(p=>p.name===a.name);
      if (byAliasName) return byAliasName;
    }
    if (a.idx !== undefined){
      const byAliasIdx = PH.find(p=>p.idx===Number(a.idx));
      if (byAliasIdx) return byAliasIdx;
    }
  }
  return null;
}

export function autoSizeFromManifest(layoutId, pictureRef){
  const mf = window.__template_manifest__;
  if (!mf?.layouts || !mf.layouts[layoutId]) return '';

  const entry = mf.layouts[layoutId];
  const ph = resolvePicturePH(entry, pictureRef);
  if (!ph?.bbox?.width_in || !ph?.bbox?.height_in) {
    // fallback taille par défaut si dispo
    const def = window.__meta_image_policy__?.default_size;
    return def && /^(\d{2,5})x(\d{2,5})$/.test(def) ? def : '1024x768';
  }

  // Paramètres globaux
  const pol = window.__meta_image_policy__ || {};
  const dpi = Math.max(72, Math.min(600, parseInt(pol.dpi ?? 300, 10) || 300));
  const minWH = parseWxH(pol.min_size || '512x512');
  const maxWH = parseWxH(pol.max_size || '2048x2048');

  // Conversion pouces → pixels
  const baseW = ph.bbox.width_in  * dpi;
  const baseH = ph.bbox.height_in * dpi;

  const clamped = clampSize(baseW, baseH, minWH, maxWH);
  if (!clamped) return '1024x768';
  return `${clamped[0]}x${clamped[1]}`;
}