const bus = new EventTarget();
export const on = (evt, cb)=>bus.addEventListener(evt, cb);
export const emit = (evt, detail)=>bus.dispatchEvent(new CustomEvent(evt,{detail}));