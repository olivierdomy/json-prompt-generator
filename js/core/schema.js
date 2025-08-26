// Construction du modèle final + TXT lisible.
export function buildModel({ai_profile, metadata, template, template_manifest, timeline}){
  const out={ ai_profile: ai_profile||{}, metadata: metadata||{}, timeline: timeline||[] };
  if(template) out.template = template;
  if(template_manifest) out.template_manifest = template_manifest;
  return out;
}
export function toTXT(model){
  const m=model;
  let txt=`🎯 Objectif : ${m.metadata?.objectifPrincipal||''}\n`;
  txt+=`📂 Contexte : ${m.metadata?.contexte||''}\n`;
  txt+=`👤 Rôle : ${m.metadata?.role||''}\n`;
  txt+=`\n📋 Instructions : ${m.timeline?.length||0}\n`;
  return txt;
}