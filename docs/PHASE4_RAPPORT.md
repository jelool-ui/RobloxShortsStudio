# Phase 4 — Décors et animations (2026-11-21)

## Nouveaux modules (`src/engine/`)
| Fichier | Rôle |
|---|---|
| `sets/school.js` | école procédurale : **couloir** (casiers, portes, affiches, horloge), **classe** (tableau à la craie, 9 pupitres, bureau du prof, fenêtres), **cour** (façade, enseigne, arbres, banc, panier de basket, marelle, nuages). Chaque zone expose des « marques » de mise en scène. |
| `animation.js` | 13 animations procédurales réutilisables : idle, **walk, run, jump, surprise**, scared, talk, wave, point, laugh, celebrate, angry, think |
| `timeline.js` | moteur de pistes : actions horodatées, déplacements avec accélération/freinage, demi-tours fluides, fondus de 0,2 s entre animations, téléportation (`place`) lors des changements de décor |
| `cameraRig.js` | caméra : plans wide / medium / closeup / two / track / low / over, coupes franches, travelling lent, tremblé « à l'épaule », zooms d'impact |
| `director.js` | relie personnages + pistes + caméra + décor (format consommé par le storyboard en phase 5) |
| `scenes/demo.js` | démo de 15 s écrite à la main (couloir → classe → cour) |

## Caméra intelligente
- Choisit automatiquement un angle où **aucun autre personnage ne masque le sujet**
  (vérifié au début, au milieu et à la fin du plan → pas de saut d'angle).
- **Ne filme jamais un personnage de dos** en plan serré.
- Plans de groupe : recule automatiquement pour que tout le monde tienne dans le cadre vertical.

## Optimisation
Seule la zone filmée est affichée ; le soleil (et ses ombres) suit le point filmé.

## Vérifications
- 25 tests (13 nouveaux) : animations valides, saut qui retombe au sol, course plus ample
  que la marche, trajets continus, timeline, déterminisme, anti-occultation, construction de l'école.
- Contrôle visuel image par image de chaque plan de la démo (3 corrections faites).

## Performance (à surveiller)
~0,32 s/image dans le cloud Claude avec le décor complet. Estimation GitHub : ~0,9 s/image
→ ~20 min pour 45 s. Piste d'optimisation pour la phase 7 si besoin : rendu 720×1280 puis
agrandissement FFmpeg (2,25× moins de pixels).
