// Série 4 : les grands événements de l’école (20 histoires). Format : voir src/story/dsl.js
export default String.raw`
=== sortie-zoo | La sortie au zoo
titres: La sortie au zoo de {A} 🦁 / Préparatifs pour le zoo
# classroom A:left B:boardLeft C:right
B.celebrate!happy : Demain, sortie scolaire au zoo ! On va voir des lions et des girafes.
C.scared!scared : Des lions ? Et s’ils s’échappent de leur enclos ?
A.talk : Pas de panique. Je sais parler aux lions.
B.think : Ah oui ? Et qu’est-ce que tu leur dis ?
A.talk : Bonjour, monsieur le lion. Je suis trop maigre, mangez plutôt le prof.
C.laugh : Ce n’est pas très gentil pour le prof.
B.talk : Il faut préparer un pique-nique et une casquette.
A.talk : J’ai déjà préparé mon sac : trois paquets de chips et une banane.
C.think : Une banane ? Pour quoi faire ?
A.talk : Pour me faire un ami chez les singes.
B.laugh : Il est interdit de nourrir les animaux, {A}.
A.talk!sad : Bon. Alors je la mangerai devant eux, pour les rendre jaloux.
C.laugh : Les singes vont adorer ton spectacle !

=== spectacle-fin-annee | Le spectacle de fin d’année
titres: Le spectacle de fin d’année 🎭 / {C} a le trac
# classroom A:left B:center C:right
B.celebrate!happy : Le spectacle de fin d’année commence dans dix minutes !
C.scared!scared : J’ai le trac. Mes genoux tremblent comme de la gelée.
A.talk : Moi, je n’ai jamais le trac. Je suis né sur une scène.
B.think : Tu joues quel rôle, déjà ?
A.talk : Le rôle principal. Un arbre.
C.surprise!surprised : Un arbre ? Mais un arbre ne parle pas !
A.talk : Justement. C’est un rôle très difficile. Il faut être immobile.
B.talk : Et toi, {C}, tu joues le roi. Tu as trois phrases.
C.scared!scared : Trois phrases devant tout le monde…
A.talk : Imagine que le public porte des pyjamas à petits cœurs.
C.laugh : Ah oui ! Ça me fait rire, ça m’enlève le trac !
B.laugh : Parfait ! Tout le monde en place !
A.talk : Et moi, je vais faire l’arbre le plus beau du monde.

=== deguisement | La journée déguisée
titres: La journée déguisée 🦸 / Le pire déguisement de l’école
# hallway A:farLeft B:left C:right
B.celebrate!happy : C’est la journée déguisée ! Je suis une astronaute.
C.talk : Moi, je suis un chevalier. Mais mon épée est en carton.
A.talk mv:A=walk>center : Et moi… devinez qui je suis !
B.think : Tu portes tes vêtements de tous les jours.
A.talk : Exactement. Je suis déguisé en {A}.
C.laugh : C’est le déguisement le plus facile du monde !
A.talk : Pas du tout. J’ai mis trois heures à me coiffer pareil.
B.laugh : Tu as gagné le prix de l’originalité.
A.celebrate!happy : Je savais que j’étais génial.
C.think : Demain, je viens déguisé en toi, alors.
A.surprise!surprised : Impossible ! Personne ne peut être aussi génial que moi.
B.laugh : Ni aussi modeste !

=== anniversaire-surprise | L’anniversaire surprise
titres: La fête surprise de {B} 🎉 / Chut, elle arrive !
# classroom A:left B:farRight C:right
A.talk : Vite, tout le monde se cache ! {B} va arriver !
C.scared!scared : Je n’aime pas les surprises. J’ai peur de crier trop fort.
A.talk : C’est elle qui doit crier, pas toi.
C.talk : D’accord. Je me cache derrière le bureau.
B.talk mv:B=walk>center : Bonjour ? Pourquoi la classe est toute sombre ?
A.celebrate punch r:C=jump : Surprise ! Joyeux anniversaire !
B.surprise!surprised : Oh ! C’est trop gentil !
C.talk : On t’a préparé un gâteau au chocolat.
B.think : Mais… mon anniversaire, c’était la semaine dernière.
A.surprise!surprised : La semaine dernière ? Qui a noté la date ?
C.talk!sad : C’est moi. J’ai lu le calendrier à l’envers.
B.laugh : Ce n’est pas grave. Une fête en retard, c’est une fête quand même !

=== journee-pyjama | La journée pyjama
titres: La journée pyjama à l’école 🛌 / Venir en pyjama… vraiment ?
# hallway A:farLeft B:left C:right
C.talk!sad : Pourquoi je suis le seul en pyjama ?
B.think : Parce que la journée pyjama, c’est demain, {C}.
C.surprise!surprised : Quoi ?! Mais c’est {A} qui me l’a dit !
A.talk mv:A=walk>center : Salut ! Oh, tu es déjà en pyjama ?
C.angry!angry : Tu m’as dit que c’était aujourd’hui !
A.talk : J’ai dit : demain, c’est aujourd’hui… de demain.
B.laugh : Personne ne comprend ce que tu dis, {A}.
C.talk!sad : Tout le monde me regarde. J’ai des petits nuages sur le pantalon.
A.talk : Tu lances la mode avec un jour d’avance. C’est la classe.
B.think : Et ton pyjama est très joli, en plus.
C.talk!happy : Bon… au moins, je serai prêt pour la sieste.
A.laugh : Demain, tu viendras en costume !

=== classe-verte | La classe verte
titres: La classe verte à la montagne ⛰️ / La valise de {A}
# classroom A:left B:center C:right
B.celebrate!happy : Lundi, on part en classe verte à la montagne pour une semaine !
C.scared!scared : Une semaine sans mes parents ? Et s’il y a des loups ?
A.talk : Les loups, ce n’est rien. Le vrai danger, c’est la nourriture de la cantine.
B.talk : Il faut faire la liste des affaires à emporter.
A.talk : Ma valise est déjà prête. J’ai pris l’essentiel.
B.think : Montre-moi.
A.talk : Ma console, mes bandes dessinées, un oreiller et des bonbons.
C.surprise!surprised : Et tes vêtements ?
A.surprise!surprised : Les vêtements ? On en a besoin là-bas ?
B.laugh : Oui, {A}. Surtout à la montagne.
A.talk : Bon. Je mets un pull. Sur les bonbons.
C.laugh : Ses bonbons auront chaud, au moins !

=== journee-sport | La journée du sport
titres: La grande journée du sport 🏅 / {A} et le relais
# yard A:left B:center C:right
B.celebrate!happy : C’est la journée du sport ! Notre équipe fait la course de relais.
A.talk : Donnez-moi le témoin. Je suis le plus rapide.
C.scared!scared : Moi, je cours très lentement. Je vais faire perdre l’équipe.
B.talk : Ce n’est pas grave. L’important, c’est de participer.
A.talk : Non. L’important, c’est de gagner. Et de recevoir une médaille.
B.point : Prêts ? Partez !
A.talk mv:A=run>farRight : Je file comme le vent !
C.think : Il est parti dans le mauvais sens…
B.surprise!surprised : {A} ! L’arrivée est de l’autre côté !
A.talk mv:A=run>right : Je le savais ! C’était un échauffement !
C.laugh : Il a fait deux fois la course.
B.laugh : On ne gagne pas, mais il gagne le prix du plus long parcours !

=== echange-cadeaux | L’échange de cadeaux
titres: L’échange de cadeaux surprise 🎁 / Le cadeau mystère de {A}
# classroom A:left B:center C:right
B.celebrate!happy : C’est l’échange de cadeaux ! Chacun en a préparé un.
C.talk : J’ai fabriqué un porte-clés en perles. Ça m’a pris tout le week-end.
B.talk : Moi, j’ai acheté un livre d’énigmes.
A.talk : Et moi, un cadeau très spécial. Il est dans cette boîte.
C.think : La boîte bouge toute seule… C’est normal ?
A.talk : Oui. Le cadeau est vivant.
C.scared!scared : Vivant ? C’est une araignée ?
~1.0 sfx:pop r:B=surprise,C=jump cam:wide punch
B.surprise!surprised : C’est un ressort avec un clown dessus !
A.laugh : Une boîte à surprise ! Le cadeau, c’est la peur !
C.talk!sad : Merci… mon cœur va bien, merci de demander.
B.laugh : Le cadeau le plus original de l’année !

=== halloween-citrouille | La citrouille d’Halloween | mystery
titres: La citrouille hantée d’Halloween 🎃 / Elle a cligné de l’œil !
# classroom A:left B:boardLeft C:right
B.celebrate!happy : Joyeux Halloween ! J’ai sculpté une citrouille pour la classe.
C.scared!scared : Elle me regarde avec ses yeux triangulaires.
A.talk : C’est une citrouille. Elle ne regarde personne.
~1.0 sfx:buzz r:C=jump cam:closeup:C punch
C.scared!scared : Elle a cligné de l’œil ! Je l’ai vu !
B.think : Impossible. C’est juste une bougie à l’intérieur.
A.talk opt : La flamme a peut-être bougé avec le vent.
~1.0 sfx:buzz r:A=surprise,B=surprise cam:wide punch
A.surprise!surprised : D’accord… là, elle a vraiment bougé.
B.point : Il y a quelque chose dedans. Attention…
C.surprise!surprised : C’est… le hamster de la classe !
B.laugh : Il s’est fait une maison toute chaude.
A.laugh : Le plus petit fantôme d’Halloween !
C.talk!happy : Bon… finalement, j’aime bien cette citrouille.

=== premier-jour | Le premier jour d’école
titres: Le premier jour de {C} 🏫 / La rentrée la plus stressante
# hallway A:left B:center C:farRight
C.scared!scared mv:C=walk>right : C’est la rentrée. J’ai mal au ventre de stress.
B.talk : Ne t’inquiète pas. Le premier jour, tout le monde est un peu perdu.
A.talk : Pas moi. Je connais l’école par cœur.
C.think : Alors, où est notre nouvelle classe ?
A.point : Facile. Au fond du couloir, à gauche.
B.think : Ça, ce sont les toilettes, {A}.
A.talk opt : C’était un test. Vous l’avez réussi.
C.laugh : Tu ne sais pas où est la classe, en fait.
A.talk!sad : Ils ont changé l’école pendant les vacances. C’est un complot.
B.point : C’est marqué sur le plan. Salle douze, premier étage.
C.talk!happy : Merci, {B}. J’ai déjà moins mal au ventre.
A.talk : Moi, je vous suis. Juste pour vérifier que vous ne vous perdez pas.

=== dernier-jour | Le dernier jour d’école
titres: Le dernier jour avant les vacances ☀️ / Au revoir l’école !
# yard A:left B:center C:right
A.celebrate!happy : Dernier jour d’école ! Dans trois heures, ce sont les vacances !
C.talk!sad : Moi, l’école va me manquer. Et vous aussi.
B.talk : On se reverra à la rentrée, {C}. Et on pourra s’écrire.
A.talk : Moi, j’ai déjà un programme : dormir jusqu’à midi pendant deux mois.
B.laugh : Tu vas t’ennuyer au bout de deux jours.
A.talk : Impossible. Dormir, c’est mon talent principal.
C.think : On pourrait se faire une promesse pour l’été.
B.talk!happy : Bonne idée. On lit chacun un livre et on se le raconte.
A.surprise!surprised : Un livre ? Pendant les vacances ?
C.laugh : Un livre de blagues, ça compte ?
A.celebrate!happy : Alors là, j’en lis dix !
B.laugh : Ce seront les meilleures vacances !

=== bulletin-notes | Le bulletin de notes
titres: Le bulletin de notes de {A} 📄 / Comment annoncer ses notes ?
# hallway A:left B:center C:right
A.talk!sad : Le bulletin de notes est arrivé. Je n’ose pas l’ouvrir.
C.talk : Moi non plus. Mes mains tremblent.
B.talk : Ouvrons-les ensemble. À trois. Un, deux, trois !
C.surprise!happy : J’ai eu « très bien » en sciences !
B.celebrate!happy : Moi, « excellent » partout.
A.think : Moi, j’ai eu un commentaire : « Élève très créatif. »
C.talk : C’est bien, ça !
A.talk : Oui… mais c’était pour expliquer pourquoi je n’ai pas fait mes devoirs.
B.laugh : Créatif pour les excuses, alors.
A.talk : Mes parents vont être fiers. Enfin, je pense.
C.laugh : Montre-leur le mot « très ». C’est déjà positif.
A.celebrate!happy : Très bonne idée, je vais cacher le reste !

=== jour-de-neige | Le jour de neige
titres: La grande bataille de boules de neige ⛄ / Le bonhomme de neige de {C}
# yard A:left B:center C:right
A.celebrate!happy : Il a neigé toute la nuit ! Bataille de boules de neige !
B.talk : Non. D’abord, on construit un bonhomme de neige.
C.talk : Moi, je fais la tête. Ronde et parfaite.
A.talk : D’accord. Moi, je fais… euh… je surveille les ennemis.
B.think : Quels ennemis ? Il n’y a personne dans la cour.
A.talk : Justement. Ils sont très bien cachés.
C.celebrate!happy : Ça y est ! Le bonhomme a une carotte et une écharpe.
B.laugh : Il est magnifique, {C} !
A.talk : Il lui manque une casquette rouge. Je lui prête la mienne.
~1.0 sfx:whoosh r:A=surprise,B=surprise cam:wide punch
C.surprise!surprised : Une boule de neige vient de nous frôler ! Qui a lancé ça ?
B.point : C’est le bonhomme ! Ah non… c’est {A} qui était derrière.
A.laugh : La bataille commence !

=== magicien | Le spectacle de magie
titres: Le tour de magie raté de {A} 🎩 / {A} le magicien
# classroom A:center B:left C:right
A.celebrate!happy : Mesdames et messieurs ! Le grand magicien {A} va faire disparaître une pièce !
C.surprise!happy : Une vraie pièce ? Pour de vrai ?
A.talk : Regardez bien. Je la mets dans ma main… Abracadabra !
B.think : Elle est tombée par terre. Je l’ai entendue rouler.
A.talk : C’est fait exprès. Elle a disparu… par terre.
C.laugh : Ce n’est pas un tour de magie, ça.
A.talk : Deuxième tour : je vais deviner une carte. Choisis-en une, {B}.
B.talk : D’accord. J’ai choisi.
A.think : C’est… le roi de cœur !
B.surprise!surprised punch : Oui ! Comment tu as fait ?
A.celebrate!happy : Le jeu ne contient que des rois de cœur !
C.laugh : Le premier magicien qui avoue ses trucs !

=== incroyable-talent | Le concours de talents
titres: Le concours de talents de l’école ⭐ / Le talent caché de {C}
# classroom A:left B:center C:right
B.celebrate!happy : Concours de talents ! Chacun montre ce qu’il sait faire de mieux.
A.talk : Mon talent : je peux toucher mon nez avec ma langue.
B.think : Non. Tu touches juste ton menton.
A.talk : C’est presque pareil. Ils sont voisins.
B.talk : Moi, je récite toutes les capitales du monde.
C.talk!sad : Moi, je n’ai pas de talent. Je ne vais rien montrer.
A.talk : Tout le monde a un talent. Même toi, {C}.
C.think : Bon… je sais siffler comme un oiseau.
~1.0 sfx:ding r:A=surprise,B=surprise cam:closeup:C punch
B.surprise!surprised : Incroyable ! On dirait un vrai rossignol !
A.surprise!surprised : Les pigeons de la cour sont venus t’écouter !
C.laugh : Je ne savais pas que c’était un talent.
B.laugh : Le grand gagnant, c’est {C} !

=== reunion-parents | La réunion des parents
titres: La réunion parents-professeurs 😬 / Ce que le prof va dire…
# hallway A:left B:center C:right
A.scared!scared : Ce soir, c’est la réunion des parents. Je suis fichu.
C.think : Pourquoi ? Tu as fait des bêtises ?
A.talk : Moi ? Non. Enfin… à peine. Un tout petit peu.
B.talk : Raconte. Qu’est-ce que tu as fait ?
A.talk : J’ai mis du sel dans le café du professeur. Mais c’était un accident.
C.surprise!surprised : Comment on met du sel par accident ?
A.talk : Je voulais mettre du sucre. Pour être gentil.
B.laugh : C’est vrai que le sel et le sucre se ressemblent.
A.talk : Voilà ! Vous voyez ? Je suis innocent.
C.talk : Et le dessin de lui en pirate, sur le tableau ?
A.talk!sad : Ça, c’était exprès. Mais il était très ressemblant.
B.laugh : Bonne chance pour ce soir, {A} !

=== loto-ecole | Le loto de l’école
titres: Le loto de l’école 🎱 / Qui va gagner le gros lot ?
# classroom A:left B:center C:right
B.celebrate!happy : C’est le loto de l’école ! Le gros lot, c’est un vélo tout neuf !
A.talk : Je vais gagner. J’ai acheté douze cartons.
C.talk : Moi, j’ai un seul carton. Mais il porte bonheur.
B.talk : Attention, les numéros commencent. Le sept… le quinze…
A.talk : J’ai le sept sur quatre cartons ! Je suis débordé !
C.think : J’ai le quinze. Et le vingt-deux aussi.
B.talk : Le quarante-huit… et le neuf !
~1.0 sfx:ding r:A=surprise,B=surprise cam:closeup:C punch
C.surprise!surprised : Carton plein ! J’ai gagné !
A.surprise!surprised : Avec un seul carton ? Ce n’est pas juste !
B.laugh : Douze cartons, et zéro victoire.
A.talk!sad : Je vais au moins gagner le prix du plus grand nombre de cartons.
C.laugh : Je te prêterai le vélo, promis !

=== carnaval | Le carnaval
titres: Le défilé du carnaval 🎊 / Le char en carton de {A}
# yard A:left B:center C:right
B.celebrate!happy : Le défilé du carnaval commence ! Notre char est prêt.
C.talk : On a mis trois semaines à le construire. Il est magnifique.
A.talk : C’est grâce à moi. J’ai collé le plus important.
B.think : C’est-à-dire ?
A.talk : L’autocollant « attention, peinture fraîche ».
C.laugh : Ce n’est pas vraiment une décoration.
B.talk : Allez, en avant la musique ! On avance doucement.
~1.0 sfx:pop r:A=surprise,B=surprise,C=surprise cam:wide punch
C.surprise!surprised : La roue du char vient de tomber !
A.talk : Pas de panique ! Je le porte sur mon dos.
B.laugh : Tu ne peux pas porter un char tout seul, {A}.
A.talk!sad : Bon. On fait un défilé à pied, alors.
C.laugh : Le premier défilé de carnaval… sans char !

=== visite-musee | La visite au musée
titres: La visite du musée 🏛️ / Ne touchez à rien !
# hallway A:left B:center C:right
B.talk : Au musée, on ne touche à rien. Les œuvres sont très fragiles.
A.talk : Je ne toucherai qu’avec les yeux. Promis.
C.think : Regardez ce squelette de dinosaure. Il est immense.
A.talk : Il a l’air triste. Il lui manque un os.
B.surprise!surprised : Il lui manque un os ? Où ça ?
A.point : Là, au bout de la queue. Il est tout seul dans un coin.
C.scared!scared : Si on dit qu’on l’a vu, on va nous accuser !
B.think : Attendez… c’est marqué : « os retrouvé par un enfant en mille neuf cent douze ».
A.surprise!happy : Donc les enfants peuvent trouver des os de dinosaure ?
B.talk : Oui. Avec des archéologues, et beaucoup de patience.
A.celebrate!happy : Ça y est, je sais ce que je ferai plus tard !
C.laugh : Chercheur d’os ? Commence par chercher ta deuxième chaussette !
`;
