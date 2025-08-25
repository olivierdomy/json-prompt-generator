# Générateur de Prompts – Documentation (v4.5.1)

## 1. Introduction
Cet outil permet de générer des prompts structurés au format JSON et TXT à destination d'une IA spécialisée. Il est conçu pour les utilisateurs souhaitant formaliser des instructions complexes et contrôlées, tout en permettant une personnalisation du comportement de l’IA.

---

## 2. Structure Générale du Prompt

```json
{
  "ai_profile": {
    "reasoning_level": "...",
    "factuality": "...",
    "compliance": "...",
    "depth": "...",
    "autonomy": "...",
    "reformulation": "...",
    "uncertainty": "..."
  },
  "metadata": {
    "prompt_name": "...",
    "objectifPrincipal": "...",
    "contexte": "...",
    "role": "...",
    "image_policy": {
      "concept": "...",
      "fit": "...",
      "style_hint": "..."
    }
  },
  "timeline": [
    {
      "sequence": 1,
      "action": "...",
      "format": "...",
      "exemple": "...",
      "verifications": "...",
      "generate_image": true
    }
  ]
}
```

---

## 3. Comportement de l'IA (`ai_profile`)

### 🔎 `reasoning_level` – Niveau de raisonnement
- **Automatique** : Analyse simple des faits, sans déduction.
- **Rapide** : Traitement direct avec logique élémentaire.
- **Élevé** : Analyse construite avec enchaînement logique structuré.
- **Expert (multi-étapes)** : Raisonnement complexe avec étapes intermédiaires et vérifications.

### 📊 `factuality` – Fiabilité des données
- **Créatif (peut inventer)** : L’IA peut créer du contenu pour combler les lacunes.
- **Intermédiaire** : Possibilité d’extrapolation légère ou d’inférences contrôlées.
- **Raisonné (aucune donnée non vérifiée)** : Appuyé uniquement sur des faits connus.
- **Strictement factuel** : Zéro invention ou inférence, réponses brutes.

### 📜 `compliance` – Rigueur de conformité
- **Créatif** : Peut ignorer les règles pour proposer des idées innovantes.
- **Vérification légère** : Respect général des consignes sans contrôle exhaustif.
- **Contrôle par règles** : Conformité stricte à un cadre établi.
- **Sans compromis réglementaire** : Rigueur extrême, aucune sortie de route acceptée.

### 🧠 `depth` – Profondeur d’analyse
- **Superficielle** : Résumé ou synthèse minimale.
- **Standard** : Réponses équilibrées sans surcharge d’information.
- **Approfondie** : Explications riches, détaillées et argumentées.
- **Exhaustive** : Couvre tous les aspects possibles avec précision.

### 🔁 `autonomy` – Degré d’autonomie
- **Aucune (répond uniquement sur faits)** : Ne sort jamais du cadre explicite.
- **Faible (suggestions ponctuelles)** : Peut suggérer de légères améliorations.
- **Modérée (initie des propositions argumentées)** : Prend des initiatives contextualisées.
- **Maximale (autorisé à reformuler, extrapoler ou combler les manques)** : L’IA prend des libertés pour enrichir la réponse.

### ✍️ `reformulation` – Capacité de reformulation
- **Texte brut uniquement** : Reprise littérale sans adaptation.
- **Reformulation légère (lisibilité)** : Fluidification syntaxique et lexicale.
- **Reformulation optimisée (impact, clarté)** : Accent mis sur la lisibilité et l’impact du message.
- **Libre (style éditorial, mise en récit, persuasion)** : Rédaction narrative avec ton engageant et structuration éditoriale.

### 🧩 `uncertainty` – Gestion des incertitudes
- **Ne pas répondre** : L’IA s’abstient si l'information est manquante.
- **Émettre des hypothèses (signalées)** : Hypothèses explicites et encadrées.
- **Proposer des alternatives** : Plusieurs solutions envisagées.
- **Remonter des questions à poser au client** : Génère une liste de questions pour affiner la réponse.

---

## 4. Métadonnées (`metadata`)
- **prompt_name** : Nom unique du prompt.
- **objectifPrincipal** : Résumé de l’objectif principal.
- **contexte** : Environnement métier ou technique.
- **role** : Rôle attendu de l’IA (ex : expert cybersécurité).
- **image_policy** :
  - **concept** : Sujet visuel à illustrer.
  - **fit** : Règle de cadrage (ex : contain, cover, etc.).
  - **style_hint** : Directive artistique (ex : BD type ligne claire).

---

## 5. Timeline (`timeline`)
Chaque instruction complémentaire est structurée avec :
- **sequence** : Numéro d’ordre.
- **action** : Instruction principale.
- **format** : Type de réponse attendu.
- **exemple** : Exemple de rendu.
- **verifications** : Critères de contrôle qualité.
- **generate_image** : Booléen pour demander une illustration IA.

---

## 6. Export & Fichiers
- ✅ JSON formaté, structuré, prêt à utiliser.
- ✅ TXT avec une vue synthétique pour relecture humaine.

---

## 7. Version
Dernière mise à jour : 2025-08-25
Version : **v4.5.1**

© Olivier Domy – 2025
