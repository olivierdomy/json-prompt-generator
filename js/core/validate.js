export const requireText = (id)=>{
  const el=document.getElementById(id);
  return !!(el && el.value && el.value.trim());
};
export const assert = (cond, msg)=>{ if(!cond) throw new Error(msg||'Validation error'); };