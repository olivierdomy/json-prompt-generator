// js/features/importer.js
import { renderSummary } from './manifest.js';
import { addInstruction, resetTimeline, wireAutocompleteForNewSeq } from './timeline.js';

const setVal = (ids, v) => {
  for (const id of Array.isArray(ids)?ids:[ids]){
    const el = document.getElementById(id);
    if (el){ el.value = v ?? ''; el.dispatchEvent(new Event('input', {bubbles:true})); return true; }
  }
  return false;
};
const setChk = (id, on) => {
  const el = document.getElementById(id);
  if (el){ el.checked = !!on; el.dispatchEvent(new Event('change', {bubbles:true})); }
};

export function importModel(model){
  if (!model || typeof model !== 'object') throw new Error('Modèle JSON invalide');

  // 1) Toggles globaux
  const pptOn = !!model.template;
  const imgOn = !!model.metadata?.image_policy;
  setChk('enablePowerPoint', pptOn);
  setChk('enableImages', imgOn);

  // 2) AI profile
  const ai = model.ai_profile || {};
  setVal('reasoning_level', ai.reasoning_level||'');
  setVal('factuality',      ai.factuality||'');
  setVal('compliance',      ai.compliance||'');
  setVal('depth',           ai.depth||'');
  setVal('autonomy',        ai.autonomy||'');
  setVal('reformulation',   ai.reformulation||'');
  setVal('uncertainty',     ai.uncertainty||'');

  // 3) Métadonnées
  const md = model.metadata || {};
  setVal('promptName',        md.prompt_name||'');
  setVal(['objectifPrincipal','objectif','goal'], md.objectifPrincipal||'');
  setVal(['contexte','context'], md.contexte||'');
  setVal(['role','userRole'],   md.role||'');

  if (imgOn){
    const ip = md.image_policy || {};
    setVal(['imageConcept','imgConcept'], ip.concept||'');
    setVal(['imageFit','imgFitGlobal'],   ip.fit||'');
    setVal(['imageStyleKey','imgStyleKeyGlobal'], ip.style_key||'');
    setVal(['imageStyleHint','imgStyleHint'],     ip.style_hint||'');
    setVal(['imageBackground','imgBackground'],   ip.background||ip.bg||'');
    setVal(['imageSizeMode','imgSizeMode'],       ip.size_mode||'');
    setVal(['imageDefaultSize','imgDefaultSize'], ip.default_size||'');
    const neg = document.getElementById('imageNegativeDefault');
    if (neg){ neg.checked = !!ip.negative_prompt_default; neg.dispatchEvent(new Event('change',{bubbles:true})); }
  }

  // 4) PPT global + manifeste
  if (pptOn){
    const lid = model.template?.layout_id || '';
    setVal('defaultLayoutId', lid);

    if (model.template_manifest && typeof model.template_manifest === 'object'){
      window.__template_manifest__ = model.template_manifest;
      renderSummary();
    }
  }

  // 5) Timeline
  resetTimeline();
  for (const s of (model.timeline||[])){
    const i = addInstruction();

    // Texte
    setVal(`action${i}`,  s.action||'');
    setVal(`format${i}`,  s.format||'');
    setVal(`example${i}`, s.exemple||'');
    setVal(`verif${i}`,   s.verifications||'');

    // PPT séquence
    if (pptOn){
      const lid = s.layout_id || '';
      setVal(`layoutId${i}`, lid);
      wireAutocompleteForNewSeq(i); // prépare la datalist selon layout

      const t = s.targets || {};
      if (t.title){
        setVal(`phTitleName${i}`,  t.title.placeholder_name||'');
        setVal(`phTitleAlias${i}`, t.title.alias||'');
        setVal(`phTitleIdx${i}`,   (t.title.idx??'')==='null'?'':t.title.idx??'');
      }
      if (t.body){
        setVal(`phBodyName${i}`,  t.body.placeholder_name||'');
        setVal(`phBodyAlias${i}`, t.body.alias||'');
        setVal(`phBodyIdx${i}`,   (t.body.idx??'')==='null'?'':t.body.idx??'');
      }
      if (t.picture){
        setVal(`phPicName${i}`,  t.picture.placeholder_name||'');
        setVal(`phPicAlias${i}`, t.picture.alias||'');
        setVal(`phPicIdx${i}`,   (t.picture.idx??'')==='null'?'':t.picture.idx??'');
      }
    }

    // Image séquence
    setChk(`genImg${i}`, !!s.generate_image);
    if (s.generate_image){
      const im = s.image || {};
      setVal(`imgStyleKey${i}`, im.style_key||'');
      setVal(`imgFit${i}`,      im.fit||'');
      setVal(`imgBg${i}`,       im.background||im.bg||'');
      setVal(`imgSizeWH${i}`,   im.size||'');
      setVal(`imgScene${i}`,    im.scene||'');
      const ns = document.getElementById(`imgNegStd${i}`);
      if (ns){ ns.checked = im.negStd!==false; ns.dispatchEvent(new Event('change',{bubbles:true})); }
    }
  }
}