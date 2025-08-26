// js/core/toast.js
let holder = null;
export function toast(msg, type='info', ms=2200){
  if(!holder){
    holder = document.createElement('div');
    holder.id = 'toasts';
    document.body.appendChild(holder);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  holder.appendChild(el);
  // focus dismiss
  el.tabIndex = 0;
  el.addEventListener('click', ()=>el.remove());
  setTimeout(()=>{ el.classList.add('show'); }, 10);
  setTimeout(()=>{ el.classList.remove('show'); el.addEventListener('transitionend', ()=>el.remove(), {once:true}); }, ms);
}