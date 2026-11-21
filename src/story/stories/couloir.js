// Série 2 : le couloir (20 histoires). Format : voir src/story/dsl.js
export default String.raw`
=== casier-coince | Le casier coincé
titres: Le casier qui ne veut pas s’ouvrir 🔒 / {C} contre le casier
# hallway A:farLeft B:right C:lockerL
C.angry!angry : Mon casier est coincé ! Mon goûter est dedans !
B.think : Tu as essayé avec ta clé ?
C.talk!sad : Oui. La clé tourne dans le vide.
A.celebrate mv:A=run>left : Pas de souci ! Je connais la technique secrète.
B.surprise!surprised : Quelle technique ?
A.talk : On tape trois fois, on chante, et on souffle sur la serrure.
C.think : Ça ressemble à une formule magique, ton truc.
A.talk : C’est de la science très avancée.
~1.0 sfx:pop r:C=surprise,B=surprise cam:closeup:C punch
C.surprise!surprised : Il s’est ouvert ! Comment c’est possible ?
B.point : C’est parce que tu as enfin tourné la clé dans le bon sens.
A.celebrate!happy : Peu importe ! Ma technique a marché !
C.laugh : Merci quand même pour la chanson.

=== lacet-defait | Le lacet défait
titres: Le lacet le plus dangereux du monde 👟 / Attention au lacet !
# hallway A:left B:center C:right
B.point : {A}, ton lacet est défait. Tu vas tomber.
A.talk : Les lacets, c’est pour les débutants. Moi, je suis un pro.
C.scared!scared : Fais attention, il traîne jusqu’à l’autre bout du couloir !
A.talk : Je marche comme un champion, regardez bien.
~1.0 sfx:boing r:A=jump,B=surprise,C=surprise cam:wide punch
B.surprise!surprised : Tu as sauté par-dessus ton propre lacet ?
A.celebrate!happy : Je vous avais dit : je suis un pro.
C.think : Il en reste un deuxième, de lacet défait.
A.talk : Pas grave, je vais sauter encore.
B.angry!angry : Ou alors tu fais un nœud, comme tout le monde !
A.talk!sad : Je ne sais pas faire de nœud…
C.laugh : Viens, je vais t’apprendre. C’est facile.
B.laugh : Le grand champion apprend enfin à faire ses lacets !

=== message-secret | Le message secret | mystery
titres: Un message secret dans le couloir 🕵️ / Le code mystérieux
# hallway A:left B:lockerR C:right
B.point!surprised r:A=surprise,C=surprise : Il y a un message codé collé sur mon casier !
C.scared!scared : C’est peut-être un espion. Ou un monstre qui sait écrire.
A.think : Lis-le. Je suis un expert en codes secrets.
B.talk : C’est écrit : « Rendez-vous à la récré, sous le grand arbre. »
C.scared!scared : C’est un piège ! Il ne faut pas y aller !
A.talk : Moi, j’irai. Je n’ai peur de rien.
B.think : C’est bizarre, l’écriture ressemble beaucoup à la tienne, {A}.
A.surprise!surprised : Ah bon ? Quelle coïncidence.
C.point : Il y a même un petit dessin de casquette rouge en bas.
A.talk!sad : Bon, d’accord. C’est moi. Je voulais organiser une fête surprise.
B.surprise!happy : Une fête surprise ? Pour qui ?
A.talk : Pour toi, {B}. Mais maintenant, ce n’est plus une surprise.
C.laugh : On fera semblant d’être surpris !

=== porte-qui-grince | La porte qui grince | mystery
titres: La porte qui grince toute seule 🚪 / Le grincement mystérieux
# hallway A:farRight B:left C:doorL
~1.0 sfx:buzz r:C=jump cam:closeup:C punch
C.scared!scared : La porte de la salle grince toute seule !
B.think : C’est sûrement le vent. Les fenêtres sont ouvertes.
C.scared!scared : Le vent ne fait pas « hihihi » !
~1.0 sfx:buzz r:B=surprise,C=scared cam:wide
B.surprise!surprised : D’accord… là, j’ai entendu un petit rire.
C.scared!scared : C’est un fantôme farceur ! Le pire des fantômes !
B.talk : Un fantôme farceur… avec une casquette rouge ?
A.laugh mv:A=walk>right r:C=surprise : Bouh ! Vous m’avez trouvé trop vite.
C.angry!angry : {A} ! Mon cœur bat à cent à l’heure !
A.talk : C’est bon pour le sport, ça.
B.laugh : Le seul fantôme de l’école, c’est toi.
A.celebrate!happy : Le fantôme le plus drôle de l’école !
C.talk!happy : Bon… la prochaine fois, c’est moi qui te fais peur.

=== trophee-brille | Le trophée de l’école
titres: Qui a cassé le trophée ? 🏆 / Le trophée de l’école
# hallway A:left B:center C:right
B.celebrate!happy : Regardez le trophée de l’école dans la vitrine. Il brille !
A.talk : Un jour, j’aurai mon nom gravé dessus.
C.think : Pour quoi ? Le concours du plus gros dormeur ?
A.angry!angry : Non ! Pour le concours du plus grand sportif.
B.talk : Il faudrait d’abord que tu fasses du sport, {A}.
A.talk : Je cours tous les jours. Vers la cantine.
C.laugh : Ça compte, ça ?
B.think : Attendez… le trophée a une petite étiquette.
C.point : C’est écrit : « Champion de la sieste ».
A.surprise!surprised r:B=laugh,C=laugh punch : Quoi ? Ce trophée existe vraiment ?
B.laugh : Alors tu as toutes tes chances, {A} !
A.celebrate!happy : Enfin un concours fait pour moi !

=== interdit-de-courir | Interdit de courir
titres: Interdit de courir dans le couloir 🏃 / La course interdite
# hallway A:farLeft B:center C:right
B.point : Le règlement est clair : on ne court pas dans le couloir.
C.talk : Moi, je ne cours jamais. C’est trop dangereux.
A.celebrate mv:A=run>left : Attention ! J’arrive à toute vitesse !
B.angry!angry : {A} ! On ne court pas dans le couloir !
A.talk : Je ne cours pas. Je marche très vite.
C.think : Tes deux pieds ne touchent plus le sol, là.
A.talk : C’est une marche olympique. Un sport officiel.
B.talk : Et pourquoi tu es si pressé ?
A.talk : C’est la journée des crêpes à la cantine !
C.surprise!surprised r:B=surprise punch : Des crêpes ? Il fallait le dire plus tôt !
C.scared mv:C=run>farRight : Désolé, je marche très vite aussi !
B.laugh : Bon… moi aussi, alors. Mais en marchant !

=== sonnerie-avance | La sonnerie en avance
titres: La sonnerie a sonné trop tôt 🔔 / Récré surprise ?
# hallway A:left B:center C:right
~1.0 sfx:ding r:A=jump,B=surprise,C=surprise cam:wide punch
A.celebrate!happy : La sonnerie ! C’est la récré ! Tous dehors !
B.think : Attends, il est seulement dix heures moins le quart.
C.talk : La sonnerie s’est peut-être trompée.
A.talk : Une sonnerie ne se trompe jamais. C’est la loi.
B.talk : On devrait vérifier avant de sortir.
A.talk : Trop tard, mon cœur est déjà en récré.
C.scared!scared : Et si on se fait gronder ?
B.point : Regardez, la maîtresse arrive. Elle a l’air pressée.
C.talk : Elle dit que c’est une erreur ! On retourne en classe.
A.talk!sad : Non ! Mon cœur était déjà dans la cour.
B.laugh : Va le chercher, et reviens vite.
C.laugh : Le cœur de {A} est en avance de quinze minutes !

=== objets-trouves | Les objets trouvés
titres: Le trésor des objets trouvés 📦 / La boîte des objets perdus
# hallway A:left B:lockerR C:right
B.point : Voici la boîte des objets trouvés. Elle déborde !
A.celebrate : C’est une chasse au trésor ! Je fouille !
C.talk : Il y a trois écharpes, deux gants et un parapluie cassé.
A.talk : Et une chaussure toute seule. Qui perd une seule chaussure ?
B.think : Quelqu’un qui est rentré chez lui à cloche-pied.
A.point!surprised r:B=surprise : Oh ! Une casquette rouge exactement comme la mienne !
C.talk : C’est peut-être ton jumeau secret.
A.talk : Ou alors c’est la mienne, perdue l’année dernière.
B.surprise!surprised : Alors, celle que tu portes, c’est à qui ?
A.surprise!surprised punch : Je ne sais pas… je l’ai trouvée dans cette boîte !
C.laugh r:B=laugh : Il porte les objets trouvés depuis un an !
A.talk!happy : Maintenant, j’en ai deux. Une pour chaque jour pair.

=== escargot-voyageur | L’escargot voyageur
titres: Un escargot dans le couloir 🐌 / L’escargot qui voulait aller en classe
# hallway A:left B:center C:right
C.point!surprised r:A=surprise,B=surprise : Il y a un escargot qui traverse le couloir !
A.celebrate : Il vient sûrement s’inscrire à l’école.
B.think : Il a dû entrer par la porte de la cour.
C.talk : Il est tellement lent. Il va arriver en classe l’année prochaine.
A.talk : On devrait l’aider. Je le porte jusqu’à la salle de sciences.
B.talk : Doucement. Il est fragile.
C.scared!scared : Il bave ! Il y a de la bave partout sur ta main !
A.talk : Ce n’est pas de la bave. C’est de la colle naturelle.
B.laugh : C’est la même chose, {A}.
A.talk : Bon. Il s’appellera Turbo.
C.laugh : Turbo ? Le plus lent de l’école ?
A.celebrate!happy : C’est pour l’encourager !

=== chaussettes-depareillees | Les chaussettes dépareillées
titres: La mode des chaussettes dépareillées 🧦 / Une chaussette de chaque couleur
# hallway A:left B:center C:right
B.point : {C}, tu as une chaussette rouge et une chaussette verte !
C.surprise!surprised : Oh non ! Je me suis habillé dans le noir ce matin.
A.think : C’est génial, en fait. C’est la nouvelle mode.
C.talk!sad : Tout le monde va se moquer de moi.
A.talk : Pas si on le fait tous. Regardez !
A.celebrate : J’ai mis une chaussette jaune et une chaussette bleue.
B.surprise!surprised : Tu les as échangées dans le couloir ?
A.talk : Non. Moi, je m’habille toujours comme ça.
C.laugh : Alors, je suis à la mode sans le savoir !
B.think : Bon… demain, je mets une chaussette à pois et une à rayures.
A.celebrate!happy : Bienvenue dans le club des chaussettes folles !
C.laugh : On va lancer une mode dans toute l’école !

=== cle-perdue | La clé perdue
titres: La clé de la salle a disparu 🔑 / Enfermés dehors !
# hallway A:left B:doorR C:right
B.angry!angry : La porte de la salle est fermée et la clé a disparu !
C.scared!scared : On ne pourra jamais rentrer en classe !
A.celebrate : Donc… pas de leçon aujourd’hui ? Quel dommage !
B.think : Réfléchissons. Qui a fermé la porte en dernier ?
C.talk : C’était {A}. Il voulait faire une blague.
A.talk : Moi ? J’ai juste fermé la porte. Pas à clé.
B.point : Alors pourquoi tu as une clé autour du cou ?
A.surprise!surprised punch : Ah… je croyais que c’était un collier.
C.laugh r:B=laugh : Un collier en forme de clé, avec écrit « salle douze » ?
A.talk!sad : Bon, d’accord. Je l’ouvre. Dommage pour les vacances.
B.laugh : Merci, {A}. La leçon peut commencer.
A.talk : Vous êtes sûrs ? On pourrait chercher encore un peu.

=== bruit-de-pas | Les bruits de pas | mystery
titres: Des pas dans le couloir vide 👣 / Qui marche là ?
# hallway A:farRight B:left C:center
~1.0 sfx:buzz r:C=scared cam:closeup:C punch
C.scared!scared : Vous entendez ? Des pas dans le couloir… mais il n’y a personne !
B.think : C’est peut-être l’écho de nos propres pas.
C.scared!scared : On ne marche pas ! On est immobiles !
~1.0 sfx:buzz r:B=surprise,C=jump cam:wide punch
B.surprise!surprised : Ça se rapproche…
C.scared!scared : C’est le fantôme du concierge ! Je le savais !
A.laugh mv:A=walk>right : Salut ! J’ai mis les chaussures de claquettes de ma sœur.
B.angry!angry : {A} ! On croyait que c’était un fantôme !
A.talk : Elles font un bruit génial, non ? Écoutez.
C.talk!sad : Mes jambes tremblent encore…
B.laugh : On devrait te mettre une clochette, comme ça on saura toujours où tu es.
A.celebrate!happy : Une clochette ? Génial, j’en veux une !

=== tableau-affichage | Le tableau d’affichage
titres: L’annonce incroyable du tableau d’affichage 📌 / Une sortie à la plage ?
# hallway A:left B:center C:right
B.point : Il y a une nouvelle annonce sur le tableau d’affichage.
A.celebrate : C’est peut-être une sortie à la plage !
C.talk : Ou une journée sans devoirs.
B.think : C’est écrit : « Concours de la plus belle citrouille ».
A.talk!sad : Une citrouille ? Je ne sais même pas où ça pousse.
C.talk : Dans un potager, je crois. Avec de la patience.
A.think : Ou alors… j’en peins une grosse en carton.
B.angry!angry : Ce n’est pas une vraie citrouille, ça.
A.talk : C’est une citrouille d’artiste.
C.point!surprised r:A=surprise punch : Attendez, il y a une deuxième ligne : « Le gagnant mange la soupe. »
A.talk!sad : De la soupe de citrouille ? Je retire ma candidature.
B.laugh : Le concours le plus court de l’histoire !

=== carte-anniversaire | La carte d’anniversaire
titres: La carte d’anniversaire géante 🎂 / Joyeux anniversaire, {C} !
# hallway A:left B:center C:farRight
A.talk : Vite, {C} arrive ! Cache la carte d’anniversaire !
B.talk : Elle est trop grande. Elle fait deux mètres de long !
A.talk : C’est normal. On a tous signé dessus. Même le directeur.
C.talk mv:C=walk>right : Salut ! Pourquoi vous êtes devant ce grand carton ?
A.talk : Quel carton ? Il n’y a pas de carton.
C.think : Je vois écrit « Joyeux anniversaire » dessus.
B.talk!sad : Bon… surprise, {C} !
C.surprise!surprised punch : Mais… mon anniversaire, c’est dans six mois !
A.surprise!surprised r:B=surprise : Six mois ? On s’est trompés de date ?
B.laugh : Ce n’est pas grave. On la garde jusque-là.
C.celebrate!happy : C’est la plus belle carte, même en avance !
A.laugh : On fêtera aussi ton demi-anniversaire !

=== moustache-dessin | La moustache dessinée
titres: Qui a dessiné une moustache ? 🥸 / La moustache mystère
# hallway A:left B:center C:right
B.point!surprised r:A=surprise,C=surprise : Quelqu’un a dessiné une moustache sur l’affiche de la fête !
C.scared!scared : Si on nous accuse, on va être punis !
A.think : Je vais trouver le coupable. Un vrai détective n’abandonne jamais.
B.talk : La moustache est dessinée au feutre noir.
C.talk : Avec des petites boucles au bout. C’est très joli, en fait.
A.talk : Le coupable a beaucoup de talent. Ce n’est donc pas moi.
B.think : Attends… {C}, tu as du feutre noir sur les doigts.
C.surprise!surprised punch : Oh non ! C’était pour décorer ma trousse !
A.laugh : Le coupable, c’est {C} ! Je n’y crois pas !
C.talk!sad : Je voulais juste qu’elle ait l’air plus sérieuse.
B.laugh : On va l’effacer. Mais garde ton talent pour le concours de dessin.
A.celebrate!happy : Et moi, j’ai résolu l’affaire !

=== rumeur-prof-robot | Le nouveau professeur
titres: Le nouveau prof est un robot ?! 🤖 / La rumeur du prof robot
# hallway A:left B:center C:right
A.talk : J’ai entendu que le nouveau professeur est un robot.
C.scared!scared : Un robot ? Il va nous donner des devoirs en binaire !
B.think : Qui t’a raconté ça, {A} ?
A.talk : Personne. Mais il marche très droit et il ne cligne jamais des yeux.
C.scared!scared : C’est la preuve ! Les robots ne clignent pas des yeux !
B.talk : Ou alors il porte des lunettes de soleil.
A.talk : Et il boit de l’huile à la récré.
B.surprise!surprised : De l’huile ? Tu es sûr ?
A.talk!sad : Bon… c’était peut-être du thé.
C.think : Et il a dit bonjour avec une voix très normale.
B.laugh : Donc c’est un humain. Un humain très calme.
A.talk : Un humain très calme… ou un robot très bien déguisé.

=== fontaine-a-eau | La fontaine à eau
titres: La fontaine à eau en folie 💦 / Le jet d’eau surprise
# hallway A:left B:center C:right
C.talk : J’ai soif. Je vais boire à la fontaine.
A.think : Attention, elle est très capricieuse. Il faut appuyer doucement.
C.talk : Doucement, d’accord.
~1.0 sfx:whoosh r:C=jump,A=surprise,B=surprise cam:wide punch
C.surprise!surprised : Elle m’a arrosé jusqu’aux lunettes !
B.laugh : Tu as appuyé avec les deux mains, {C}.
C.talk!sad : Elle avait l’air si gentille, pourtant.
A.talk : Laisse-moi faire. Je suis le maître des fontaines.
B.angry!angry : Non, {A} ! Tu vas inonder le couloir !
~1.0 sfx:whoosh r:A=jump,B=surprise cam:closeup:A
A.surprise!surprised : Bon… le maître est un peu mouillé.
C.laugh : On dirait qu’on sort de la piscine !
B.laugh : La fontaine a gagné. Deux à zéro.

=== pas-de-sport | Le doigt magique
titres: {A} ne veut pas faire sport 🤸 / La meilleure excuse anti-sport
# hallway A:left B:center C:right
A.talk!sad : Aïe, aïe, aïe… j’ai très mal au petit doigt.
B.think : C’est bizarre. Ça a commencé quand le cours de sport a été annoncé.
A.talk : Quelle coïncidence. C’est un mal terrible.
C.talk : C’est quel sport, aujourd’hui ?
B.talk : Gymnastique. Roulades et équilibre.
A.talk!sad : Oh non… mon doigt me fait encore plus mal.
C.talk : Moi, j’adore les roulades. C’est comme rouler dans l’herbe.
B.point : Et après le sport, il y a une distribution de bonbons.
A.surprise!surprised r:B=laugh punch : Des bonbons ? Mon doigt est guéri ! C’est un miracle !
C.laugh : La médecine des bonbons, c’est la plus rapide !
B.laugh : Allez, {A}. Roulade !
A.talk : D’accord. Mais une roulade très lente.

=== echange-casiers | L’échange de casiers
titres: {A} et {C} échangent leurs casiers 🔄 / Le casier en désordre
# hallway A:lockerL B:center C:lockerR
A.talk : {C}, on échange nos casiers pour une semaine ?
C.think : Pourquoi ? Le tien est plus près de la cantine.
A.talk : Justement. Je veux faire du sport en marchant plus loin.
B.think : Toi, faire du sport ? Il y a quelque chose de louche.
C.talk : D’accord. Tiens, voilà ma clé.
~1.0 sfx:pop r:C=surprise,B=surprise cam:closeup:C punch
C.surprise!surprised : Ton casier est rempli de chaussettes sales !
A.talk : Ah oui. C’est pour ça que je voulais changer.
B.angry!angry : {A} ! C’est dégoûtant !
A.talk : Elles sont propres de l’intérieur.
C.angry!angry : Je te rends ton casier. Et tes chaussettes.
B.laugh : Échange annulé pour cause de chaussettes !

=== record-glissade | La glissade
titres: La glissade du couloir 🛝 / Le sol tout juste lavé
# hallway A:farLeft B:center C:right
B.point : Attention, le sol vient d’être lavé. C’est très glissant.
C.scared!scared : Alors je ne bouge plus. Je reste ici jusqu’à demain.
A.talk : Glissant ? C’est une patinoire gratuite !
B.angry!angry : {A}, non ! Le concierge va être furieux !
A.celebrate mv:A=run>left : Regardez-moi ! Je suis un champion de patinage !
~1.0 sfx:whoosh r:B=surprise,C=surprise cam:wide punch
C.surprise!surprised : Il a glissé jusqu’au bout du couloir !
B.think : Et il s’est arrêté pile devant le concierge.
A.talk!sad : Bonjour monsieur… joli sol. Très propre.
C.laugh : Il va devoir passer la serpillière, maintenant.
A.talk : Bon. Au moins, je glisserai en nettoyant.
B.laugh : Le premier patineur-nettoyeur de l’histoire !
`;
