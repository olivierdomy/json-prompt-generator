import { buildImage } from './images.js';
import { autoSizeFromManifest } from './ppt.js';
import { getManifest } from './manifest.js';

let seq=0;

export function addInstruction(){
  seq+=1; const i=seq;
  const c=document.getElementById('instructionsContainer');
  const d=document.createElement('div'); d.className='panel'; d.id=`seq${i}`;
  d.innerHTML=`
    <h4>Instruction ${i}</h4>
    <label>Action</label><textarea id="action${i}" rows="2"></textarea>
    <label>Format</label><input id="format${i}">
    <label>Exemple</label><textarea id="example${i}" rows="2"></textarea>
    <label>Vérifications</label><textarea id="verif${i}" rows="2"></textarea>

    <label class="inline"><input type="checkbox" id="genImg${i}"> Générer une image</label>

    <div class="panel hidden" id="imgBlock${i}" data-img-section>
      <div class='row'>
        <div class='col'><label>Style</label>
          <select id="imgStyleKey${i}">
            <option value="">Hériter</option><option value="ligne_claire">Ligne claire</option>
            <option value="flat">Flat</option><option value="isometrique">Isométrique</option>
            <option value="lowpoly3d">3D low-poly</option><option value="blueprint">Blueprint</option>
            <option value="doodle">Doodle</option><option value="photostudio">Photo studio</option>
            <option value="pixelart">Pixel art</option>
          </select>
        </div>
        <div class='col'><label>Fit</label><select id="imgFit${i}"><option value="">Hériter</option><option>contain</option><option>cover</option><option>fill</option></select></div>
        <div class='col'><label>Fond</label><select id="imgBg${i}"><option value="">Hériter</option><option value="transparent">Transparent</option><option value="opaque">Opaque</option></select></div>
        <div class='col'><label>Taille</label><input id="imgSizeWH${i}" placeholder="auto si vide"></div>
      </div>
      <label>Prompt de scène</label><textarea id="imgScene${i}" rows="2"></textarea>
      <label class="inline"><input type="checkbox" id="imgNegStd${i}" checked> Négatifs standard</label>
    </div>

    <div class="panel" id="pptBlock${i}" data-pp-section>
      <h4>PPT</h4>
      <label>Layout spécifique (optionnel)</label><input id="layoutId${i}" placeholder="S03_TitleBodyPictureRight" list="listLayouts">
      <div class="row">
        <div class="col"><label>Title → name</label><input id="phTitleName${i}" placeholder="ph_title" list="listPlaceholders"><label>alias/idx</label><input id="phTitleAlias${i}" placeholder="title"><input id="phTitleIdx${i}" type="number" min="0"></div>
        <div class="col"><label>Body → name</label><input id="phBodyName${i}" placeholder="ph_body" list="listPlaceholders"><label>alias/idx</label><input id="phBodyAlias${i}" placeholder="body"><input id="phBodyIdx${i}" type="number" min="0"></div>
        <div class="col"><label>Picture → name</label><input id="phPicName${i}" placeholder="ph_picture" list="listPlaceholders"><label>alias/idx</label><input id="phPicAlias${i}" placeholder="picture"><input id="phPicIdx${i}" type="number" min="0"></div>
      </div>
    </div>`;
  c.appendChild(d);

  // Visibilité Image: uniquement si global Image ET case séquence cochées
  const imgChk = document.getElementById(`genImg${i}`);
  const imgBlk = document.getElementById(`imgBlock${i}`);
  const globalImg = document.getElementById('enableImages');
  const syncImgVisibility = ()=>{
    const visible = !!(globalImg?.checked && imgChk?.checked);
    imgBlk.classList.toggle('hidden', !visible);
  };
  imgChk.addEventListener('change', syncImgVisibility);
  globalImg?.addEventListener('change', syncImgVisibility);
  syncImgVisibility(); // démarre caché

  // Visibilité PPT: suit le toggle global
  const pptBlk = document.getElementById(`pptBlock${i}`);
  const globalPpt = document.getElementById('enablePowerPoint');
  const syncPptVisibility = ()=>{ pptBlk.classList.toggle('hidden', !globalPpt?.checked); };
  globalPpt?.addEventListener('change', syncPptVisibility);
  syncPptVisibility();

  return i;
}

