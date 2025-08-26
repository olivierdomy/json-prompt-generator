// js/core/validate.js
// Contrôles de cohérence : héritage global vs overrides, PPT/layout/placeholders, images.

const FITS = new Set(['contain','cover','fill','']);
const BG   = new Set(['transparent','opaque','']);

/**
 * Valide le modèle complet.
 * @param {object} model - prompt généré
 * @param {object|null} manifest - manifeste PPT optionnel
 * @returns {{errors:Array,warnings:Array}}
 */
export function validateModel(model, manifest){
  const issues = [];

  const pptOn  = !!model?.template;
  const imgOn  = !!model?.metadata?.image_policy;
  const defLayout = model?.template?.layout_id || '';

  const layouts = manifest?.layouts || {};
  const hasManifest = Object.keys(layouts).length > 0;

  for (const s of model?.timeline || []){
    // --- Images séquence ---
    if (s.generate_image){
      if (!imgOn){
        issues.push(warn(`Image séquence active mais image globale désactivée`, `genImg${s.sequence}`));
      }
      const im = s.image || {};
      const fit = im.fit || '';
      const bg  = im.background ?? im.bg ?? '';
      const size= im.size || '';

      if (!FITS.has(fit)) issues.push(err(`fit invalide: "${fit}"`, `imgFit${s.sequence}`));
      if (!BG.has(bg))    issues.push(err(`fond invalide: "${bg}"`, `imgBg${s.sequence}`));
      if (size && !/^\d{2,5}x\d{2,5}$/.test(size)) issues.push(err(`taille invalide (attendu "WxH")`, `imgSizeWH${s.sequence}`));

      if (pptOn && !size){
        const layoutId = resolveLayoutId(s, defLayout);
        if (!layoutId) {
          issues.push(warn(`pas de layout valide → taille auto impossible`, `layoutId${s.sequence}`));
        } else {
          const picPH = resolvePictureTarget(layouts, s, defLayout);
          if (!picPH) issues.push(warn(`picture introuvable pour calcul auto`, `phPicName${s.sequence}`));
        }
      }
    } else {
      // champs image saisis alors que la case est décochée
      if (hasAny([`imgStyleKey${s.sequence}`,`imgFit${s.sequence}`,`imgBg${s.sequence}`,`imgSizeWH${s.sequence}`,`imgScene${s.sequence}`])){
        issues.push(warn(`champs image renseignés alors que "Générer une image" est décoché`, `genImg${s.sequence}`));
      }
    }

    // --- PPT séquence ---
    if (!pptOn){
      if (s.layout_id || hasTargets(s)) {
        issues.push(warn(`cibles PPT renseignées alors que PowerPoint global est désactivé`, `layoutId${s.sequence}`));
      }
    } else {
      const layoutId = resolveLayoutId(s, defLayout);
      if (!layoutId){
        issues.push(err(`layout manquant (séquence ou global)`, `layoutId${s.sequence}`));
      } else if (!layouts[layoutId]){
        issues.push(err(`layout inconnu: "${layoutId}"`, `layoutId${s.sequence}`));
      } else {
        const entry = layouts[layoutId];
        const PH = entry?.placeholders || [];
        const IDXOK  = new Set(PH.map(p=>p.idx));
        const NAMEOK = new Set(PH.map(p=>p.name));
        const alias  = entry?.aliases || {};

        const okT = checkTarget(issues, 'title',   s.targets?.title,   NAMEOK, IDXOK, alias, s.sequence);
        const okB = checkTarget(issues, 'body',    s.targets?.body,    NAMEOK, IDXOK, alias, s.sequence);
        const okP = checkTarget(issues, 'picture', s.targets?.picture, NAMEOK, IDXOK, alias, s.sequence);

        if (s.generate_image && okP){
          const found = findPH(PH, s.targets?.picture) || fromAlias(PH, alias?.picture);
          if (found && (found.type?.name!=='PICTURE' && found.type!=='PICTURE')){
            issues.push(warn(`"picture" pointe un placeholder non-PICTURE`, `phPicName${s.sequence}`));
          }
        }
      }
    }
  }

  return split(issues);
}

/* ---------------- Helpers modèle ---------------- */

function resolveLayoutId(s, def){ return s?.layout_id || def || ''; }
function hasTargets(s){ return !!(s?.targets && (s.targets.title||s.targets.body||s.targets.picture)); }
function hasAny(ids){ return ids.some(id => (document.getElementById(id)?.value||'').trim().length>0); }

/**
 * Trouve un placeholder par name ou idx.
 */
