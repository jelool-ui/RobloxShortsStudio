# Phase 6 — Piper TTS et audio (2026-11-21)

## Chaîne audio (`npm run audio -- --seed 42`)
```
répliques → Piper (lot Python, chaque voix chargée une fois) → hauteur ajustée (FFmpeg rubberband)
→ 48 kHz, silences retirés → durées réelles → storyboard recalé (accélération auto si > 45 s)
→ courbes de lip-sync → musique + bruitages synthétisés → mixage avec ducking
→ normalisation EBU R128 2 passes (−14 LUFS visé) → audio.wav 48 kHz stéréo, 45,000 s
```

## Modules
| Fichier | Rôle |
|---|---|
| `pipeline/lib/voices.js` | télécharge (si absents) et vérifie les modèles Piper depuis le dépôt officiel `rhasspy/piper-voices` (v1.0.0) |
| `pipeline/tts_piper.py` | synthèse par lots (API Python Piper) |
| `pipeline/lib/tts.js` | texte prononçable, hauteur par personnage, rééchantillonnage, découpe des silences |
| `pipeline/lib/lipsync.js` | enveloppe RMS → ouverture de bouche par image (normalisée, légère avance, attaque/relâchement) |
| `pipeline/lib/synth.js` | musique procédurale (gai / mystère, tempo et tonalité selon la graine) + 6 bruitages |
| `pipeline/lib/mix.js` | mixage, ducking de la musique sous les voix, limiteur doux, normalisation |
| `pipeline/lib/wav.js` | lecture/écriture WAV sans dépendance |
| `pipeline/audio.js` | orchestration + vérifications |

## Trois voix distinctes (mesure de hauteur réelle)
| Personnage | Modèle | Réglage | Hauteur mesurée |
|---|---|---|---|
| Max | upmc / pierre (CC-BY-SA 4.0) | ±0, débit 1,02 | ~125 Hz (grave) |
| Nino | gilles (CC0) | +7 demi-tons, débit 0,92 | ~161 Hz (vif) |
| Zoé | siwis (CC-BY 4.0) | +2,5 demi-tons, débit 0,95 | ~280 Hz |

Premier réglage : Nino et Max mesuraient tous deux 133 Hz → corrigé.

## Musique et bruitages
Synthétisés par le code (aucun fichier, aucune licence) : basse, nappe, arpège, mélodie à motif
répété, batterie ; ambiance « mystère » pour le casier hanté. Bruitages : boing, pop, buzz, whoosh, ding, sting.

## Vérifications automatiques (une erreur = échec de la génération)
Durée audio = 45 s ± 0,05 · mixage non silencieux · chaque réplique audible · chaque courbe de lip-sync active.

## Résultats
- 46 tests (10 nouveaux pour l'audio).
- Les 6 scénarios passent avec les vraies voix, sans accélération (25–36 s de parole).
- Épisode complet rendu avec voix et lip-sync : MP4 validé (45 s, H.264 1080×1920 + AAC 48 kHz), volume −15 LUFS.
- Audio d'un épisode produit en ~6 s.
