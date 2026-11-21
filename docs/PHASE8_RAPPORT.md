# Phase 8 — Interface, workflow GitHub Actions et test final (2026-11-21)

## Décisions (validées par l'utilisateur)
- Dépôt rendu **public** : GitHub Pages gratuit pour le tableau de bord + minutes Actions illimitées.
  Audit avant publication : aucun secret dans le code ni l'historique.
- Fusion dans `main` (le bouton « Run workflow » n'existe que pour les workflows de la branche par défaut).

## Workflow « Générer un épisode » (`.github/workflows/generate.yml`)
Menus : décor, histoire, distribution (6 combinaisons), qualité, graine, identifiant de demande.
Entrées validées (graine : chiffres uniquement ; valeurs passées par variables, jamais interprétées par le shell).
Publie l'**artefact** (MP4, miniature, texte YouTube, manifest ; 30 jours) et une **release** (bibliothèque).
Échec : annotations d'erreur lisibles + journal en artefact ; jamais de release si le MP4 est invalide.

## Tableau de bord (`src/ui/`, React + Vite, publié par `pages.yml`)
Générer (automatique en 1 appui / personnalisé : décor, histoire, rôles, qualité, graine) · Épisodes
(aperçu vidéo, export MP4, copie titre/description) · Historique (suivi en direct, erreurs) · Réglages
(jeton fine-grained stocké uniquement dans le navigateur, test de connexion).
Testé dans Chromium (format téléphone) avec une API GitHub simulée : aucune erreur JS, requête
de lancement conforme.

## Tests
64 tests, dont : client GitHub (lancement, erreurs, le jeton ne part que vers api.github.com),
analyse des releases et exécutions, synchronisation des menus du workflow avec le code.

## Test final de bout en bout (sur GitHub, dépôt réel)
| Essai | Résultat |
|---|---|
| Génération n°1 (graine 777) | épisode produit, **mais** échec de l'étape de résumé (chemin relatif du manifest dans un script en ligne) → script extrait dans `pipeline/ci-summary.js`, testé (succès / absent / échec) |
| Génération n°2 (graine 777) | ✅ **succès en 7 min 40** : « Le sac de Zoé contient TOUT », artefact `ep-sac-magique-777` (19,4 Mo, 30 jours) + release publique |
| Contre-vérification | MP4 téléchargé depuis la release (HTTP 200) et revérifié : 45,00 s · 1080×1920 · H.264 · AAC 48 kHz · 1350 images · 30 i/s · pas d'image noire |
| Publication du tableau de bord | ❌ refusée par la règle de l'environnement `github-pages` (« Branch main is not allowed ») → réglage à faire par le propriétaire (voir GUIDE_ANDROID §2) |

Durée réelle sur GitHub : **≈ 5 min de rendu, ≈ 8 min au total** (l'estimation était de 10–12 min).
