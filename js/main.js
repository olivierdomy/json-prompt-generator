// js/main.js
import * as ai from './features/aiProfile.js';
import * as meta from './features/metadata.js';
import { renderSummary, getManifest } from './features/manifest.js';
import { addInstruction, collectSequences, wireAutocompleteForNewSeq } from './features/timeline.js';
import { bind as bindToggles } from './features/toggles.js';
import { buildModel } from './core/schema.js';
import { toJSON, toTXT, download, copyToClipboard } from './features/exporter.js';
import { toast } from './core/toast.js';
import { validateModel, applyValidationUI, clearValidationUI } from './core/validate.js';
import { importModel } from './features/importer.js';
import { queueAutosave, getAutosave } from './core/storage.js';
import { wirePresetsUI } from './features/presets.js';

let latest = '';

function debounce(fn, ms=300){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }
function ensureActionsRowSticky(){
  const gen = document.getElementById('generateBtn');
  if (!gen) return;
  const row = gen.closest('.row');
  if (row && !row.id) row.id = 'actionsRow';
}

function buildAndPreview(){
  const ai_profile = ai.collect();
  const metadata   = meta.collect();
  window.__meta_image_policy__ = metadata.image_policy || null;

  const pptEnabled = document.getElementById('enablePowerPoint')?.checked;
  const template = (pptEnabled && document.getElementById('defaultLayoutId')?.value)
    ? { layout_id: document.getElementById('defaultLayoutId').value } : undefined;

  const template_manifest = window.__template_manifest__ || undefined;
  const timeline = collectSequences();

  const model = buildModel({ ai_profile, metadata, template, template_manifest, timeline });
  latest = toJSON(model);

  const prev = document.getElementById('jsonPreview');
  if (prev) prev.textContent = latest;
  const copyBtn = document.getElementById('copyJsonBtn');
  if (copyBtn) copyBtn.disabled = !latest;

  clearValidationUI();
  const report = validateModel(JSON.parse(latest), template_manifest || null);
  applyValidationUI(report);

  // autosave
  queueAutosave(latest);
  return report;
}

function wireLivePreview(){
  const root = document.getElementById('promptForm');
  if(!root) return;
  const onAnyInput = debounce(()=>{ try{ buildAndPreview(); }catch{} }, 250);
  root.addEventListener('input', onAnyInput);
  root.addEventListener('change', onAnyInput);
}

function wireShortcuts(){
  document.addEventListener('keydown', (e)=>{
    const cmd = e.ctrlKey || e.metaKey;
    if (cmd && e.key === 'Enter'){ e.preventDefault(); document.getElementById('generateBtn')?.click(); }
    if (cmd && (e.key.toLowerCase() === 'j')){ e.preventDefault(); addInstructionAndWire(); toast('Instruction ajoutée','success'); }
    if (e.key === 'Escape'){ document.querySelectorAll('#toasts .toast').forEach(t=>t.remove()); }
  });
}

function wireManifestAutocomplete(){
  let dl = document.getElementById('listLayouts');
  if (!dl){ dl = document.createElement('datalist'); dl.id='listLayouts'; document.body.appendChild(dl); }
  const mf = getManifest();
  dl.innerHTML = '';
  if (mf?.layouts){
    Object.keys(mf.layouts).forEach(k=>{
      const o=document.createElement('option'); o.value=k; dl.appendChild(o);
    });
  }
  const def = document.getElementById('defaultLayoutId');
  if(def) def.setAttribute('list','listLayouts');
}

function wirePlaceholderAutocompleteForLayout(layoutId, seqIdx){
  const mf = getManifest(); if(!mf?.layouts || !layoutId) return;
  const entry = mf.layouts[layoutId]; if(!entry) return;

  let dl = document.getElementById('listPlaceholders');
  if (!dl){ dl = document.createElement('datalist'); dl.id='listPlaceholders'; document.body.appendChild(dl); }
  dl.innerHTML = '';
  (entry.placeholders||[]).forEach(p=>{
    const o=document.createElement('option'); o.value=p.name || `idx:${p.idx}`; dl.appendChild(o);
  });
  [`phTitleName${seqIdx}`, `phBodyName${seqIdx}`, `phPicName${seqIdx}`].forEach(id=>{
    const el = document.getElementById(id); if (el) el.setAttribute('list','listPlaceholders');
  });
}

