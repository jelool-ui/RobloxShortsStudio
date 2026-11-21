// Scénarios-types originaux (humour d'école, tout public).
//
// Rôles : A = le farceur, B = la maline, C = le peureux (attribués par défaut à Nino, Zoé, Max).
// Dans les textes : {A} {B} {C} = prénoms.
//
// Une étape (step) peut contenir :
//   zone: 'hallway'|'classroom'|'yard', place: { A: 'mark', ... }   → changement de décor
//   s: 'A'         qui parle            l: ['variante 1', 'variante 2', ...]  la réplique
//   a: 'talk'      animation de celui qui parle (talk, point, think, laugh, scared, angry, wave,
//                  celebrate, jump, surprise...)           e: expression (happy, sad, angry...)
//   to: 'B'        à qui il parle (sinon : le plus proche)
//   mv: { C: ['run', 'center'] }    déplacements AVANT la réplique (walk | run)
//   r: { A: 'surprise', B: 'laugh' } réactions des autres pendant la réplique
//   hold: 1.2      étape muette (durée en s)
//   cam: 'closeup'|'medium'|'two'|'wide'|'track'|'low'   plan imposé (sinon automatique)
//   punch: true    zoom d'impact          sfx: 'boing'|'pop'|'buzz'|'whoosh'|'ding'|'sting'
//   opt: true      étape supprimable si l'épisode est trop long
//   v: 'groupe'    variantes LIÉES : toutes les répliques du même groupe utilisent la même variante
//                  (même nombre de variantes, dans le même ordre) → une réponse colle à sa question
//   indep: ['mot'] mots repris d'une réplique précédente, vérifiés à la main : pas de dépendance
export const TEMPLATES = [
  {
    id: 'devoir-oublie',
    titles: ['Le devoir oublié 😱', '{C} a oublié son devoir !', "L'excuse la plus nulle du monde"],
    zones: ['hallway', 'classroom'],
    steps: [
      { zone: 'hallway', place: { A: 'left', B: 'right', C: 'farRight' } },
      {
        s: 'C', mv: { C: ['run', 'center'] }, a: 'scared', e: 'scared', r: { A: 'surprise', B: 'surprise' }, punch: true,
        l: ['{A} ! {B} ! Catastrophe totale !', 'Au secours ! C’est la fin du monde !', 'Alerte maximale, les amis !'],
      },
      { s: 'B', to: 'C', l: ['Calme-toi {C}. Qu’est-ce qui se passe ?', 'Respire, {C}. Raconte-nous tout.'] },
      {
        s: 'C', a: 'scared', e: 'scared',
        l: ['J’ai oublié le devoir de maths ! Le prof va me transformer en brique !', 'Mon devoir de maths… je l’ai oublié à la maison !'],
      },
      { s: 'A', a: 'think', e: 'happy', l: ['Pas de panique. J’ai une excuse parfaite.', 'Tranquille. J’ai un plan génial.'] },
      {
        s: 'A', a: 'point', e: 'happy', r: { B: 'think' }, v: 'excuse',
        l: ['Tu dis qu’un pigeon géant l’a volé pour construire son nid.', 'Tu dis que ton chat l’a imprimé en origami.', 'Tu dis qu’un extraterrestre l’a emprunté.'],
      },
      { s: 'B', a: 'angry', e: 'angry', v: 'verite', l: ['Ou alors… tu dis juste la vérité ?', 'Personne ne va croire ça, {A}.'] },
      { s: 'C', a: 'surprise', v: 'verite', l: ['La vérité ? C’est beaucoup trop risqué !', 'Alors je fais quoi ? Je vais avoir zéro !'], opt: true },
      { zone: 'classroom', place: { A: 'left', B: 'boardLeft', C: 'right' } },
      { s: 'C', mv: { C: ['walk', 'center'] }, a: 'talk', e: 'sad', to: 'B', l: ['Bon… je vais avouer. J’ai oublié mon devoir.', 'Je vais tout dire. Tant pis pour moi.'] },
      {
        s: 'B', a: 'point', e: 'happy', r: { C: 'surprise' }, punch: true, sfx: 'ding', indep: ['devoir'],
        l: ['Attends {C}, regarde le tableau : le devoir, c’est pour lundi prochain !', 'Regarde le tableau ! Le devoir est pour la semaine prochaine !'],
      },
      { s: 'C', a: 'surprise', r: { A: 'laugh' }, l: ['Quoi ?! J’ai paniqué pour rien ?', 'Sérieux ?! Tout ça pour rien ?'] },
      {
        s: 'A', a: 'laugh', e: 'happy', v: 'excuse', indep: ['semaine', 'prochaine'],
        l: ['Bon… le pigeon, je le garde pour la semaine prochaine !', 'Bon… le chat origami, je le garde pour plus tard !', 'Bon… mon extraterrestre, je le garde pour la semaine prochaine !'],
      },
    ],
  },
  {
    id: 'casier-fantome',
    titles: ['Le casier hanté 👻', 'Un fantôme dans le couloir ?!', '{C} a peur du casier'],
    zones: ['hallway'],
    steps: [
      { zone: 'hallway', place: { A: 'farLeft', B: 'farRight', C: 'lockerL' } },
      { hold: 1.0, sfx: 'buzz', r: { C: 'surprise' }, cam: 'closeup:C', punch: true },
      {
        s: 'C', a: 'scared', e: 'scared', mv: { A: ['run', 'left'] }, v: 'vivant',
        l: ['Vous avez entendu ? Le casier vient de parler !', 'Le casier a bougé ! Il est vivant !'],
      },
      { s: 'A', a: 'celebrate', v: 'vivant', l: ['Un casier qui parle ? Trop cool ! Il dit quoi ?', 'Un casier vivant ? Je veux être son ami !'] },
      { s: 'C', a: 'scared', e: 'scared', l: ['Il a fait « bzzzz »… C’est un fantôme, j’en suis sûr !', 'Il fait des bruits bizarres. C’est un fantôme !'] },
      { s: 'B', mv: { B: ['walk', 'right'] }, a: 'talk', to: 'C', l: ['Les fantômes n’existent pas, {C}.', 'Voyons {C}, les fantômes, ça n’existe pas.'] },
      { hold: 1.1, sfx: 'buzz', r: { A: 'surprise', B: 'surprise', C: 'scared' }, cam: 'wide', punch: true },
      { s: 'A', a: 'think', e: 'happy', l: ['Je vais l’ouvrir. Si je disparais, gardez mes chips.', 'J’y vais. Si je ne reviens pas, mangez mon goûter.'] },
      { s: 'B', a: 'talk', r: { C: 'scared' }, l: ['Trois… deux… un…', 'Attention… trois… deux… un !'], opt: true },
      {
        s: 'A', a: 'point', e: 'surprised', sfx: 'pop', r: { C: 'surprise' },
        l: ['C’est… ton téléphone, {C}. Ton réveil sonne !', 'Le fantôme… c’est ton réveil, {C} !'],
      },
      { s: 'C', a: 'talk', e: 'sad', l: ['Ah. J’avais mis une alarme pour… ne pas avoir peur.', 'Oups. J’avais réglé une alarme ce matin.'] },
      { s: 'B', a: 'laugh', v: 'alarme', indep: ['sonne'], l: ['Elle sonne pour quoi, cette alarme ?', 'Et elle sert à quoi, cette alarme ?'] },
      { s: 'C', a: 'celebrate', e: 'happy', r: { A: 'laugh', B: 'laugh' }, v: 'alarme', l: ['Pour me rappeler d’être courageux !', 'À me rappeler que je suis super courageux !'] },
    ],
  },
  {
    id: 'concours-saut',
    titles: ['Le roi du saut 🏆', 'Concours de saut à la récré !', 'Qui saute le plus haut ?'],
    zones: ['yard'],
    steps: [
      { zone: 'yard', place: { A: 'farLeft', B: 'right', C: 'spotR' } },
      { s: 'A', mv: { A: ['run', 'left'] }, a: 'jump', sfx: 'boing', v: 'roi', l: ['Regardez-moi ! Je suis le roi du saut !', 'Admirez le champion du monde du saut !'] },
      { s: 'B', a: 'laugh', to: 'A', v: 'roi', l: ['Le roi ? Tu as sauté à peine plus haut qu’une fourmi.', 'Champion du monde ? Une grenouille saute plus haut.'] },
      { s: 'A', a: 'angry', e: 'angry', indep: ['monde'], l: ['Ah ouais ? Alors concours ! Le perdant porte le sac de tout le monde !', 'Alors on fait un concours ! Le perdant porte les sacs !'] },
      { s: 'B', a: 'jump', sfx: 'boing', l: ['Facile. Admire la technique.', 'Pas de problème. Regarde bien.'] },
      { s: 'A', a: 'jump', sfx: 'boing', indep: ['facile'], l: ['Pff ! Moi je décolle comme une fusée !', 'Trop facile ! Je vole comme un oiseau !'], opt: true },
      { s: 'B', mv: { C: ['walk', 'center'] }, a: 'wave', to: 'C', l: ['{C}, à toi ! Montre-nous ce que tu sais faire.', 'À ton tour, {C} ! Vas-y !'] },
      { s: 'C', a: 'think', e: 'sad', indep: ['saute'], l: ['Moi ? Euh… je ne saute pas trop, d’habitude.', 'Moi ? Je ne suis pas très sportif, tu sais.'] },
      { hold: 0.8, sfx: 'buzz', cam: 'closeup:C' },
      { s: 'C', a: 'scared', e: 'scared', v: 'insecte', l: ['Une abeille ! Une ABEILLE !', 'Au secours ! Une guêpe !'] },
      { hold: 1.3, mv: {}, r: { C: 'jump', A: 'surprise', B: 'surprise' }, sfx: 'boing', cam: 'low:C', punch: true },
      { s: 'A', a: 'surprise', indep: ['sauté'], l: ['Il a sauté plus haut que le panier de basket !', 'Incroyable ! Il a touché les nuages !'] },
      { s: 'B', a: 'laugh', to: 'A', l: ['Le gagnant est {C} ! Et toi {A}, tu portes les sacs.', 'Victoire pour {C} ! {A}, les sacs t’attendent.'] },
      { s: 'A', a: 'talk', e: 'sad', r: { C: 'celebrate' }, v: 'insecte', l: ['Bon… quelqu’un a une abeille pour moi aussi ?', 'La prochaine fois, j’apporte une guêpe.'] },
    ],
  },
  {
    id: 'rumeur-pizza',
    titles: ['La rumeur de la pizza 🍕', 'Fête pizza à la cantine ?!', 'Ne crois pas toutes les rumeurs'],
    zones: ['hallway', 'yard'],
    steps: [
      { zone: 'hallway', place: { A: 'farLeft', B: 'right', C: 'center' } },
      {
        s: 'A', mv: { A: ['run', 'left'] }, a: 'celebrate', r: { C: 'surprise' }, punch: true, v: 'rumeur',
        l: ['Info exclusive ! Il y a une fête pizza aujourd’hui !', 'Grande nouvelle ! Pizza géante à la cantine !'],
      },
      { s: 'C', a: 'celebrate', e: 'happy', v: 'rumeur', l: ['Une fête pizza ? Avec du fromage qui fait des fils ?', 'De la pizza ? Avec plein de fromage ?'] },
      { s: 'A', a: 'talk', e: 'happy', l: ['Avec du fromage, des frites et même un gâteau géant !', 'Et même des frites, et un gâteau de trois étages !'] },
      { s: 'B', a: 'think', to: 'A', l: ['Qui t’a dit ça exactement ?', 'Et tu tiens cette info de qui ?'] },
      { s: 'A', a: 'talk', l: ['Quelqu’un qui l’a entendu de quelqu’un qui l’a lu… quelque part.', 'Le cousin du voisin d’un copain. Fiable à cent pour cent.'] },
      { s: 'B', a: 'angry', e: 'angry', l: ['Donc personne.', 'Donc… personne ne sait.'], opt: true },
      { s: 'C', a: 'talk', e: 'happy', indep: ['cantine'], l: ['On s’en fiche ! Je cours à la cantine !', 'Moi je fonce ! Pizza, me voilà !'] },
      { mv: { C: ['run', 'farRight'] }, sfx: 'whoosh', cam: 'track:C' },
      { zone: 'yard', place: { A: 'left', B: 'right', C: 'center' } },
      { s: 'B', a: 'point', to: 'C', v: 'menu', l: ['Le menu est affiché : soupe de brocolis.', 'Regardez le menu : purée de brocolis.'] },
      { s: 'C', a: 'surprise', e: 'sad', r: { A: 'surprise' }, punch: true, sfx: 'sting', indep: ['pizza'], l: ['Des brocolis ?! Où est ma pizza ?', 'Des brocolis ?! Rendez-moi ma pizza !'] },
      { s: 'A', a: 'think', e: 'happy', v: 'menu', indep: ['pizza'], l: ['En fait… une soupe, c’est une pizza très liquide !', 'En fait… une purée, c’est une pizza très écrasée !'] },
      { s: 'B', a: 'laugh', r: { C: 'laugh' }, l: ['Bien essayé, {A}.', 'Joli rattrapage, {A}.'] },
    ],
  },
  {
    id: 'sac-magique',
    titles: ['Le sac magique 🎒', 'Le sac de {B} contient TOUT', 'Que cache le sac de {B} ?'],
    zones: ['classroom'],
    steps: [
      { zone: 'classroom', place: { A: 'left', B: 'center', C: 'right' } },
      { s: 'B', a: 'celebrate', e: 'happy', r: { A: 'surprise', C: 'surprise' }, l: ['Mon nouveau sac a une poche secrète qui contient tout !', 'Mon sac est magique : il contient absolument tout !'] },
      { s: 'A', a: 'think', to: 'B', l: ['Tout ? Même une calculatrice ?', 'Vraiment tout ? Une calculatrice, par exemple ?'] },
      { s: 'B', a: 'point', sfx: 'pop', r: { A: 'surprise' }, l: ['Évidemment. Et voilà !', 'Facile. Tadam !'] },
      { s: 'C', a: 'talk', to: 'B', v: 'objet', indep: ['poche'], l: ['Et… un parapluie ?', 'Et une lampe de poche ?'] },
      { s: 'B', a: 'point', sfx: 'pop', r: { C: 'celebrate' }, v: 'objet', indep: ['voilà'], l: ['Un parapluie, voilà !', 'Et hop, la voilà !'], opt: true },
      { s: 'A', a: 'laugh', e: 'happy', v: 'animal', l: ['D’accord. Et une girafe ?', 'Ok. Et un dinosaure, alors ?'] },
      { s: 'B', a: 'think', v: 'animal', l: ['Une girafe… attends, je cherche…', 'Un dinosaure… euh… attends…'] },
      { hold: 1.0, sfx: 'pop', r: { B: 'surprise', A: 'surprise', C: 'surprise' }, cam: 'wide', punch: true },
      { s: 'B', a: 'surprise', e: 'happy', v: 'animal', l: ['J’en ai trouvé une… en peluche !', 'Trouvé ! Bon… il est en peluche.'] },
      { s: 'C', a: 'celebrate', e: 'happy', v: 'animal', l: ['Elle est trop mignonne ! Je peux la garder ?', 'Il est trop mignon ! Je peux le garder ?'] },
      { s: 'A', a: 'point', to: 'B', l: ['Fais voir ! Il y a quoi d’autre là-dedans ?', 'Montre ! Qu’est-ce qu’il y a encore au fond ?'] },
      { s: 'B', a: 'think', l: ['Une banane, trois crayons et… le goûter de {C} !', 'Un ballon, une chaussette et… le goûter de {C} !'] },
      { s: 'C', a: 'surprise', e: 'angry', r: { A: 'laugh' }, punch: true, indep: ['cherche'], l: ['Mon goûter ! Je le cherche depuis ce matin !', 'Hé ! C’est mon goûter, ça !'] },
      { s: 'B', a: 'talk', e: 'happy', to: 'C', l: ['Le sac l’a gardé au chaud pour toi.', 'Je te jure, c’est le sac qui l’a pris !'], opt: true },
      { s: 'A', a: 'talk', to: 'B', indep: ['dedans'], l: ['Et mon devoir de français, il est dedans ?', 'Et mes devoirs déjà faits, ils sont dedans ?'] },
      { s: 'B', a: 'laugh', r: { C: 'laugh' }, indep: ['magique'], l: ['Non. Ça, il faut le faire toi-même !', 'Ah non, ça, c’est impossible même pour un sac magique !'] },
    ],
  },
  {
    id: 'interro-surprise',
    titles: ['Interro surprise ?! 📝', 'Panique : INTERRO au tableau !', 'La pire nouvelle de la journée'],
    zones: ['classroom'],
    steps: [
      { zone: 'classroom', place: { A: 'left', B: 'boardRight', C: 'farRight' } },
      {
        s: 'C', mv: { C: ['run', 'right'] }, a: 'scared', e: 'scared', r: { A: 'surprise', B: 'surprise' }, punch: true,
        l: ['Alerte rouge ! Il y a écrit INTERRO au tableau !', 'Catastrophe ! Une interro est annoncée au tableau !'],
      },
      { s: 'A', a: 'surprise', e: 'scared', l: ['Une interro ?! Je n’ai rien révisé !', 'Quoi ?! J’ai même pas ouvert mon cahier !'] },
      { s: 'B', a: 'think', l: ['Pas de panique. On a cinq minutes pour tout apprendre.', 'Restons calmes. On a cinq minutes pour réviser.'] },
      { s: 'A', a: 'talk', e: 'sad', l: ['Cinq minutes ? Je mets cinq minutes à trouver mon stylo !', 'Cinq minutes ? Il me faut ça juste pour me réveiller !'] },
      { s: 'C', a: 'think', indep: ['apprendre'], l: ['Je vais retenir les dates en les chantant…', 'Je vais apprendre les dates en dansant…'], opt: true },
      { s: 'B', mv: { B: ['walk', 'board'] }, a: 'point', to: 'A', l: ['Attendez… Il manque des lettres au mot.', 'Attendez, regardez bien le tableau…'] },
      {
        s: 'B', a: 'celebrate', e: 'happy', r: { A: 'surprise', C: 'surprise' }, punch: true, sfx: 'ding', indep: ['interro'],
        l: ['Ce n’est pas INTERRO… c’est INTER-RÉCRÉ ! Une récré en plus !', 'Ce n’est pas une interro… c’est une récré en plus !'],
      },
      { s: 'A', a: 'celebrate', e: 'happy', indep: ['tableau'], l: ['Une récré en plus ? Meilleure journée de ma vie !', 'Une récré bonus ? Je t’adore, tableau !'] },
      { s: 'C', a: 'talk', e: 'sad', r: { A: 'laugh' }, l: ['J’avais déjà appris trois dates pour rien…', 'J’ai appris trois dates pour rien, moi…'] },
      { s: 'A', a: 'laugh', to: 'C', indep: ['interro'], l: ['Garde-les pour la vraie interro !', 'Range-les, ça servira la semaine prochaine !'] },
    ],
  },
];

export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);
