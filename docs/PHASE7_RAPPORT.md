# Phase 7 — Rendu Playwright et montage FFmpeg (2026-11-21)

## Une seule commande : `npm run generate -- --seed 42`
```
histoire → voix/musique/bruitages (6 s) → rendu 3D Playwright (≈ 150–200 ms/image)
→ sous-titres ASS → montage FFmpeg → vérifications strictes → manifest.json
```
Sortie dans `output/episodes/<id>/` : `episode.mp4`, `thumbnail.jpg`, `youtube.txt` (titre + description
avec crédits), `subtitles.ass`, `storyboard.json`, `story.json`, `audio/`, `manifest.json`.

## Performance (mesures)
| Réglage | ms/image (cloud Claude, 4 CPU) |
|---|---|
| 1080p + anticrénelage + ombres 2048 | 433 |
| 1080p sans anticrénelage, ombres 1024 | 327 |
| **720p + anticrénelage, ombres 1024 (défaut « fast »)** | **178** |
| 2 pages en parallèle | aucun gain (SwiftShader utilise déjà tous les cœurs) |

Le coût est le calcul 3D lui-même (rendu logiciel), pas la capture. La 3D est donc calculée en 720p,
agrandie en 1080×1920 (lanczos) et les sous-titres sont incrustés **après** en 1080p (texte net).
Épisode complet : **≈ 4 min** dans le cloud Claude (rendu 201 s + montage 34 s).

## Sous-titres dynamiques (`pipeline/lib/subtitles.js`)
Police Lilita One (licence OFL, incluse dans `assets/fonts/`, tous les caractères français vérifiés).
Groupes de 1 à 3 mots avec effet « pop », mot prononcé surligné à la couleur du personnage
(Nino rouge, Zoé vert, Max jaune), nom au-dessus, titre d'accroche (2,4 s), « ABONNE-TOI » final.
Placés dans la zone sûre des Shorts.

## Vérifications finales (`verifyEpisode`) — l'épisode n'est réussi que si TOUT passe
fichier présent et non vide · H.264 · 1080×1920 · durée 45 s ± 0,1 · piste audio AAC 48 kHz ·
30 i/s · 1350 images (± 2) · pas d'image noire (début, milieu, fin).
En cas d'échec : `manifest.json` → `status: failed` + étape et message ; un MP4 invalide est renommé
`episode.INVALIDE.mp4` ; code de sortie 1.

## Corrections faites après contrôle visuel
- La caméra accompagne les sauts dans les plans serrés (la tête sortait du cadre).

## Tests
54 tests (8 nouveaux) : découpage/minutage des sous-titres, format ASS, montage réel, et refus d'une
vidéo noire, trop courte, sans audio, absente ou à 24 i/s.

## Corrections suite aux retours (épisode « Concours de saut », graine 2026)
1. **Max traversait Zoé (≈ 19 s).** Cause : tous les déplacements étaient en ligne droite.
   Mesure : 140 épisodes sur 240 avaient des personnages qui se traversaient.
   - Moteur : trajets avec points de passage (`via`), orientation qui suit le chemin.
   - Storyboard : contournement automatique (`detour`), côté caméra pour un déplacement latéral ;
     distance minimale 2,6 entre personnages.
   - Caméra : prise en compte des objets du décor (banc, arbres, poteau) ; travelling de côté,
     jamais de dos.
   - Résultat : 0 épisode sur 240 ; test permanent image par image ajouté.
2. **« Vas-y » prononcé « vaz-i grec » (≈ 22 s).** Cause : espeak lit le « y » final après un trait
   d'union comme la lettre. Correction : « -y » final → « -i » avant la synthèse.
   - Audit phonétique automatique de **toutes** les répliques (172 × 3 voix) : `npm run check:pronunciation`,
     ajouté au contrôle GitHub. Contre-épreuve faite : sans le correctif, l'audit détecte bien l'erreur.
