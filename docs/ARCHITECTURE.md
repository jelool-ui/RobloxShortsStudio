# Architecture — RobloxShortsStudio

Objectif V1 : produire automatiquement un épisode MP4 vertical (1080×1920, 30 i/s, 45 s)
de style « blocs », 100 % original, sans API payante, sans validation manuelle.

## 1. Pipeline

```
 [1] Histoire        src/story/      générateur procédural (gabarits + graine aléatoire)
       │                              → episode.json (titre, personnages, scènes, répliques)
 [2] Storyboard      src/story/      découpe en plans : durée, caméra, actions, décor
       │
 [3] Personnages     src/engine/     personnages cubiques procéduraux (Three.js, aucun fichier 3D)
 [4] Décors          src/engine/     école procédurale (couloir, classe, cour)
 [5] Animations      src/engine/     marche, course, saut, surprise, parole (procédurales, réutilisables)
       │
 [6] Dialogues       src/story/      répliques + horodatage
 [7] Voix            pipeline/tts    Piper TTS → un WAV par réplique + durée mesurée
       │                              → la durée réelle des voix recale le storyboard
 [8] Rendu 3D        pipeline/render Playwright + Chromium headless : rendu image par image
       │                              déterministe (window.renderFrame(n)) → JPEG
 [9] Montage         pipeline/mix    FFmpeg : voix + musique + bruitages + sous-titres (ASS)
       │
[10] MP4             pipeline/verify ffprobe : durée ≈ 45 s, 1080×1920, piste vidéo H.264
                                      + piste audio AAC présentes → sinon ÉCHEC
```

Une seule commande lance tout : `npm run generate -- --seed 1234` (phase 7).
Chaque étape écrit ses fichiers dans `output/<episode-id>/`, ce qui permet de
diagnostiquer précisément l'étape en échec.

## 2. Arborescence prévue

```
RobloxShortsStudio/
├─ docs/                     documentation (ce fichier, rapports de phase)
├─ scripts/check-env.sh      vérification des outils
├─ src/
│  ├─ engine/                moteur Three.js (personnages, décors, animations, caméra, bouche)
│  ├─ story/                 générateur d'histoires + storyboard (JS pur, sans réseau)
│  ├─ render-page/           page HTML pilotée par Playwright pour le rendu image par image
│  └─ ui/                    interface React mobile (tableau de bord)
├─ pipeline/                 scripts Node : tts, render, audio, mix, verify, generate
├─ assets/
│  ├─ voices/                modèles Piper (téléchargés au besoin, non versionnés)
│  └─ audio/                 musique/bruitages générés procéduralement
├─ output/                   épisodes générés (non versionné)
└─ .github/workflows/        render.yml (déclenchement manuel → artefact MP4)
```

## 3. Choix techniques et justifications

| Besoin | Choix | Pourquoi |
|---|---|---|
| 3D | Three.js 0.170 | WebGL2 testé OK en headless (SwiftShader) |
| Rendu | Playwright, pas de temps réel | rendu image par image déterministe : aucune saccade même sur CPU lent |
| Performance | ~160 ms/image mesurés en 1080×1920 | 1350 images ≈ 3,6 min → très en dessous de la limite de 6 h de GitHub Actions |
| Voix | Piper TTS 1.8 (pip) | local, gratuit, testé OK |
| Bouche | amplitude du WAV (enveloppe RMS par image) | simple, robuste, sans dépendance supplémentaire |
| Musique / bruitages | synthèse procédurale (Python/FFmpeg) | zéro risque de licence, aucun téléchargement |
| Histoires | gabarits + combinatoire avec graine | aucune API externe, reproductible |
| Interface | React + Vite, publiée sur GitHub Pages | ouvrable depuis le navigateur Android |
| Lancement mobile | l'interface déclenche le workflow via l'API GitHub (jeton personnel saisi par l'utilisateur, stocké seulement dans son navigateur) ou bouton « Run workflow » de l'app GitHub | aucun secret dans le dépôt |

## 4. Voix retenues (licences vérifiées sur les MODEL_CARD officielles)

| Personnage | Modèle Piper | Licence | Remarque |
|---|---|---|---|
| A | `fr_FR-siwis-medium` | CC-BY 4.0 | voix féminine — attribution requise |
| B | `fr_FR-upmc-medium` (locuteur `pierre`) | CC-BY-SA 4.0 | voix masculine — attribution requise |
| C | `fr_FR-gilles-low` | CC0 | voix masculine, timbre différent |

Écarté : `fr_FR-tom-medium` (AGPLv3, contraignant).
Les attributions seront ajoutées automatiquement dans la description générée de chaque épisode.
Si nécessaire, un léger décalage de hauteur (FFmpeg) renforce la différence entre voix.

## 5. Limites GitHub Actions (runner `ubuntu-latest` standard)

- Durée maximale d'un job : **6 h** (notre rendu : ~5–10 min avec installation).
- Dépôt **public** : minutes gratuites illimitées, 4 vCPU / 16 Go RAM.
- Dépôt **privé** (offre gratuite) : **2 000 min/mois**, 2 vCPU / 7 Go, **500 Mo** de stockage
  d'artefacts → on fixera une rétention courte (7 jours) des MP4.
- Pas de GPU : rendu logiciel (déjà validé avec SwiftShader).
- Les modèles Piper (~60 Mo chacun) seront mis en cache (`actions/cache`).

## 6. Sécurité et qualité

- Aucune clé API dans le code ; aucune API payante.
- `output/`, `assets/voices/*.onnx`, `node_modules/` exclus de git.
- La génération n'est déclarée réussie qu'après validation ffprobe :
  durée 44–46 s, 1080×1920, flux vidéo **et** audio présents, fichier non vide.
