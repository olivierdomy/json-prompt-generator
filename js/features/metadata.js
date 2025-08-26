// Collecte métadonnées + image_policy globale.
export function collect(){
  const meta={
    prompt_name:document.getElementById('promptName').value||'',
    objectifPrincipal:document.getElementById('mainObjective').value||'',
    contexte:document.getElementById('context').value||'',
    role:document.getElementById('globalRole').value||''
  };
  const imgEnabled = document.getElementById('enableImages').checked;
  if(imgEnabled){
    meta.image_policy={
      concept:document.getElementById('imageConcept').value||'',
      fit:document.getElementById('imageFitSel').value||'contain',
      style_key:document.getElementById('imageStyleKey').value||'',
      style_hint:document.getElementById('imageStyle').value||'',
      background:document.getElementById('imageBgSel').value||'transparent',
      size_mode:document.getElementById('imageSizeMode').value||'auto',
      default_size:document.getElementById('imageSizeWH').value||'',
      negative_prompt_default:document.getElementById('imageNegStd').checked
        ? 'photo réaliste, grain, watermark, texte, logos, personnages licenciés' : ''
    };
  }
  return meta;
}