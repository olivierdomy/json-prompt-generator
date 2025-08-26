// js/features/presets.js
import { listPresets, savePreset, deletePreset, getPreset,
         exportPresetPayload, importPresetPayload,
         historyList, historyClear, historyGet } from '../core/storage.js';
import { download } from './exporter.js';
import { importModel } from './importer.js';
import { toast } from '../core/toast.js';

export function wirePresetsUI(){
  fillPresetList();
  fillHistory();

  // Boutons presets
  document.getElementById('savePresetBtn')?.addEventListener('click', ()=>saveCurrentAsPreset());
  document.getElementById('updatePresetBtn')?.addEventListener('click', ()=>updateSelectedPreset());
  document.getElementById('loadPresetBtn')?.addEventListener('click', ()=>loadSelectedPreset());
  document.getElementById('deletePresetBtn')?.addEventListener('click', ()=>deleteSelectedPreset());
  document.getElementById('exportPresetBtn')?.addEventListener('click', ()=>exportSelectedPreset());

  const impBtn = document.getElementById('importPresetBtn');
  const impInp = document.getElementById('importPresetFile');
  impBtn?.addEventListener('click', ()=>impInp?.click());
  impInp?.addEventListener('change', async (e)=>{
    const f = e.target.files?.[0]; if(!f) return;
    try{
      const txt = await f.text();
      const {name} = importPresetPayload(txt);
      toast(`Preset importé: ${name}`,'success');
      fillPresetList();
    }catch(err){
      toast('Preset invalide','error');
      alert('Preset invalide: '+err.message);
    }finally{ e.target.value = ''; }
  });

  // Historique
  document.getElementById('historyRefreshBtn')?.addEventListener('click', ()=>fillHistory());
  document.getElementById('historyClearBtn')?.addEventListener('click', ()=>{
    historyClear(); fillHistory(); toast('Historique vidé','success');
  });
  document.getElementById('historyList')?.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-ts]'); if(!btn) return;
    const ts = btn.dataset.ts;
    const str = historyGet(ts);
    if(!str){ toast('Version introuvable','error'); return; }
    try{
      const model = JSON.parse(str);
      importModel(model);
      toast('Version restaurée','success');
    }catch(err){
      toast('Version corrompue','error');
      alert('Version corrompue: '+err.message);
    }
  });

  // Sélection dans la liste des presets
  const sel = document.getElementById('presetList');
  sel?.addEventListener('change', ()=>{
    const has = !!sel.value;
    document.getElementById('updatePresetBtn')?.toggleAttribute('disabled', !has);
    document.getElementById('loadPresetBtn')?.toggleAttribute('disabled', !has);
    document.getElementById('deletePresetBtn')?.toggleAttribute('disabled', !has);
    document.getElementById('exportPresetBtn')?.toggleAttribute('disabled', !has);
  });
}

function fillPresetList(){
  const sel = document.getElementById('presetList'); if(!sel) return;
  const list = listPresets();
  sel.innerHTML = `<option value="">— sélectionner —</option>` +
    list.map(p=>`<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)} · ${fmtDate(p.updated_at)}</option>`).join('');
  // boutons désactivés par défaut
  document.getElementById('updatePresetBtn')?.setAttribute('disabled','');
  document.getElementById('loadPresetBtn')?.setAttribute('disabled','');
  document.getElementById('deletePresetBtn')?.setAttribute('disabled','');
  document.getElementById('exportPresetBtn')?.setAttribute('disabled','');
}

function saveCurrentAsPreset(){
  const name = (document.getElementById('presetName')?.value||'').trim();
  if(!name){ toast('Nom de modèle requis','warn'); return; }
  const str = document.getElementById('jsonPreview')?.textContent||'';
  if(!str){ toast('JSON vide','warn'); return; }
  try{
    savePreset(name, JSON.parse(str)); fillPresetList(); toast('Modèle sauvegardé','success');
  }catch(err){ toast('Échec sauvegarde','error'); alert(err.message); }
}
function updateSelectedPreset(){
  const sel = document.getElementById('presetList');
  const cur = sel?.value; if(!cur){ toast('Aucun modèle sélectionné','warn'); return; }
  const str = document.getElementById('jsonPreview')?.textContent||'';
  if(!str){ toast('JSON vide','warn'); return; }
  try{
    savePreset(cur, JSON.parse(str)); fillPresetList(); toast('Modèle mis à jour','success');
  }catch(err){ toast('Échec mise à jour','error'); alert(err.message); }
}
function loadSelectedPreset(){
  const sel = document.getElementById('presetList');
  const cur = sel?.value; if(!cur){ toast('Aucun modèle sélectionné','warn'); return; }
  const p = getPreset(cur); if(!p){ toast('Modèle introuvable','error'); return; }
  importModel(p.model); toast('Modèle chargé','success');
}
function deleteSelectedPreset(){
  const sel = document.getElementById('presetList');
  const cur = sel?.value; if(!cur){ toast('Aucun modèle sélectionné','warn'); return; }
  if(!confirm(`Supprimer le modèle "${cur}" ?`)) return;
  deletePreset(cur); fillPresetList(); toast('Modèle supprimé','success');
}
function exportSelectedPreset(){
  const sel = document.getElementById('presetList');
  const cur = sel?.value; if(!cur){ toast('Aucun modèle sélectionné','warn'); return; }
  try{
    const payload = exportPresetPayload(cur);
    download(`preset-${sanitize(cur)}.json`, payload, 'application/json');
    toast('Preset exporté','success');
  }catch(err){ toast('Échec export','error'); alert(err.message); }
}

function fillHistory(){
  const box = document.getElementById('historyList'); if(!box) return;
  const list = historyList();
  if(!list.length){ box.innerHTML = '<div class="muted">Aucune version</div>'; return; }
  box.innerHTML = list
    .map(i=>`<div class="hist">
      <div><strong>${fmtDate(i.ts)}</strong> · ${i.size||0} o · <code>${i.hash||''}</code></div>
      <div><button type="button" data-ts="${i.ts}">Restaurer</button></div>
    </div>`).join('');
}

const escapeHtml = s => String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
const sanitize = s => s.replace(/[^\w\-]+/g,'_');
const fmtDate = iso => new Date(iso).toLocaleString();