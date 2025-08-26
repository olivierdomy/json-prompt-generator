export const STYLE_PRESETS={
  ligne_claire:{tags:['ligne claire','aplats','contours noirs nets'],neg:'photo réaliste, grain, watermark, texte, logos, personnages licenciés',hint:'Ligne claire franco-belge'},
  flat:{tags:['flat illustration','formes géométriques'],neg:'textures réalistes, watermark'},
  isometrique:{tags:['isometric','vector','30° angle'],neg:'perspective réaliste, textures'},
  lowpoly3d:{tags:['clean CGI','low-poly','studio light'],neg:'photoreal noisy'},
  blueprint:{tags:['blueprint','white on blue'],neg:'photo, texte lisible'},
  doodle:{tags:['whiteboard','marker strokes'],neg:'ombres réalistes'},
  photostudio:{tags:['soft studio light','realistic'],neg:'grain fort, watermark'},
  pixelart:{tags:['pixel art','8-bit'],neg:'dégradés lisses'}
};

export function buildImage(globalPolicy={}, local={}){
  const key = local.style_key || globalPolicy.style_key || '';
  const preset = STYLE_PRESETS[key] || null;
  const tags = preset ? preset.tags.join(', ') : (globalPolicy.style_hint||'');
  const prompt = [local.scene || globalPolicy.concept || '', tags].filter(Boolean).join('; ');
  const negative = local.negStd!==false ? (preset ? preset.neg : (globalPolicy.negative_prompt_default||'')) : '';
  return {
    prompt,
    negative_prompt: negative,
    size: local.size || '',
    fit: local.fit || globalPolicy.fit || 'contain',
    transparent_background: (local.bg || globalPolicy.background || 'transparent') === 'transparent',
    style_key: key,
    style_hint: preset ? preset.hint : (globalPolicy.style_hint||'')
  };
}