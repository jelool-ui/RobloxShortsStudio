# RobloxShortsStudio

Générateur automatique d'épisodes 3D originaux de style « blocs » (45 s, vertical, YouTube Shorts).
Three.js · Playwright · FFmpeg · Piper TTS · GitHub Actions — 100 % gratuit, sans API externe.

- **Utilisation depuis un téléphone : [docs/GUIDE_ANDROID.md](docs/GUIDE_ANDROID.md)**
- Architecture : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Rapport phase 1 : [docs/PHASE1_RAPPORT.md](docs/PHASE1_RAPPORT.md)
- Vérifier l'environnement : `bash scripts/check-env.sh`

## Commandes

| Commande | Rôle |
|---|---|
| `npm install` | installe les dépendances |
| `npm run dev` | interface en mode développement |
| `npm run build` | construit l'interface et la page de rendu dans `dist/` |
| `npm test` | tests automatiques |
| `npm run smoke` | test de bout en bout : rendu 3D 2 s → MP4 vérifié (`output/smoke/smoke.mp4`) |
| `pip install -r requirements.txt` | installe Piper TTS |
| `npm run story -- --seed 42` | génère une histoire + storyboard (sans rendu) |
| `npm run audio -- --seed 42` | voix + lip-sync + musique + bruitages + mixage |
| **`npm run generate -- --seed 42`** | **épisode complet : MP4 vérifié + miniature + texte YouTube** (`output/episodes/<id>/`) |

Options de `generate` : `--zone auto|hallway|classroom|yard`, `--template <id>`, `--cast nino,zoe,max`,
`--quality fast|high` (fast = 3D en 720p agrandie, 2,4× plus rapide), `--keep-frames`.

## Automatisation GitHub Actions
| Workflow | Déclenchement | Rôle |
|---|---|---|
| **Générer un épisode** (`generate.yml`) | manuel (« Run workflow ») ou tableau de bord | épisode complet → artefact MP4 + release |
| Publier le tableau de bord (`pages.yml`) | push sur `main` (interface) | tableau de bord mobile sur GitHub Pages |
| CI (`ci.yml`) | push / manuel | tests, audio, prononciation, rendu de contrôle |

## Licences
Code : projet personnel. Voix Piper : siwis (CC-BY 4.0), upmc (CC-BY-SA 4.0), gilles (CC0) — crédits
ajoutés automatiquement à chaque description. Police Lilita One : SIL OFL 1.1 (`assets/fonts/OFL.txt`).
Musique et bruitages : générés par le code.
