# Phase 5 — Générateur de scénarios et dialogues (2026-11-21)

Aucune API, aucun réseau : tout est généré localement à partir d'une **graine** (même graine → même épisode).

## Modules (`src/story/`)
| Fichier | Rôle |
|---|---|
| `rng.js` | aléatoire reproductible (mulberry32) |
| `templates.js` | 6 scénarios-types originaux, chaque réplique a 2–3 variantes |
| `generator.js` | graine → histoire : choix du scénario, des variantes, titre, description YouTube avec crédits des voix |
| `storyboard.js` | histoire → séquence animée de **45 s exactement** : déplacements, animations, réactions, regards, plans caméra, zooms d'impact, bruitages, répliques horodatées |
| `../engine/sets/marks.js` | positions de mise en scène des décors (données pures) |

## Les 6 scénarios
| id | Décor(s) | Résumé |
|---|---|---|
| devoir-oublie | couloir → classe | Max a oublié son devoir, Nino invente une excuse absurde… le devoir est pour la semaine prochaine |
| casier-fantome | couloir | un casier « hanté » qui bourdonne… c'est le réveil de Max |
| concours-saut | cour | concours de saut ; Max gagne grâce à une abeille |
| rumeur-pizza | couloir → cour | la rumeur d'une fête pizza… c'est soupe de brocolis |
| sac-magique | classe | le sac de Zoé contient tout… même le goûter de Max |
| interro-surprise | classe | « INTERRO » au tableau… en fait « INTER-RÉCRÉ » |

Rôles : A = farceur (Nino), B = maline (Zoé), C = peureux (Max) — distribution modifiable.
Le décor peut être imposé (couloir / classe / cour) : toutes les marques ont un repli.

## Ajustement automatique à 45 s
1. Durée de chaque réplique = durée réelle de la voix (phase 6) ou estimation.
2. Trop long → suppression des étapes optionnelles, puis silences resserrés ; sinon dépassement signalé.
3. Trop court → silences allongés (jusqu'à 0,8 s).
4. Fin : tout le monde rit / fait la fête (2–6 s), plan large.

## Mise en scène automatique
- Celui qui parle se tourne vers son interlocuteur en restant ouvert vers la caméra (règle du théâtre).
- Ceux qui écoutent regardent celui qui parle ; réactions (surprise, rire, peur, saut) en contrechamp.
- Rotation des plans (moyen / à deux / gros plan), gros plan sur les émotions fortes, travelling sur les déplacements, plan large d'installation à chaque changement de décor.
- Caméra : choisit l'angle dégagé qui montre le mieux le visage ; jamais dans un personnage ni de dos.

## Vérifications
- 36 tests ; dont **360 combinaisons** (6 scénarios × 4 modes de décor × 20 graines) : 45 s exactes, aucun
  dépassement, plans contigus ≥ 0,6 s, répliques sans chevauchement, fin de 2 à 7 s, décor imposé respecté.
- 2 épisodes complets rendus et contrôlés plan par plan (6 corrections de mise en scène).

Commande : `npm run story -- --seed 42 [--zone yard] [--template concours-saut] [--cast nino,zoe,max]`