export function wireAutocompleteForNewSeq(i){
  // met à jour la datalist des placeholders selon le layout choisi
  const onLayoutChange = ()=>{
    const lid = document.getElementById(`layoutId${i}`)?.value || document.getElementById('defaultLayoutId')?.value || '';
    const mf = getManifest(); if(!mf?.layouts || !lid) return;
    const entry = mf.layouts[lid]; if(!entry) return;

    let dl = document.getElementById('listPlaceholders');
    if (!dl){ dl = document.createElement('datalist'); dl.id='listPlaceholders'; document.body.appendChild(dl); }
    dl.innerHTML = '';
    (entry.placeholders||[]).forEach(p=>{
      const o=document.createElement('option'); o.value=p.name || `idx:${p.idx}`; dl.appendChild(o);
    });
    // attache
    ['phTitleName','phBodyName','phPicName'].forEach(k=>{
      const el = document.getElementById(`${k}${i}`); if(el) el.setAttribute('list','listPlaceholders');
    });
  };
  document.getElementById(`layoutId${i}`)?.addEventListener('input', onLayoutChange);
  onLayoutChange(); // init avec layout par défaut si présent
}

export function collectSequences(){
  const out=[]; for(let i=1;i<=seq;i++){
    const s={
      sequence:i,
      action:(document.getElementById(`action${i}`)?.value||''),
      format:(document.getElementById(`format${i}`)?.value||''),
      exemple:(document.getElementById(`example${i}`)?.value||''),
      verifications:(document.getElementById(`verif${i}`)?.value||'')
    };
    if(document.getElementById('enablePowerPoint')?.checked){
      const lid=(document.getElementById(`layoutId${i}`)?.value||'').trim();
      if(lid) s.layout_id=lid;
      s.targets={
        title:{placeholder_name:(document.getElementById(`phTitleName${i}`)?.value||''), alias:(document.getElementById(`phTitleAlias${i}`)?.value||''), idx:toInt(document.getElementById(`phTitleIdx${i}`)?.value)},
        body:{placeholder_name:(document.getElementById(`phBodyName${i}`)?.value||''), alias:(document.getElementById(`phBodyAlias${i}`)?.value||''), idx:toInt(document.getElementById(`phBodyIdx${i}`)?.value)},
        picture:{placeholder_name:(document.getElementById(`phPicName${i}`)?.value||''), alias:(document.getElementById(`phPicAlias${i}`)?.value||''), idx:toInt(document.getElementById(`phPicIdx${i}`)?.value)}
      };
    }
    const gen = document.getElementById(`genImg${i}`)?.checked && document.getElementById('enableImages')?.checked;
    s.generate_image = !!gen;
    if(gen){
      const local={
        style_key:(document.getElementById(`imgStyleKey${i}`)?.value||''),
        fit:(document.getElementById(`imgFit${i}`)?.value||''),
        bg:(document.getElementById(`imgBg${i}`)?.value||''),
        size:(document.getElementById(`imgSizeWH${i}`)?.value||''),
        scene:(document.getElementById(`imgScene${i}`)?.value||''),
        negStd:document.getElementById(`imgNegStd${i}`)?.checked!==false
      };
      if(!local.size && document.getElementById('enablePowerPoint')?.checked){
        const lname = s.layout_id || document.getElementById('defaultLayoutId')?.value || '';
        if(lname && s.targets?.picture){
          local.size = autoSizeFromManifest(lname, s.targets.picture.placeholder_name || s.targets.picture.idx || 'ph_picture');
        }
      }
      const gp = window.__meta_image_policy__ || {fit:'contain', background:'transparent'};
      s.image = buildImage(gp, local);
    }
    out.push(s);
  }
  return out;
}
const toInt = v => { const n=parseInt(v,10); return Number.isFinite(n)?n:null; };

export function resetTimeline(){
  const c = document.getElementById('instructionsContainer');
  if (c) c.innerHTML = '';
  // réinitialise le compteur local
  // eslint-disable-next-line no-global-assign
  seq = 0;
}