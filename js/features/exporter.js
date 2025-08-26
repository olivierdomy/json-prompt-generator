// js/features/exporter.js
export const toJSON = obj => JSON.stringify(obj, null, 2);

export function toTXT(obj){
  const L=[];
  const md = obj.metadata || {};
  L.push(`🎯 Objectif : ${md.objectifPrincipal||''}`);
  L.push(`📂 Contexte : ${md.contexte||''}`);
  L.push(`👤 Rôle : ${md.role||''}`);

  if (md.image_policy){
    const ip=md.image_policy;
    L.push(`🖼️ Image défaut : concept="${ip.concept||''}", style="${ip.style_key||ip.style_hint||''}", fit=${ip.fit||''}, bg=${ip.background||''}, size_mode=${ip.size_mode||''} ${ip.default_size?('('+ip.default_size+')'):""}`);
  } else {
    L.push(`🖼️ Image : désactivée`);
  }

  if (obj.template || obj.template_manifest){
    L.push(`📊 PowerPoint :`);
    if (obj.template?.layout_id) L.push(`   - Layout par défaut : ${obj.template.layout_id}`);
    if (obj.template_manifest){
      const tm=obj.template_manifest;
      const layouts = Object.keys(tm.layouts||{});
      L.push(`   - Manifeste : ${tm.file||'(non spécifié)'} | Slide: ${tm.slide_width_in||'?'}×${tm.slide_height_in||'?'} (in)`);
      L.push(`   - Layouts : ${layouts.join(', ')}`);
    }
  } else {
    L.push(`📊 PowerPoint : désactivé`);
  }

  L.push(``);
  L.push(`📋 Instructions :`);
  for (const s of (obj.timeline||[])){
    L.push(``);
    L.push(`🔹 ${s.sequence}. ${s.action||''}`);
    L.push(`   ➤ Format : ${s.format||''}`);
    L.push(`   ➤ Exemple : ${s.exemple||''}`);
    L.push(`   ➤ Vérifications : ${s.verifications||''}`);
    L.push(`   ➤ Image IA : ${s.generate_image?'Oui':'Non'}`);
    if (s.generate_image && s.image){
      const im=s.image;
      L.push(`      • prompt="${im.prompt||''}"`);
      L.push(`      • fit=${im.fit||''}, bg=${im.transparent_background?'transparent':'opaque'}, size=${im.size||'(auto)'}`);
      L.push(`      • style=${im.style_key||im.style_hint||''}`);
      if (im.negative_prompt) L.push(`      • négatifs="${im.negative_prompt}"`);
    }
    if (s.layout_id || s.targets){
      L.push(`   ➤ PPT :`);
      if (s.layout_id) L.push(`      • layout_id : ${s.layout_id}`);
      if (s.targets){
        const line=(k,v)=>`      • ${k} → name="${v?.placeholder_name||''}" alias="${v?.alias||''}" idx=${(v?.idx??'')}`;
        L.push(line('title',s.targets.title||{}));
        L.push(line('body',s.targets.body||{}));
        L.push(line('picture',s.targets.picture||{}));
      }
    }
  }
  return L.join('\n');
}

export function download(filename, text, type='application/json'){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([text],{type}));
  a.download=filename; a.click();
}

export async function copyToClipboard(text){
  try{ await navigator.clipboard.writeText(text); return true; }
  catch(e){
    const ta=document.createElement('textarea'); ta.value=text;
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta); return true;
  }
}