import { getManifest } from './manifest.js';

// name|alias|idx → Placeholder
export function resolvePlaceholder(layout, {name,alias,idx}={}){
  const TM=getManifest(); if(!TM) return null;
  const entry=TM.layouts?.[layout]; if(!entry) return null;
  if(name) return (entry.placeholders||[]).find(p=>p.name===name)||null;
  if(alias && entry.aliases?.[alias]){ const a=entry.aliases[alias]; return (entry.placeholders||[]).find(p=>p.idx===a.idx)||null; }
  if(Number.isFinite(idx)) return (entry.placeholders||[]).find(p=>p.idx===idx)||null;
  return null;
}

// WxH en pixels depuis bbox pouces (ppi 300 mini)
export function autoSizeFromManifest(layout, pictureRef){
  const ph = resolvePlaceholder(layout, typeof pictureRef==='object' ? pictureRef : {name:pictureRef});
  if(!ph || !ph.bbox) return '';
  const wpx = Math.max(300, Math.round(parseFloat(ph.bbox.width_in)*300));
  const hpx = Math.max(300, Math.round(parseFloat(ph.bbox.height_in)*300));
  return `${wpx}x${hpx}`;
}