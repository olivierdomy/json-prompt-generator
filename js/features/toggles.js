import { show } from '../core/dom.js';

export function bind(){
  const pp=document.getElementById('enablePowerPoint');
  const im=document.getElementById('enableImages');
  const toggle=()=>{ show(document.getElementById('pptOptions'), pp.checked);
                     show(document.getElementById('imageDefaults'), im.checked); };
  pp.addEventListener('change', toggle);
  im.addEventListener('change', toggle);
  toggle();
}