// js/features/images.js
// Presets étendus + négatifs contextuels par style.

const DEFAULT_NEG = [
  'text','watermark','logo','signature','nsfw','nudity',
  'blurry','low-res','jpeg artifacts','oversharp','overexposed','underexposed'
];

export const STYLES = {
  ligne_claire: {
    tags: [
      'ligne claire','aplats propres','contours noirs nets',
      'palette harmonisée','ombres douces','sans trame'
    ],
    negatives: ['photorealistic','grain','paper texture','heavy shading','3d render']
  },
  flat: {
    tags: ['flat design','shapes simples','sans ombres','palette pastel'],
    negatives: ['gradient heavy','noise','texture','3d']
  },
  isometrique: {
    tags: ['isometric view','angles 30°','ombrage léger','formes géométriques'],
    negatives: ['perspective frontale','photorealistic','noise']
  },
  lowpoly3d: {
    tags: ['low poly','facettes visibles','éclairage studio doux'],
    negatives: ['high poly','subdivision','photorealistic skin']
  },
  blueprint: {
    tags: ['blueprint','fond bleu','traits blancs fins','cotes techniques'],
    negatives: ['textures réalistes','photos','ombrage fort']
  },
  doodle: {
    tags: ['doodle','croquis feutre','style carnet','humoristique'],
    negatives: ['photorealistic','heavy shading','oil paint']
  },
  photostudio: {
    tags: ['studio lighting','fond uni','propre','haute netteté'],
    negatives: ['motion blur','noise','low light']
  },
  pixelart: {
    tags: ['pixel art','palette limitée','résolution basse','sprites nets'],
    negatives: ['antialiasing','blur','photo texture']
  },
  comic_noir: {
    tags: ['bande dessinée','noir et blanc','fort contraste','aplats d’ombre'],
    negatives: ['grayscale noise','photorealistic skin','film grain']
  },
  infographic: {
    tags: ['infographie','icônes vectorielles','légendes claires','grille'],
    negatives: ['photo background','busy texture','clutter']
  },
  vector_poster: {
    tags: ['affiche vectorielle','typo nette','composition centrée','contraste fort'],
    negatives: ['bitmap jaggies','photo grain','overtexture']
  },
  watercolor: {
    tags: ['aquarelle légère','bords diffus','papier clair','couleurs douces'],
    negatives: ['edges hard','oil texture','over-saturation']
  }
};

function uniq(arr){ return Array.from(new Set(arr.filter(Boolean))); }

export function buildImage(globalPolicy={}, local={}){
  const style_key = local.style_key || globalPolicy.style_key || '';
  const style = STYLES[style_key] || null;

  const fit = local.fit || globalPolicy.fit || '';
  const background = local.bg || local.background || globalPolicy.background || '';
  const size = local.size || globalPolicy.default_size || '';

  const scene = (local.scene||'').trim();

  const negs = [];
  if (globalPolicy.negative_prompt_default) negs.push(...DEFAULT_NEG);
  if (style?.negatives) negs.push(...style.negatives);
  const negative_prompt = uniq(negs).join(', ');

  const tags = uniq(style?.tags || []);

  const out = {};
  if (style_key) out.style_key = style_key;
  if (fit) out.fit = fit;
  if (background) out.background = background;
  if (size) out.size = size;
  if (scene) out.scene = scene;
  if (tags.length) out.style_tags = tags;
  if (negative_prompt) out.negative_prompt = negative_prompt;

  return out;
}