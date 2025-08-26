// État global simple et pub/sub minimal.
const state = { ai_profile:{}, metadata:{}, ppt:{enabled:false, defaultLayoutId:'', manifest:null}, image:{enabled:false}, timeline:[] };
const listeners = new Map(); // key -> Set<fn>

export const getState = () => state;
export function setState(patch){
  Object.assign(state, patch);
  emit('*', state);
}
export function subscribe(key, fn){
  if(!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key).add(fn);
  return () => listeners.get(key).delete(fn);
}
export function emit(key, payload){
  (listeners.get(key)||new Set()).forEach(fn=>fn(payload));
  if(key!=='*') (listeners.get('*')||new Set()).forEach(fn=>fn({key,payload,state}));
}