function findPH(list, t){
  if (!t) return null;
  const name = t.placeholder_name?.trim();
  const hasIdx = t.idx !== null && t.idx !== undefined && t.idx !== '';
  if (name) return list.find(p=>p.name===name) || null;
  if (hasIdx) return list.find(p=>p.idx===Number(t.idx)) || null;
  return null;
}

/**
 * À partir d'un alias {name,idx}, retourne le placeholder.
 */
function fromAlias(list, a){
  if (!a) return null;
  if (a.name) {
    const byName = list.find(p=>p.name===a.name);
    if (byName) return byName;
  }
  if (a.idx !== null && a.idx !== undefined){
    const byIdx = list.find(p=>p.idx===Number(a.idx));
    if (byIdx) return byIdx;
  }
  return null;
}

/**
 * Résout le placeholder "picture" effectif pour une séquence.
 */
function resolvePictureTarget(layouts, s, defLayout){
  const layoutId = resolveLayoutId(s, defLayout);
  if (!layoutId) return null;
  const entry = layouts?.[layoutId];
  if (!entry) return null;
  const PH = entry.placeholders || [];
  const aliases = entry.aliases || {};
  const t = s.targets?.picture || null;

  // 1) Cible de la séquence
  const fromSeq = findPH(PH, t);
  if (fromSeq) return fromSeq;
  if (t?.alias) {
    const byAlias = fromAlias(PH, aliases[t.alias]);
    if (byAlias) return byAlias;
  }
  // 2) Alias "picture" du layout
  return fromAlias(PH, aliases.picture);
}

/**
 * Vérifie une cible (title/body/picture) contre name/idx/alias.
 */
function checkTarget(issues, key, t, NAMEOK, IDXOK, alias, seq){
  if (!t) return true;
  const idName = idFor(key,'Name',seq);
  const idIdx  = idFor(key,'Idx',seq);
  const idAli  = idFor(key,'Alias',seq);

  const hasName = !!(t.placeholder_name||'').trim();
  const hasIdx  = t.idx !== null && t.idx !== undefined && t.idx !== '';
  const hasAlias= !!(t.alias||'').trim();

  if (!hasName && !hasIdx && !hasAlias) return true;

  if (hasName && !NAMEOK.has(t.placeholder_name)) {
    issues.push(err(`"${key}": placeholder_name inconnu "${t.placeholder_name}"`, idName));
    return false;
  }
  if (hasIdx && !IDXOK.has(Number(t.idx))) {
    issues.push(err(`"${key}": idx inconnu "${t.idx}"`, idIdx));
    return false;
  }
  if (hasAlias && !(t.alias in alias)) {
    issues.push(err(`"${key}": alias inconnu "${t.alias}"`, idAli));
    return false;
  }
  return true;
}

function idFor(key,suffix,seq){
  if (key==='title')   return `phTitle${suffix}${seq}`;
  if (key==='body')    return `phBody${suffix}${seq}`;
  if (key==='picture') return `phPic${suffix}${seq}`;
  return '';
}

/* ---------------- Fabrication du rapport ---------------- */

const err  = (m, id)=>({level:'error', msg:m, el:id});
const warn = (m, id)=>({level:'warn',  msg:m, el:id});

function split(list){
  return {
    errors: list.filter(x=>x.level==='error'),
    warnings: list.filter(x=>x.level==='warn')
  };
}

/* ---------------- UI ---------------- */

export function clearValidationUI(){
  document.querySelectorAll('.is-error,.is-warn').forEach(el=>el.classList.remove('is-error','is-warn'));
  const box = document.getElementById('issuesBox');
  if (box) box.innerHTML='';
}

export function applyValidationUI({errors, warnings}){
  [...errors, ...warnings].forEach(it=>{
    if (!it.el) return;
    const el = document.getElementById(it.el);
    if (el) el.classList.add(it.level==='error'?'is-error':'is-warn');
  });
  const box = ensureIssuesBox();
  const lines = [];
  if (errors.length)   lines.push(`<div class="badge error">${errors.length} erreur(s)</div>`);
  if (warnings.length) lines.push(`<div class="badge warn">${warnings.length} avertissement(s)</div>`);
  if (errors.length || warnings.length){
    lines.push('<ul>');
    for (const it of [...errors,...warnings]){
      lines.push(`<li>${escapeHtml(it.msg)}${it.el?` <code>#${it.el}</code>`:''}</li>`);
    }
    lines.push('</ul>');
  } else {
    lines.push('<div class="badge success">Aucun problème</div>');
  }
  box.innerHTML = lines.join('');
}

function ensureIssuesBox(){
  let box = document.getElementById('issuesBox');
  if (!box){
    box = document.createElement('div');
    box.id='issuesBox';
    box.className='panel';
    const form = document.getElementById('promptForm');
    form?.insertBefore(box, form.firstChild);
  }
  return box;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,(m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}