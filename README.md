# Générateur de Prompts – v5 (modulaire)

Outil web vanilla (ES Modules) pour composer des prompts **JSON/TXT** avec options **PowerPoint** et **Génération d’images**.  
Aucune dépendance, fonctionne en local.

© Olivier DOMY – Août 2025

---

## Sommaire
1. Prérequis et lancement
2. Arborescence
3. Fonctionnalités
4. Mode d’emploi rapide
5. Paramètres “Comportement de l’IA” et effets
6. PowerPoint + Manifeste + Placeholders
7. Génération d’images: auto-taille, DPI, presets, négatifs
8. Import/Export de modèles, **Presets**
9. **Autosave** + Historique (rollback)
10. Exports JSON/TXT
11. Validation et alertes
12. Raccourcis et UX
13. Versioning, tags et changelog
14. Exemples

---
##00 - Generateur de prompt 4.9
Ce fichier html est une version autoportante sur un seul fichier du générateur de prompt.
Il est moins complet que le programme modulaire mais est simple à utiliser.

## 1) Prérequis et lancement

- Navigateur récent (Chrome/Edge/Firefox).
- Servez le dossier en HTTP local :
  ```bash
  python3 -m http.server 8000
  # Ouvrir http://localhost:8000/index.html

## 2. Arborescence

```
index.html
css/
  base.css
  form.css
js/
  core/
    dom.js
    schema.js
    toast.js
    validate.js
    storage.js        # NEW: autosave + presets + historique
  features/
    aiProfile.js
    exporter.js
    images.js        # MAJ: presets étendus + négatifs contextuels
    importer.js      # NEW: import JSON → remplit tout le formulaire
    manifest.js
    metadata.js      # MAJ: DPI, min/max, etc.
    ppt.js           # MAJ: auto-size image via DPI + garde-fous
    timeline.js
    toggles.js
    presets.js       # NEW: UI modèles sauvegardés + historique
  main.js             # MAJ: autosave, historiques, presets, import
