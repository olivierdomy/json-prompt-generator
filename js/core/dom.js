export const $  = (s,r=document)=>r.querySelector(s);
export const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
export const show = (el, v)=>{ if(!el) return; el.classList.toggle('hidden', !v); };