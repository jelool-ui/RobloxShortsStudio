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
