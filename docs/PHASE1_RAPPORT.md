# Phase 1 — Rapport de vérification de l'environnement (2026-11-21)

Tous les tests ont été **exécutés réellement** dans le conteneur cloud.

| Élément | Résultat | Détail |
|---|---|---|
| Node.js | ✅ v22.23.5 | |
| npm | ✅ 10.9.9 | |
| Python | ✅ 3.13.18 | pip 24 disponible, venv OK |
| FFmpeg / ffprobe | ✅ 6.1.1 | encodage H.264 1080×1920 testé |
| Playwright | ✅ 1.63.0 | Chromium préinstallé |
| WebGL headless | ✅ WebGL2 | ANGLE + SwiftShader (rendu CPU) |
| Three.js | ✅ 0.170.0 | scène test : 60 cubes, ombres, 1080×1920 |
| Vitesse de rendu | ✅ ~162 ms/image | 45 s × 30 i/s = 1350 images ≈ **3,6 min** |
| Piper TTS | ⚠️ absent au départ → ✅ installé | `pip install piper-tts` (v1.8.0) ; synthèse française testée |
| Voix Piper FR | ✅ téléchargeables | depuis huggingface.co/rhasspy/piper-voices |
| Machine | 4 CPU, 15 Go RAM, ~60 Go disque libre | |

## Conclusions

1. La chaîne complète (Three.js → Playwright → FFmpeg + Piper) est **techniquement validée**.
2. Piper n'est pas préinstallé : il sera installé automatiquement (pip) dans le workflow.
3. Trois voix françaises distinctes à licence compatible sont disponibles (voir ARCHITECTURE.md §4).
4. Musique et bruitages seront synthétisés par le code pour éliminer tout risque de licence.
