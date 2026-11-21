// Série 1 : la vie en classe (20 histoires). Format : voir src/story/dsl.js
export default String.raw`
=== hamster-evade | Le hamster évadé
titres: Le hamster s’est évadé ! 🐹 / Alerte : hamster en fuite !
# classroom A:left B:boardLeft C:farRight
C.scared!scared mv:C=run>right r:A=surprise,B=surprise punch : Alerte ! Le hamster de la classe a disparu !
A.celebrate : Une évasion ! Comme dans les films !
B.think : Réfléchissons. Il adore les graines de tournesol.
C.scared!scared : Et s’il s’était caché dans mon sac ?
B.talk opt : Ne crie pas, {C}. Tu vas lui faire peur.
A.point : Vérifie ! Il a peut-être fait un nid dans ta trousse.
~1.0 sfx:pop r:C=surprise cam:closeup:C punch
C.talk!sad : Non… c’est juste ma chaussette roulée en boule.
A.talk : Pourquoi tu as une chaussette dans ta poche ?
C.talk : Pour les urgences. On ne sait jamais.
A.think opt : Toujours pas de hamster. Il est trop fort.
B.point!surprised r:A=surprise punch : Attendez… regardez sur la tête de {A} !
A.surprise : Il dort dans ma casquette ?!
C.laugh : Il a trouvé le meilleur nid de l’école !

=== photo-de-classe | La photo de classe
titres: La photo de classe ratée 📸 / Souriez… ou pas !
# classroom A:left B:center C:right
B.celebrate!happy : C’est le jour de la photo de classe ! Tout le monde sourit !
C.scared!scared : Je déteste les photos. Je cligne toujours des yeux.
A.think : J’ai une idée : on fait tous une grimace !
B.angry!angry : Non ! Cette photo va rester dans l’album pour toujours.
A.talk : Justement. Dans vingt ans, on va bien rigoler.
C.think : Bon… je vais garder les yeux grands ouverts.
~1.0 sfx:ding r:A=surprise,B=surprise,C=scared cam:wide punch
B.talk : Le flash ! Alors, la photo est réussie ?
A.laugh r:C=surprise : {C}, tu as fermé les yeux… et ouvert la bouche !
C.talk!sad : Bon. Au moins, je suis le plus original.
B.laugh : Tu seras la star de l’album !

=== dictee-piege | La dictée piège
titres: La dictée la plus dure du monde ✏️ / Le mot impossible
# classroom A:left B:boardRight C:right
B.point : Le mot de la dictée d’aujourd’hui : anticonstitutionnellement.
C.scared!scared r:A=surprise : C’est un mot ou une formule magique ?
A.talk : Facile ! Ça s’écrit comme ça se prononce.
C.talk : Il fait au moins un kilomètre de long.
B.think : Ah oui ? Alors épelle-le, pour voir.
A.talk : A… N… T… euh… beaucoup de lettres… et un point final !
C.laugh : Il a trouvé la bonne fin, au moins.
B.talk opt : Il faut le couper en morceaux pour l’apprendre.
A.think!happy : Moi, je propose de le couper… et de garder juste le début.
B.angry!angry : On ne peut pas raccourcir les mots, {A} !
C.celebrate!happy : Si ! Moi, je l’écris : « anti… etc. »

=== plante-parlante | La plante qui parle | mystery
titres: La plante de la classe parle 🌱 / Une plante bavarde ?!
# classroom A:farLeft B:boardLeft C:left
~1.0 sfx:buzz r:C=surprise cam:closeup:C punch
C.scared!scared : La plante verte vient de me dire « arrose-moi » !
B.think : Une plante ne parle pas, {C}. Elle n’a pas de bouche.
C.scared!scared : Je te jure ! Elle a une toute petite voix grave.
~1.0 sfx:buzz r:B=surprise,C=scared cam:wide punch
B.surprise!surprised : D’accord… ça, je l’ai entendu aussi.
C.scared!scared : Elle a faim ! Elle va nous manger !
A.laugh mv:A=walk>center r:B=surprise,C=surprise : C’était moi ! Je parlais derrière le pot de fleurs !
B.angry!angry : {A} ! Tu nous as fait peur pour rien.
A.talk : Pas pour rien : elle avait vraiment soif.
C.talk!happy : Bon… je vais lui donner un peu d’eau, alors.

=== robot-science | Le robot de science
titres: Notre robot a pris le contrôle 🤖 / Le robot qui obéit… presque
# classroom A:left B:center C:right
B.celebrate!happy : Notre robot de science est prêt ! Il obéit à la voix.
A.point : Robot ! Fais mes devoirs à ma place !
~1.0 sfx:pop r:A=surprise,C=surprise cam:wide
C.scared!scared : Il bouge ! Il se dirige vers moi !
B.think : Normal, je l’ai programmé pour suivre la personne la plus calme.
C.scared!scared : Je ne suis pas calme du tout, là !
A.laugh : Il te fait un câlin, {C} !
C.surprise!happy : Oh… c’est plutôt gentil, en fait.
A.talk!sad : Pourquoi il ne me fait pas de câlin, à moi ?
B.laugh : Parce que tu bouges tout le temps, {A}.
B.talk : Et maintenant, il va ranger la classe.
A.surprise!surprised r:C=laugh punch : Attends ! Il range aussi mon goûter… dans la poubelle !
B.laugh : Il trie les déchets. Très bon robot.

=== volcan-experience | L’expérience du volcan
titres: L’expérience du volcan a dérapé 🌋 / Éruption en classe !
# classroom A:left B:boardRight C:right
B.point : Pour le volcan : du vinaigre et une cuillère de bicarbonate.
A.think!happy : Une cuillère ? Moi, je mets tout le paquet.
C.scared!scared : Non ! Ça va déborder partout !
A.talk : Plus il y a de mousse, plus on a une bonne note.
B.talk : Ce n’est pas comme ça que ça marche, {A}.
A.talk : Trop tard, j’ai déjà tout versé.
C.scared!scared : Ça commence à faire des bulles…
~1.2 sfx:whoosh r:A=surprise,B=surprise,C=jump cam:wide punch
B.surprise!surprised : Il y a de la mousse jusqu’au plafond !
C.scared!scared : On est en train de couler dans la mousse !
A.celebrate!happy : C’est le plus beau volcan de l’histoire !
B.angry!angry : C’est surtout toi qui vas tout nettoyer.
A.talk!sad : Bon… quelqu’un a une éponge géante ?

=== election-delegue | L’élection du délégué
titres: Qui sera délégué de classe ? 🗳️ / La campagne électorale de {A}
# classroom A:center B:left C:right
A.celebrate!happy : Votez pour moi ! Je promets une récré toute la journée !
B.angry!angry : Ce n’est pas possible, ça. Il faut des promesses réalistes.
A.talk : D’accord. Une récré toute la matinée, alors.
B.talk : Moi, je promets une bibliothèque mieux rangée.
A.laugh : Une bibliothèque ? Personne ne va voter pour ça.
B.angry!angry : Si ! Les gens qui aiment lire, par exemple.
C.think : Et moi, je promets des toboggans entre les étages.
A.surprise!surprised r:B=surprise : Des toboggans ? Je vote pour toi !
B.talk!happy : Moi aussi. C’est la meilleure idée.
C.surprise!surprised punch : Attendez… je ne voulais pas être délégué, moi !
A.laugh r:B=laugh : Trop tard, monsieur le délégué !

=== bibliotheque-silence | Silence à la bibliothèque
titres: Le fou rire de la bibliothèque 📚 / Interdit de rire !
# classroom A:left B:center C:right
B.talk : On est à la bibliothèque. Ici, on chuchote.
A.talk : Je chuchote. Je n’ai jamais été aussi silencieux.
C.think : Chut… j’essaie de lire mon livre de monstres.
A.talk : Il fait peur, ton livre ?
C.talk!scared : Très peur. Je le lis avec les yeux à moitié fermés.
A.point : Regarde, {C}, il y a un monstre derrière toi !
~0.9 r:C=jump,B=surprise cam:low:C punch sfx:boing
C.scared!scared : Où ça ? Où ça ?
B.angry!angry : {A} ! On avait dit pas de bruit !
A.laugh : C’est lui qui a sauté ! Moi, j’ai juste chuchoté.
B.talk : Tout le monde nous regarde maintenant…
C.talk!angry : Tu vas voir. Ce soir, je te lis l’histoire du monstre.
A.scared!scared : Euh… finalement, j’adore le silence.

=== craie-disparue | Les craies disparues
titres: Qui a volé les craies ? 🕵️ / L’enquête des craies
# classroom A:left B:boardLeft C:right
B.point!surprised r:A=surprise,C=surprise : Toutes les craies ont disparu du tableau !
C.scared!scared : Un voleur de craies ! Il est peut-être encore là !
A.think : Je vais mener l’enquête. Je suis un super détective.
C.talk : Tu as une loupe, au moins ?
A.talk : Pas besoin. J’ai des yeux de lynx.
B.talk : Alors, détective, quel est ton premier indice ?
A.point : Des traces blanches… qui vont jusqu’à {C} !
C.surprise!surprised : Moi ? Je n’ai rien fait !
A.point : Le coupable dit toujours ça.
B.think : Attends… {C}, regarde tes mains.
C.talk!sad : Bon… je les ai prises pour dessiner une marelle.
A.celebrate!happy : Affaire résolue ! Je suis génial.
B.laugh : Tu as surtout eu de la chance.

=== cartable-lourd | Le cartable trop lourd
titres: Le cartable le plus lourd du monde 🎒 / Que cache le cartable de {C} ?
# classroom A:left B:center C:farRight
C.scared!sad mv:C=walk>right : Mon cartable est tellement lourd… je n’avance plus.
A.laugh : Tu as mis des briques dedans ?
C.talk : Non ! Juste mes livres, mes cahiers et mon dictionnaire.
A.talk : Le dictionnaire, c’est le plus lourd. Tous ces mots…
B.think : Ça ne devrait pas peser autant. Ouvre-le.
~1.0 sfx:pop r:A=surprise,B=surprise cam:closeup:C
C.surprise!surprised : Il y a… une pierre énorme au fond !
A.laugh r:B=angry : Ah oui, c’est moi. Je l’ai trouvée ce matin, elle est jolie.
C.angry!angry : Je la porte depuis la maison, {A} !
A.talk : Tu as fait du sport sans le savoir. Merci qui ?
B.laugh : Voilà pourquoi tu as de si gros bras, {C} !

=== lunettes-perdues | Les lunettes perdues
titres: {C} a perdu ses lunettes 👓 / Où sont les lunettes ?
# classroom A:left B:boardRight C:center
C.scared!scared : J’ai perdu mes lunettes ! Je ne vois plus rien !
A.think : Tu les as cherchées sous ta table ?
C.talk : Oui ! Et dans ma trousse, et dans mon sac.
A.talk : Et dans le frigo de la cantine ?
C.talk : Pourquoi je les aurais mises dans le frigo ?
A.talk : Je ne sais pas. Moi, j’y ai bien retrouvé ma chaussure.
B.think : Elles sont peut-être restées à la cantine.
A.point : Ou alors, c’est un fantôme qui les porte !
C.scared!scared : Un fantôme qui voit mieux que moi ? C’est horrible !
B.laugh : {C}… elles sont sur ton nez.
C.surprise!surprised punch : Ah. C’est pour ça que je voyais si bien en les cherchant !
A.laugh r:B=laugh : Le grand détective {C} a encore frappé !

=== casquette-volee | La casquette disparue
titres: Qui a pris la casquette de {A} ? 🧢 / Le mystère de la casquette
# classroom A:center B:left C:right
A.angry!angry : Quelqu’un a volé ma casquette rouge ! C’est très grave !
B.think : Tu l’avais où, la dernière fois que tu l’as vue ?
A.talk : Ce matin, dans le miroir. Elle m’allait très bien.
C.talk : Il faut prévenir la police !
B.talk : Pour une casquette ? Calme-toi, {C}.
A.angry!angry : Ce n’est pas une casquette ! C’est ma casquette porte-bonheur !
C.scared!scared : Un voleur de casquettes ? Il va peut-être prendre mes lunettes !
B.point : Je crois savoir qui c’est.
A.surprise!surprised : Qui ? Dis-le-moi !
B.laugh r:C=laugh punch : Toi. Tu l’as sur la tête, {A}.
A.talk!happy : Ah oui. Elle est tellement légère que je l’oublie.
C.laugh : Comme mes lunettes ! C’est contagieux !

=== poisson-avril | Le poisson d’avril
titres: Le poisson d’avril de {A} 🐟 / Qui a un poisson dans le dos ?
# classroom A:left B:center C:right
A.laugh : Aujourd’hui, c’est le premier avril. Personne n’est à l’abri !
C.scared!scared : Ne me colle pas de poisson dans le dos, s’il te plaît.
A.talk : Je ne ferais jamais ça à un ami.
B.think : C’est bizarre, tu as des ciseaux et du papier bleu.
A.talk!happy : C’est pour un exposé… sur la mer.
A.talk : Promis. Je ne toucherai pas à ton dos.
B.think : Tu prépares quelque chose, toi.
A.talk!happy : Moi ? Jamais. Je suis le plus sage de l’école.
C.point!surprised r:A=surprise punch : {A}… tu as trois poissons collés dans ton dos !
A.surprise!surprised : Quoi ?! Qui a fait ça ?
B.laugh r:C=laugh : Le piégeur s’est fait piéger !
A.talk!sad : Bon… au moins, ils sont jolis.

=== exercice-incendie | L’exercice d’évacuation
titres: L’exercice incendie de {C} 🚨 / Évacuation… dans le calme ?
# classroom A:left B:center C:right
~1.0 sfx:buzz r:A=surprise,B=surprise,C=jump cam:wide punch
C.scared!scared : L’alarme ! Sauve qui peut ! On va tous partir !
B.talk : Calme-toi ! C’est juste un exercice d’évacuation.
A.celebrate : Super ! On a le droit de sortir sans cartable !
C.scared!scared : Et si ce n’était pas un exercice ?
B.talk : La directrice l’a annoncé ce matin. Tout va bien.
C.talk : Elle a peut-être menti pour ne pas nous faire peur !
B.point : On se range en file et on marche tranquillement.
C.scared!scared mv:C=run>farRight : Désolé, moi je cours !
A.laugh : Il est déjà dehors ! Record du monde !
B.angry!angry : On avait dit qu’on marchait…
A.talk : Remarque, s’il y a un vrai incendie, il sera le premier sauvé.

=== panne-courant | La panne de courant | mystery
titres: Panne de courant à l’école ⚡ / Qui a éteint la lumière ?
# classroom A:left B:center C:right
~1.0 sfx:sting r:A=surprise,B=surprise,C=scared cam:wide punch
C.scared!scared : Toutes les lumières se sont éteintes !
A.talk : Restez calmes. Je vais vous guider dans le noir.
C.talk!scared : Tu as une lampe de poche ?
A.talk : Non. Mais j’ai beaucoup de courage.
B.think : Ce n’est pas une panne. Le soleil brille, on voit très bien.
C.scared!scared : J’ai entendu un bruit bizarre près de l’interrupteur !
A.talk opt : C’est sûrement le monstre des interrupteurs.
B.point r:A=surprise : Ou alors c’est quelqu’un qui a appuyé dessus avec son coude.
A.surprise!surprised punch : Ah… c’était peut-être moi, en m’étirant.
C.angry!angry : {A} ! J’ai failli m’évanouir !
B.laugh : Bon, on rallume, et on reprend la leçon.

=== chorale-fausse-note | La chorale
titres: La chorale de l’école 🎤 / La fausse note de {A}
# classroom A:left B:center C:right
B.celebrate!happy : Répétition de la chorale ! On chante la chanson du printemps.
C.talk!scared : Je chante très bas, pour que personne ne m’entende.
A.celebrate : Moi, je chante très fort, pour que tout le monde m’entende !
B.talk : L’idéal, c’est entre les deux.
C.talk : Et si je fais juste semblant de chanter ?
B.talk : Non, {C}. Tout le monde chante.
A.talk : Prêts ? Un, deux, trois… la la laaaa !
~1.0 sfx:sting r:B=surprise,C=surprise cam:closeup:A punch
C.scared!scared : Les vitres ont tremblé !
B.laugh : Ce n’était pas une note, c’était une sirène.
A.talk!happy : Merci ! Je m’entraîne pour devenir une star.
C.laugh : Une star… de la fausse note !

=== concours-dessin | Le concours de dessin
titres: Le dessin incompris de {A} 🎨 / Qui a fait ce dessin ?
# classroom A:left B:boardLeft C:right
B.celebrate!happy : Concours de dessin ! Le sujet, c’est : mon animal préféré.
C.talk : J’ai dessiné un chat. Enfin, je crois.
B.talk : Moi, un cheval qui galope dans un champ.
C.talk : Il est magnifique ! On dirait un vrai.
B.talk!happy : Merci. J’ai mis trois heures.
A.talk : Moi, trois secondes. C’est ça, le talent.
A.celebrate!happy : Et moi, mon chef-d’œuvre ! Devinez ce que c’est.
C.think : Euh… une pomme de terre avec des pattes ?
B.think : Un nuage qui a mal au ventre ?
A.angry!angry : Mais non ! C’est un lion qui rugit !
C.laugh : Il rugit tellement qu’il a perdu sa crinière.
A.talk!happy : C’est de l’art moderne. Vous ne pouvez pas comprendre.

=== mot-excuse | Le mot d’excuse
titres: Le pire mot d’excuse de l’histoire 📝 / {A} et le mot d’excuse
# classroom A:center B:left C:right
A.talk : Hier, j’étais absent. J’ai écrit mon mot d’excuse moi-même.
B.surprise!surprised : Tu n’as pas le droit ! Ce sont tes parents qui doivent l’écrire.
A.talk : Ils étaient occupés. Alors je les ai aidés.
C.scared!scared : Si le directeur l’apprend, tu vas avoir des ennuis.
A.talk : Pas de panique. J’ai très bien imité l’écriture.
A.talk : Regardez : « Mon fils était fatigué. Signé : maman. »
C.think : Pourquoi c’est écrit au feutre vert pailleté ?
A.talk!happy : Ma mère adore les paillettes.
B.point : Et pourquoi il y a une faute à « maman » ?
A.surprise!surprised punch : Hein ?! Ça s’écrit avec deux N ?
C.laugh r:B=laugh : Il ne sait même pas écrire « maman » !
A.talk!sad : Bon… je vais plutôt dire la vérité.

=== kermesse-gateau | Le gâteau de la kermesse
titres: Le gâteau raté de la kermesse 🎂 / Qui a mangé le gâteau ?
# classroom A:left B:center C:right
B.celebrate!happy : J’ai préparé un gâteau au chocolat pour la kermesse !
C.celebrate!happy : Il a l’air délicieux ! On peut goûter ?
B.angry!angry : Non ! Il est pour la vente de demain.
A.think : On pourrait goûter juste un tout petit bout. Pour vérifier.
B.talk : D’accord, mais une miette, pas plus.
A.talk : Promis. Une miette chacun.
C.talk : Juste une miette… une toute petite.
~1.0 sfx:pop r:B=surprise cam:wide punch
B.surprise!surprised : {A} ! Il ne reste qu’une miette !
A.talk!happy : Oui, on t’a laissé la miette. Comme promis.
C.talk!sad : Pardon… il était trop bon.
B.laugh : Bon… je vais faire un deuxième gâteau. Avec un cadenas.
`;
