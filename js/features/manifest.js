// js/features/manifest.js
// Parsing, stockage global compatible v4.9, et rendu du résumé.

let TM = null; // Template Manifest courant

function normalizeManifest(obj){
  // Accepte un objet "brut" ou { template_manifest: {...} }
  if (obj && typeof obj === 'object' && obj.template_manifest) {
    return obj.template_manifest;
  }
  return obj || null;
}

/**
 * Charge un manifeste depuis une chaîne JSON ou un objet.
 * Dépose aussi TM dans window.__template_manifest__ pour compatibilité descendante.
 */
export function loadManifest(raw){
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  TM = normalizeManifest(parsed);
  // Compat v4.9 / autres modules
  window.__template_manifest__ = TM;
  return TM;
}

export const getManifest = () => TM;

/**
 * Rend un résumé tabulaire du manifeste.
 * @param {string} containerId - id du conteneur texte (par défaut #manifestInfo)
 */
export function renderSummary(containerId = 'manifestInfo'){
  const wrap = document.getElementById('manifestSummary');
  const info = document.getElementById(containerId);
  if (!info) return;

  if (!TM){
    info.innerHTML = '<em>Aucun manifeste chargé.</em>';
    if (wrap) wrap.classList.remove('hidden');
    return;
  }

  const safeType = (t) => {
    if (!t) return '';
    if (typeof t === 'string') return t;
    if (typeof t === 'object') return t.name || '';
    return '';
  };

  let html = `<b>Fichier:</b> ${TM.file || '(non spécifié)'} &nbsp; `
    + `<b>Taille slide (in):</b> ${TM.slide_width_in || '?'} × ${TM.slide_height_in || '?'}<br>`;

  html += `<table style="border-collapse:collapse;width:100%;margin-top:8px" border="1" cellpadding="6">`;
  html += `<tr><th>Layout</th><th>Aliases</th><th>Placeholders (idx:type:name)</th></tr>`;

  const layouts = TM.layouts || {};
  for (const [lname, entry] of Object.entries(layouts)){
    const aliases = entry?.aliases || {};
    const aliasTxt = ['title','subtitle','body','picture']
      .map(k => {
        const v = aliases[k];
        if (!v) return `${k}: -`;
        const t = safeType(v.type);
        return `${k}: idx ${v.idx} (${t})`;
      })
      .join(' • ');

    const phs = (entry?.placeholders || [])
      .map(p => `${p.idx}:${safeType(p.type)}:${p.name || ''}`)
      .join(', ');

    html += `<tr><td>${lname}</td><td>${aliasTxt}</td><td>${phs}</td></tr>`;
  }

  html += `</table>`;
  info.innerHTML = html;
  if (wrap) wrap.classList.remove('hidden');
}