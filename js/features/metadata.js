// js/features/metadata.js
// Collecte robuste avec alias d’IDs + champs image étendus (DPI, min/max).

const getVal = (...ids) => {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) return (el.value ?? '').trim();
  }
  return '';
};
const getChk = (id) => !!document.getElementById(id)?.checked;

export function collect(){
  const prompt_name = getVal('promptName','prompt_name');
  const objectifPrincipal = getVal('objectifPrincipal','mainObjective','objectif','goal');
  const contexte = getVal('contexte','context');
  const role = getVal('role','userRole');

  const meta = { prompt_name, objectifPrincipal, contexte, role };

  // Image globale seulement si activée
  if (getChk('enableImages')) {
    const image_policy = {};
    const concept      = getVal('imageConcept','imgConcept');
    const fit          = getVal('imageFit','imgFitGlobal');
    const style_key    = getVal('imageStyleKey','imgStyleKeyGlobal');
    const style_hint   = getVal('imageStyleHint','imgStyleHint');
    const background   = getVal('imageBackground','imgBackground');
    const size_mode    = getVal('imageSizeMode','imgSizeMode');
    const default_size = getVal('imageDefaultSize','imgDefaultSize');
    const negative_prompt_default = getChk('imageNegativeDefault');

    // Nouveaux paramètres
    const dpiStr   = getVal('imageDPI');
    const dpiNum   = dpiStr ? parseInt(dpiStr,10) : NaN;
    const dpi      = Number.isFinite(dpiNum) ? Math.max(72, Math.min(600, dpiNum)) : undefined;
    const min_size = getVal('imageMinSize');
    const max_size = getVal('imageMaxSize');

    if (concept)      image_policy.concept = concept;
    if (fit)          image_policy.fit = fit;
    if (style_key)    image_policy.style_key = style_key;
    if (style_hint)   image_policy.style_hint = style_hint;
    if (background)   image_policy.background = background;
    if (size_mode)    image_policy.size_mode = size_mode;
    if (default_size) image_policy.default_size = default_size;
    if (dpi !== undefined) image_policy.dpi = dpi;
    if (min_size)     image_policy.min_size = min_size;
    if (max_size)     image_policy.max_size = max_size;
    if (negative_prompt_default) image_policy.negative_prompt_default = true;

    if (Object.keys(image_policy).length) meta.image_policy = image_policy;
  }

  return meta;
}

// Pas de rendu spécifique pour cette section
export function render(){ /* no-op */ }