// Rendu + collecte du bloc "Comportement de l’IA".
const F=[
  ['reasoning_level','Niveau de raisonnement :',['','Automatique','Rapide','Élevé','Expert']],
  ['factuality','Fiabilité des données :',['','Créatif','Intermédiaire','Raisonné','Strictement factuel']],
  ['compliance','Rigueur de conformité :',['','Créatif','Vérification légère','Contrôle par règles','Sans compromis']],
  ['depth','Profondeur d’analyse :',['','Superficielle','Standard','Approfondie','Exhaustive']],
  ['autonomy','🔁 Degré d’autonomie :',['','Aucune','Faible','Modérée','Maximale']],
  ['reformulation','🧠 Reformulation :',['','Texte brut','Reformulation légère','Reformulation optimisée','Libre']],
  ['uncertainty','🧩 Gestion des incertitudes :',['','Ne pas répondre','Hypothèses','Alternatives','Questions client']]
];

export function render(containerId){
  const c=document.getElementById(containerId);
  c.innerHTML='';
  const grid=document.createElement('div');
  grid.style.display='grid';
  grid.style.gridTemplateColumns='repeat(auto-fit,minmax(260px,1fr))';
  grid.style.gap='12px 16px';
  for(const [k,label,opts] of F){
    const w=document.createElement('div');
    const L=document.createElement('label'); L.textContent=label;
    const s=document.createElement('select'); s.id=k;
    for(const o of opts){ const e=document.createElement('option'); e.value=o; e.textContent=o; s.appendChild(e); }
    w.append(L,s); grid.appendChild(w);
  }
  c.appendChild(grid);
}
export function collect(){
  const out={}; for(const [k] of F){ const el=document.getElementById(k); out[k]=el?el.value:''; }
  return out;
}