import * as ai from './features/aiProfile.js';
import * as meta from './features/metadata.js';
import { loadManifest, renderSummary } from './features/manifest.js';
import { addInstruction, collectSequences } from './features/timeline.js';
import { bind as bindToggles } from './features/toggles.js';
import { buildModel } from './core/schema.js';
import { toJSON, toTXT, download, copyToClipboard } from './features/exporter.js';

let latest='';

function init(){
  ai.render('aiBehaviorGrid');
  bindToggles();

  document.getElementById('parseManifestBtn').addEventListener('click', ()=>{
    const raw=document.getElementById('manifestInput').value.trim();
    if(!raw){ renderSummary(); return; }
    try{ loadManifest(raw); renderSummary(); }
    catch(e){ alert('Manifeste invalide: '+e.message); }
  });

  document.getElementById('addInstructionBtn').addEventListener('click', addInstruction);
  addInstruction(); // une première

  document.getElementById('promptForm').addEventListener('submit', e=>{
    e.preventDefault();
    const ai_profile = ai.collect();
    const metadata = meta.collect();
    window.__meta_image_policy__ = metadata.image_policy || null;

    // Template et manifeste (facultatifs)
    const pptEnabled = document.getElementById('enablePowerPoint').checked;
    const template = pptEnabled && document.getElementById('defaultLayoutId').value
      ? { layout_id: document.getElementById('defaultLayoutId').value } : undefined;

    const template_manifest = window.__template_manifest__ || undefined;

    const timeline = collectSequences();
    const model = buildModel({ai_profile, metadata, template, template_manifest, timeline});
    latest = toJSON(model);
    document.getElementById('jsonPreview').textContent = latest;
    document.getElementById('copyJsonBtn').disabled = !latest;
  });

  document.getElementById('copyJsonBtn').addEventListener('click', async ()=>{
    if(!latest) return;
    const ok = await copyToClipboard(latest);
    if(!ok) alert('Copie presse-papiers non disponible.');
  });

  document.getElementById('downloadJsonBtn').addEventListener('click', ()=>{
    const payload = latest || '{}';
    download(`prompt-${new Date().toISOString().slice(0,10)}.json`, payload, 'application/json');
  });

  document.getElementById('downloadTxtBtn').addEventListener('click', ()=>{
    if(!latest) return;
    const txt = toTXT(JSON.parse(latest));
    download(`prompt-${new Date().toISOString().slice(0,10)}.txt`, txt, 'text/plain');
  });
}

init();