```


---

## 3. Fonctionnalités

	•	Formulaire modulaire avec affichage conditionnel PowerPoint/Image.
	•	Comportement IA: grille équilibrée, sélecteurs explicites.
	•	Manifeste PPTX: parsing, résumé, autocomplétion layouts/placeholders.
	•	Timeline: séquences multiples, overrides locaux par séquence.
	•	Images:
	•	Auto-taille depuis la bbox du placeholder à DPI configurable.
	•	Garde-fous min/max en pixels.
	•	Presets de styles étendus + négatifs contextuels par style.
	•	Import JSON: recharge un modèle créé par l’outil.
	•	Presets: sauvegarde/chargement localStorage, export/import fichiers.
	•	Autosave + Historique: 15 dernières versions, restauration 1-clic.
	•	Exports: JSON (aperçu, copie, download) et TXT synthétique.
	•	Validation: erreurs/avertissements sur layouts/placeholders/images.
	•	UX: toasts, barre d’actions sticky, raccourcis clavier.

---

## Mode d'emploi rapide

	1.	Saisir Nom du prompt, Objectif, Contexte, Rôle.
	2.	Cocher Activer PowerPoint et/ou Activer Génération Image.
	3.	Si PPT: coller le Manifeste → Analyser le manifeste.
	4.		•	Ajouter une instruction, remplir texte, cibles PPT, image locale si besoin.
	5.	Générer JSON. Copier/Télécharger JSON ou TXT.
	6.	Sauvegarder comme nouveau (preset) pour réusage.


## 4. Paramètres de **Comportement de l’IA** (incidences précises)

5) Paramètres “Comportement de l’IA” et effets
	•	reasoning_level : Rapid → court. Élevé/Expert → logique détaillée.
	•	factuality : Raisonné/Strict bloque les inventions.
	•	compliance : de Vérification légère à Sans compromis.
	•	depth : Standard/Approfondie/Exhaustive.
	•	autonomy : Modérée/Maximale pour propositions proactives.
	•	reformulation : Optimisée pour clarté et impact.
	•	uncertainty : Ne pas répondre ou Questions client.

Recommandé AVV formation: Élevé, Raisonné, Vérification légère, Standard, Modérée, Optimisée, Questions client.
Recommandé offres sensibles: Expert, Strictement factuel, Sans compromis, Approfondie, Faible, Optimisée, Ne pas répondre.

⸻

6) PowerPoint + Manifeste + Placeholders
	•	template.layout_id global. timeline[n].layout_id prime s’il existe.
	•	Manifeste: collez le JSON, bouton Analyser. Résumé et datalists auto.
	•	Placeholders: ciblez par name en priorité, sinon alias, sinon idx.

⸻

7) Génération d’images

7.1 Auto-taille avec DPI et garde-fous
	•	Si PPT actif et generate_image=true sans size local:
	•	Calcule W=width_in*dpi, H=height_in*dpi depuis la bbox du placeholder picture.
	•	Applique clamp avec min_size et max_size.
	•	DPI borné 72–600, défaut 300.

7.2 Presets de style + négatifs contextuels
	•	Styles disponibles: ligne_claire, flat, isometrique, lowpoly3d, blueprint, doodle, photostudio, pixelart, comic_noir, infographic, vector_poster, watercolor.
	•	Chaque style fournit style_tags et des négatifs spécifiques.
	•	Option Négatifs standard ajoute text, watermark, nsfw, blurry, ….
	•	Héritage global avec overrides locaux par séquence.

⸻

8) Modèles sauvegardés (Presets)
	•	Sauvegarder comme nouveau: stocke IA+Meta+PPT+Images+Timeline dans localStorage.
	•	Mettre à jour: écrase le preset sélectionné.
	•	Charger: remplit tout le formulaire depuis le preset.
	•	Exporter preset: fichier JSON portable.
	•	Importer preset: charge depuis un fichier exporté.

Note: les presets sont locaux au navigateur. Exportez pour partager.

⸻

9) Autosave + Historique (rollback)
	•	Autosave: enregistre les modifications automatiquement.
	•	Historique: conserve 15 versions horodatées.
	•	Restaurer: bouton sur la ligne de la version.
	•	Vider: purge l’historique.

Au chargement, proposition de restauration si autosave présent et formulaire vierge.

⸻

10) Exports
	•	JSON: aperçu live, Copier JSON, Télécharger JSON.
	•	TXT: condensé lisible Objectif/Contexte/Rôle + liste des instructions.

⸻

11) Validation et alertes
	•	Erreurs: layout inconnu, placeholder manquant, taille invalide.
	•	Avertissements: image configurée sans case cochée, picture non PICTURE, absence de layout pour auto-taille.
	•	Surbrillance des champs et panneau récapitulatif.

⸻

12) Raccourcis et UX
	•	Ctrl/Cmd + Enter: Générer JSON.
	•	Ctrl/Cmd + J: Ajouter une instruction.
	•	Barre d’actions sticky.
	•	Toasts pour chaque action.

⸻

13) Versioning, tags et changelog
	•	SemVer:
	•	MAJOR: changements incompatibles.
	•	MINOR: nouvelles fonctions rétro-compatibles.
	•	PATCH: correctifs.
	•	Tags Git: v5.0.0, v5.1.0, …
	•	Changelog: “Ajouts”, “Modifs”, “Fixes”, “Breaking”.

Delta v5.0.0
	•	NEW: storage.js, presets.js, importer.js.
	•	NEW: presets complets IA+PPT+images, export/import.
	•	NEW: autosave + historique 15 versions, rollback.
	•	NEW: auto-taille images par DPI + min/max.
	•	NEW: presets d’images étendus + négatifs contextuels.
	•	MAJ: validate.js, exporter TXT, UI.
	
14) Exemples
{
  "kind": "gpv5-preset",
  "name": "AVV – Formation IA v1",
  "updated_at": "2025-08-26T21:30:00.000Z",
  "model": {
    "ai_profile": { "reasoning_level": "Élevé", "factuality": "Raisonné", "compliance": "Vérification légère", "depth": "Standard", "autonomy": "Modérée", "reformulation": "Optimisée", "uncertainty": "Questions client" },
    "metadata": {
      "prompt_name": "Deck Formation IA-AVV",
      "objectifPrincipal": "Créer un PowerPoint sur l’apport de l’IA générative pour l’AVV",
      "contexte": "Formation interne",
      "role": "Bid Manager"
    },
    "template": { "layout_id": "S03_TitleBodyPictureRight" },
    "template_manifest": { "layouts": { "S03_TitleBodyPictureRight": { "placeholders": [] } } },
    "timeline": []
  }
}
14.2 Auto-taille image
	•	Globaux: DPI=300, min_size=512x512, max_size=2048x2048.
	•	Séquence: generate_image=true, size vide → calcul depuis ph_picture, puis clamp min/max.

14.3 Style + négatifs
	•	Global: style_key="blueprint", Négatifs standard activés.
	•	Résultat: style_tags=["blueprint","fond bleu","traits blancs fins",…],
negative_prompt="text, watermark, nsfw, blurry, …, textures réalistes, photos, ombrage fort".

⸻

Notes
	•	Confidentialité: presets/autosave/historique restent dans localStorage.
	•	Compatibilité: éviter file://. Utiliser un serveur HTTP local.
	•	Partage: Exporter preset puis Importer preset sur un autre poste.

Annexe — Manifeste PowerPoint (spécification et usage)

1. Objet

Le manifeste décrit la géométrie et les placeholders de ton template PPTX. L’outil s’en sert pour :
	•	L’autocomplétion des layout_id et placeholders.
	•	La résolution des cibles (title, body, picture).
	•	Le calcul auto de la taille d’image à partir de la bbox du placeholder picture.

2. Structure minimale
{
  "file": "Template_ph.pptx",
  "slide_width_in": 13.333,
  "slide_height_in": 7.5,
  "layouts": {
    "<LayoutName>": {
      "placeholders": [
        {
          "name": "ph_title",
          "idx": 0,
          "type": { "name": "TITLE", "id": 1 },
          "bbox": { "left_in": 0.917, "top_in": 0.315, "width_in": 10.298, "height_in": 0.549 }
        },
        {
          "name": "ph_body",
          "idx": 13,
          "type": { "name": "BODY", "id": 2 },
          "bbox": { "left_in": 0.917, "top_in": 2.062, "width_in": 7.613, "height_in": 4.834 }
        },
        {
          "name": "ph_picture",
          "idx": 15,
          "type": { "name": "PICTURE", "id": 18 },
          "bbox": { "left_in": 9.091, "top_in": 2.062, "width_in": 4.04, "height_in": 3.141 }
        }
      ],
      "aliases": {
        "title":   { "name": "ph_title",   "idx": 0,  "type": "TITLE" },
        "subtitle": null,
        "body":    { "name": "ph_body",    "idx": 13, "type": "BODY" },
        "picture": { "name": "ph_picture", "idx": 15, "type": "PICTURE" }
      }
    }
  }
}

3. Champs obligatoires
	•	slide_width_in, slide_height_in : taille de la diapo en pouces.
	•	layouts : dictionnaire des layouts disponibles.
	•	Pour chaque layout :
	•	placeholders[] : liste des placeholders.
	•	name : nom lisible. Unique par layout recommandé.
	•	idx : index interne PowerPoint.
	•	type.name : TITLE | BODY | PICTURE | DATE …
	•	bbox : { left_in, top_in, width_in, height_in } en pouces.
	•	aliases : mappage standard de rôle → placeholder.
Clés reconnues : title, subtitle, body, picture.

4. Résolution utilisée par l’outil

Pour chaque séquence :
	1.	Layout : timeline[n].layout_id sinon template.layout_id.
Si absent → erreur.
	2.	Placeholder cible (ex. targets.picture.placeholder_name) :
	•	Si valeur = nom → match exact sur placeholders[].name.
	•	Si valeur = "idx:NN" ou nombre → match sur idx.
	•	Sinon → fallback sur aliases.<role> du layout.
	•	Si non trouvé → erreur.
	3.	Auto-taille image : si generate_image=true et size vide
	•	Prend la bbox du placeholder picture.
	•	Convertit en pixels avec DPI (meta globale, 72–600, défaut 300).
	•	Clamp avec min_size et max_size si fournis.
	•	Si le placeholder picture n’existe pas ou n’a pas de bbox → fallback sur metadata.image_policy.default_size sinon 1024x768 + warning.

5. Règles de validation
	•	Layout inconnu → erreur.
	•	Placeholder introuvable pour title/body/picture → erreur.
	•	picture.type différent de PICTURE → autorisé mais warning (autotaille peut être incohérente).
	•	BBox manquante/invalide pour l’autotaille → warning + fallback taille par défaut.
	•	Noms dupliqués dans placeholders[].name → warning. Préférer des name uniques.

6. Bonnes pratiques de template
	•	Renomme les placeholders dans PowerPoint (volet Sélection) :
	•	ph_title, ph_subtitle, ph_body, ph_picture, etc.
	•	Garantis des name stables entre versions du template.
	•	Préfère des aliases complets par layout pour un fallback robuste.
	•	Garde PICTURE pour le visuel. Évite d’utiliser un BODY comme image.
	•	Si des placeholders “génériques” existent (Espace réservé du texte 3), force la cible par idx ("idx:13") ou renomme-les dans le gabarit.

7. Exemple complet multi-layouts

{
  "file": "Template_ph.pptx",
  "slide_width_in": 13.333,
  "slide_height_in": 7.5,
  "layouts": {
    "S03_TitleBodyPictureRight": {
      "placeholders": [
        { "name":"ph_title","idx":0,"type":{"name":"TITLE","id":1},"bbox":{"left_in":0.917,"top_in":0.315,"width_in":10.298,"height_in":0.549}},
        { "name":"ph_body","idx":13,"type":{"name":"BODY","id":2},"bbox":{"left_in":0.917,"top_in":2.062,"width_in":7.613,"height_in":4.834}},
        { "name":"ph_picture","idx":15,"type":{"name":"PICTURE","id":18},"bbox":{"left_in":9.091,"top_in":2.062,"width_in":4.040,"height_in":3.141}}
      ],
      "aliases": {
        "title":{"name":"ph_title","idx":0,"type":"TITLE"},
        "subtitle":null,
        "body":{"name":"ph_body","idx":13,"type":"BODY"},
        "picture":{"name":"ph_picture","idx":15,"type":"PICTURE"}
      }
    },
    "S04_TitleBodyStandard": {
      "placeholders": [
        { "name":"ph_title","idx":0,"type":{"name":"TITLE","id":1},"bbox":{"left_in":0.917,"top_in":0.315,"width_in":10.298,"height_in":0.549}},
        { "name":"ph_body","idx":13,"type":{"name":"BODY","id":2},"bbox":{"left_in":0.917,"top_in":2.062,"width_in":11.958,"height_in":4.834}}
      ],
      "aliases": {
        "title":{"name":"ph_title","idx":0,"type":"TITLE"},
        "subtitle":null,
        "body":{"name":"ph_body","idx":13,"type":"BODY"},
        "picture":{"name":"Espace réservé du texte 3","idx":10,"type":"BODY"}
      }
    }
  }
}

8. Procédure d’usage dans l’outil
	1.	Activer PowerPoint.
	2.	Saisir le layout_id par défaut.
	3.	Coller le manifeste → bouton Analyser le manifeste.
	4.	Dans chaque séquence, sélectionner un layout_id spécifique si besoin.
	5.	Renseigner targets.title/body/picture par name (ou idx:NN).
	6.	Si generate_image=true et taille vide → l’outil calcule la taille depuis la bbox de picture + DPI/min/max globaux.

9. Dépannage rapide
	•	Image non générée ou taille incohérente
Vérifie que aliases.picture pointe un placeholder avec type: PICTURE et bbox non nulle. Sinon, force targets.picture.placeholder_name avec un name correct ou idx:NN.
	•	Texte hors zone
Assure-toi que targets.body.placeholder_name réfère au name exact du BODY. Les noms génériques dupliqués doivent être évités ou ciblés par idx.
	•	Layout ignoré
timeline[n].layout_id écrase template.layout_id. Contrôle l’orthographe du layout et sa présence dans layouts.

⸻
