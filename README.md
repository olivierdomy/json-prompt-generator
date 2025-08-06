# json-prompt-generator
Générateur de prompts au format json
# Générateur de Prompts au format JSON (MCP)

Ce projet est une interface web simple permettant de créer des prompts structurés au format JSON, compatibles avec un usage en Model Context Protocol (MCP). Il est particulièrement adapté aux usages professionnels dans les métiers de l’avant-vente, de la documentation technique ou de la production de contenus automatisés.

## ✨ Fonctionnalités

- Interface HTML ergonomique et moderne
- Remplissage guidé de tous les champs de métadonnées
- Ajout dynamique d’instructions détaillées
- Génération séquentielle des actions
- Export immédiat au format `.json` (nom de fichier = [Nom du prompt] + [Date])
- Prévisualisation temps réel du fichier généré

## 📦 Structure du JSON généré

```json
{
  "metadata": {
    "prompt_name": "...",
    "goal": "...",
    "role": "...",
    ...
  },
  "timeline": [
    {
      "sequence": 1,
      "action": "...",
      "tone": "...",
      "role": "..."
    }
  ]
}