function addInstructionAndWire(){
  const idx = addInstruction();
  const lid = document.getElementById(`layoutId${idx}`)?.value || document.getElementById('defaultLayoutId')?.value || '';
  wirePlaceholderAutocompleteForLayout(lid, idx);
  wireAutocompleteForNewSeq(idx);
}

function offerRestore(){
  const a = getAutosave();
  if(!a?.model) return;
  // Ne propose que si formulaire vierge
  const hasName = (document.getElementById('promptName')?.value||'').trim().length>0;
  if (hasName) return;
  if (confirm('Une sauvegarde automatique récente a été trouvée. Restaurer ?')){
    try{ importModel(JSON.parse(a.model)); toast('Autosave restaurée','success'); }
    catch{ /* ignore */ }
  }
}

function init(){
  ai.render('aiBehaviorGrid');

  const pn = document.getElementById('promptName');
  if (pn){
    const syncTitle = ()=>{
      const v = pn.value?.trim();
      document.title = v ? `${v} — Générateur de Prompts v5` : 'Générateur de Prompts – v5';
    };
    pn.addEventListener('input', syncTitle); syncTitle();
  }

  bindToggles();
  ensureActionsRowSticky();

  document.getElementById('parseManifestBtn')?.addEventListener('click', ()=>{
    const raw = (document.getElementById('manifestInput')?.value || '').trim();
    try {
      if (raw) window.__template_manifest__ = JSON.parse(raw);
      renderSummary();
      wireManifestAutocomplete();
      toast('Manifeste analysé','success');
      buildAndPreview();
    } catch (e) {
      toast('Manifeste invalide','error'); alert('Manifeste invalide: ' + e.message);
    }
  });

  document.getElementById('addInstructionBtn')?.addEventListener('click', ()=>{ addInstructionAndWire(); });

  const form = document.getElementById('promptForm');
  form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    try {
      const rep = buildAndPreview();
      const errs = rep?.errors?.length||0, warns = rep?.warnings?.length||0;
      if (errs) { toast(`${errs} erreur(s), ${warns} avertissement(s)`,'error', 3500); }
      else if (warns){ toast(`${warns} avertissement(s)`,'warn'); }
      else { toast('JSON conforme','success'); }
    } catch (err) {
      console.error('submit failed:', err);
      toast('Erreur génération','error', 3000);
      alert('Erreur génération: ' + err.message);
    }
  });

  document.getElementById('copyJsonBtn')?.addEventListener('click', async ()=>{
    if (!latest) return;
    const ok = await copyToClipboard(latest);
    toast(ok?'Copié dans le presse-papiers':'Copie indisponible', ok?'success':'warn');
  });
  document.getElementById('downloadJsonBtn')?.addEventListener('click', ()=>{
    const payload = latest || '{}';
    download(`prompt-${new Date().toISOString().slice(0,10)}.json`, payload, 'application/json');
    toast('JSON téléchargé','success');
  });
  document.getElementById('downloadTxtBtn')?.addEventListener('click', ()=>{
    if (!latest) return;
    const txt = toTXT(JSON.parse(latest));
    download(`prompt-${new Date().toISOString().slice(0,10)}.txt`, txt, 'text/plain');
    toast('TXT téléchargé','success');
  });

  // Import JSON modèle
  const importBtn = document.getElementById('importJsonBtn');
  const importInp = document.getElementById('importJsonFile');
  importBtn?.addEventListener('click', ()=> importInp?.click());
  importInp?.addEventListener('change', async (e)=>{
    const f = e.target.files?.[0]; if (!f) return;
    try{
      const txt = await f.text();
      const obj = JSON.parse(txt);
      importModel(obj);
      const rep = buildAndPreview();
      const errs = rep?.errors?.length||0, warns = rep?.warnings?.length||0;
      if (errs) toast(`Importé avec ${errs} erreur(s), ${warns} avertissement(s)`, 'warn', 3500);
      else toast('Import JSON effectué', 'success');
    }catch(err){
      console.error('import failed', err);
      toast('Import JSON invalide','error', 3500);
      alert('Import JSON invalide: '+err.message);
    }finally{ e.target.value = ''; }
  });

  // Presets + Historique
  wirePresetsUI();

  // KBD + Live preview
  wireShortcuts();
  wireLivePreview();
  wireManifestAutocomplete();

  offerRestore();
  buildAndPreview();
}

function boot(){ try { init(); } catch(e){ console.error('[v5] init failed:', e); alert('Erreur init: '+e.message); } }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();