# Phase 2 — Création du projet et connexion GitHub (2026-11-21)

## Réalisé
- Projet Node (React 18.3.1, Vite 5.4.21, Three.js 0.170.0, Playwright 1.63.0) — versions figées.
- Deux pages : `index.html` (tableau de bord mobile, squelette) et `render.html` (rendu 3D piloté).
- Contrat de rendu stable : `window.__RSS_READY`, `window.renderFrame(n)`, `window.__RSS_INFO`.
- `pipeline/lib/verify.js` : validation stricte ffprobe (fichier présent, H.264, résolution,
  durée, piste vidéo **et** audio). 4 tests automatiques (absent, corrompu, sans audio, mauvaise durée).
- `npm run smoke` : build → Playwright → FFmpeg → vérification, de bout en bout.
- Workflow `.github/workflows/ci.yml` : manuel ou sur push des branches de dev (si code modifié),
  MP4 de test publié en artefact (rétention 3 jours).

## Résultat sur GitHub Actions (run #1) : ✅ succès en 1 min 40
| Étape | Durée |
|---|---|
| Installation FFmpeg + Node + Chromium + Piper | ~50 s |
| Tests + build | ~3 s |
| Rendu 60 images 1080×1920 + encodage | 31 s (**~450 ms/image**) |

Projection pour l'épisode complet (1350 images) : ~10 min de rendu, ~13 min au total
→ ~150 épisodes possibles avec les 2 000 min/mois de l'offre privée gratuite.
