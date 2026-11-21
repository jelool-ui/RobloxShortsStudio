# Phase 3 — Moteur 3D et personnages (2026-11-21)

## Moteur (`src/engine/`)
| Fichier | Rôle |
|---|---|
| `stage.js` | renderer (ombres douces, tone mapping ACES, sRGB), lumières, caméra |
| `character.js` | fabrique de personnages cubiques **100 % procéduraux** (aucun fichier 3D) |
| `characters.js` | la distribution originale + voix attitrée de chacun |
| `idle.js` | respiration, regard, clignement — déterministes (fonction du temps) |
| `scenes/showcase.js` | scène de présentation (`render.html?scene=showcase`) |

## Squelette d'un personnage
`root → body → legL/legR (hanches) + torso → armL/armR (épaules) + head (cou) → visage`
Chaque articulation est un pivot rotatif : les animations de la phase 4 n'auront qu'à
faire tourner ces pivots.

## Visage (sans texture)
- `setMouth(0..1)` : ouverture de bouche → branchée au lip-sync en phase 6.
- `setExpression()` : neutral, happy, surprised, angry, sad, scared (yeux, sourcils, bouche).
- `setBlink(0..1)` : clignement automatique.

## Distribution
| Personnage | Look | Caractère | Voix Piper |
|---|---|---|---|
| **Nino** | casquette rouge, pull bleu à losange | farceur, énergique | gilles (CC0) |
| **Zoé** | couettes orange, t-shirt vert, sac à dos | maline, curieuse | siwis (CC-BY 4.0) |
| **Max** | plus grand, cheveux en pics, lunettes, t-shirt jaune rayé | calme, peureux en secret | upmc/pierre (CC-BY-SA 4.0) |

## Vérifications
- 8 nouveaux tests (hiérarchie, taille, pieds au sol, bouche, expressions, déterminisme, clignement) → 12/12 OK.
- Contrôle visuel : `npm run portraits` (gros plans) et `npm run smoke` (vidéo verticale).
