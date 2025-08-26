// js/core/storage.js
// Presets + autosave + historique via localStorage

const K_PRESETS = 'gpv5:presets';
const K_AUTOSAVE = 'gpv5:autosave';
const K_HISTORY = 'gpv5:history';
const MAX_HISTORY = 15;

function safeLS(){ try{ return window.localStorage; }catch{ return null; } }
function nowISO(){ return new Date().toISOString(); }
function djb2(str){ let h=5381; for(let i=0;i<str.length;i++) h=((h<<5)+h)^str.charCodeAt(i); return (h>>>0).toString(16); }

function readJSON(key, fallback){ const ls=safeLS(); if(!ls) return fallback;
  try{ const v=ls.getItem(key); return v?JSON.parse(v):fallback; }catch{ return fallback; } }
function writeJSON(key, obj){ const ls=safeLS(); if(!ls) return false;
  try{ ls.setItem(key, JSON.stringify(obj)); return true; }catch{ return false; } }

/* -------- Presets -------- */
export function listPresets(){
  const s = readJSON(K_PRESETS, {version:1, list:[]});
  return Array.isArray(s.list)? s.list : [];
}
export function savePreset(name, model){
  if(!name) throw new Error('Nom de modèle requis');
  const s = readJSON(K_PRESETS, {version:1, list:[]});
  const i = (s.list||[]).findIndex(p=>p.name===name);
  const entry = { name, model, updated_at: nowISO() };
  if(i>=0) s.list[i]=entry; else s.list.push(entry);
  writeJSON(K_PRESETS, s);
  return entry;
}
export function deletePreset(name){
  const s = readJSON(K_PRESETS, {version:1, list:[]});
  s.list = (s.list||[]).filter(p=>p.name!==name);
  writeJSON(K_PRESETS, s);
}
export function getPreset(name){
  return listPresets().find(p=>p.name===name) || null;
}

/* Export/Import fichier preset */
export function exportPresetPayload(name){
  const p = getPreset(name); if(!p) throw new Error('Modèle introuvable');
  return JSON.stringify({kind:'gpv5-preset', name:p.name, updated_at:p.updated_at, model:p.model}, null, 2);
}
export function importPresetPayload(text, fallbackName){
  const obj = JSON.parse(text);
  // accepte soit {kind:'gpv5-preset', ...} soit directement le modèle
  const name = obj?.kind==='gpv5-preset' ? (obj.name||fallbackName||`preset_${Date.now()}`) : (fallbackName||`preset_${Date.now()}`);
  const model = obj?.kind==='gpv5-preset' ? obj.model : obj;
  savePreset(name, model);
  return {name, model};
}

/* -------- Autosave + historique -------- */
let lastHash = '';
let autosaveTimer = null;

export function queueAutosave(modelStr){
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(()=> doAutosave(modelStr), 500); // anti-spam
}

function doAutosave(modelStr){
  if(!modelStr) return;
  const hash = djb2(modelStr);
  if(hash===lastHash) return;
  lastHash = hash;

  // autosave courant
  writeJSON(K_AUTOSAVE, { ts: nowISO(), hash, model: modelStr });

  // historique
  const h = readJSON(K_HISTORY, {version:1, list:[]});
  h.list = Array.isArray(h.list)? h.list : [];
  h.list.unshift({ ts: nowISO(), hash, size: modelStr.length, model: modelStr });
  if (h.list.length > MAX_HISTORY) h.list = h.list.slice(0, MAX_HISTORY);
  writeJSON(K_HISTORY, h);
}

export function getAutosave(){ return readJSON(K_AUTOSAVE, null); }
export function historyList(){ const h=readJSON(K_HISTORY,{version:1,list:[]}); return h.list||[]; }
export function historyClear(){ writeJSON(K_HISTORY, {version:1, list:[]}); }
export function historyGet(ts){
  const item = historyList().find(x=>x.ts===ts);
  return item ? item.model : null;
}