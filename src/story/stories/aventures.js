// Série 5 : les aventures folles (22 histoires). Format : voir src/story/dsl.js
export default String.raw`
=== super-pouvoir | Le super-pouvoir
titres: Si on avait un super-pouvoir… 🦸 / Le super-pouvoir le plus nul
# yard A:left B:center C:right
A.talk : Si vous pouviez avoir un super-pouvoir, ce serait quoi ?
B.think : Moi, lire tous les livres du monde en une seconde.
C.talk : Moi, devenir invisible. Comme ça, personne ne me ferait peur.
A.celebrate!happy : Moi, je voudrais le pouvoir de transformer les légumes en frites.
B.laugh : Ce n’est pas un super-pouvoir, ça, {A}.
A.talk : Bien sûr que si ! Imagine la cantine avec ce pouvoir.
C.think : Et si quelqu’un te demande de sauver le monde ?
A.talk : Je lui donne des frites. Tout le monde est content. Monde sauvé.
B.laugh : C’est une stratégie… originale.
C.talk!happy : Finalement, je change mon pouvoir. Je veux le même que toi.
A.celebrate!happy : Bienvenue dans la ligue des super-frites !
B.laugh : La ligue la plus gourmande de l’univers !

=== machine-temps | La machine à remonter le temps
titres: La machine à remonter le temps ⏰ / {A} a inventé une machine
# classroom A:center B:left C:right
A.celebrate!happy : J’ai construit une machine à remonter le temps ! En carton !
B.think : En carton ? Et elle fonctionne comment ?
A.talk : On entre dedans, on ferme les yeux, et on compte jusqu’à trois.
C.scared!scared : Et si on reste coincés chez les dinosaures ?
A.talk : Pas de risque. Je l’ai réglée sur hier.
B.surprise!surprised : Pourquoi hier ?
A.talk : Parce que j’ai oublié de faire mes devoirs hier.
C.laugh : Tu veux remonter le temps pour faire tes devoirs ?
A.talk : Non. Pour copier sur moi-même du futur.
B.laugh : Mais toi du futur ne les a pas faits non plus.
A.surprise!surprised punch : Oh non. C’est un paradoxe temporel !
C.laugh : C’est surtout un paradoxe de paresse !

=== extraterrestre-cour | L’extraterrestre de la cour | mystery
titres: Un extraterrestre dans la cour 👽 / La lumière verte mystérieuse
# yard A:farLeft B:center C:right
~1.0 sfx:buzz r:C=jump cam:closeup:C punch
C.scared!scared : Vous avez vu ? Une lumière verte derrière le grand arbre !
B.think : Ce n’est sûrement rien. Un reflet du soleil.
C.scared!scared : Le soleil n’est pas vert ! C’est un extraterrestre !
~1.0 sfx:buzz r:B=surprise,C=scared cam:wide punch
B.surprise!surprised : Ça clignote… et ça fait un bruit bizarre.
C.scared!scared : Il veut nous emmener sur sa planète !
A.talk mv:A=walk>left : Bonjour, terriens. J’ai une lampe torche verte.
B.angry!angry : {A} ! Encore toi !
A.laugh : J’ai trouvé la lampe dans les objets trouvés. Elle est géniale, non ?
C.talk!sad : J’avais déjà préparé mon discours pour les martiens…
B.laugh : Tu peux le garder pour la prochaine fois.
A.celebrate!happy : Je vous emmène sur ma planète : la cantine !

=== inventions-folles | Le concours d’inventions
titres: Les inventions les plus folles 💡 / Le concours des petits inventeurs
# classroom A:left B:center C:right
B.celebrate!happy : Concours d’inventions ! Moi, j’ai inventé un cartable qui se range tout seul.
C.talk : Moi, des lunettes avec des essuie-glaces. Pour les jours de pluie.
B.laugh : C’est très pratique, en fait.
A.celebrate!happy : Et moi, j’ai inventé le réveil qui ne sonne jamais.
B.think : À quoi ça sert, un réveil qui ne sonne jamais ?
A.talk : À dormir tranquille ! C’est révolutionnaire.
C.laugh : Ce n’est pas un réveil, ça. C’est juste une boîte.
A.talk : Une boîte qui respecte le sommeil des gens.
B.talk : Et comment tu te réveilles pour venir à l’école ?
A.surprise!surprised : Ah. Je n’avais pas pensé à ce détail.
C.laugh : Il a inventé le meilleur moyen d’arriver en retard !
B.laugh : Le prix de l’invention la plus inutile est pour toi, {A} !

=== robot-devoirs | Le robot à devoirs
titres: Le robot qui fait les devoirs 🤖 / Il a fait mes devoirs… à sa façon
# classroom A:center B:left C:right
A.celebrate!happy : J’ai programmé mon robot pour faire mes devoirs de maths !
B.surprise!surprised : C’est de la triche, {A} !
A.talk : Non. C’est de la technologie moderne.
C.think : Et il a trouvé les bonnes réponses ?
A.talk : Je n’ai pas vérifié. Je lui fais confiance.
B.point : Montre. Première question : combien font deux plus deux ?
A.talk : Le robot a répondu : « une banane ».
C.laugh : Une banane ? C’est faux !
A.talk!sad : Il a peut-être faim. Les robots ont faim, parfois.
B.laugh : Ou alors, il est aussi nul en maths que toi.
A.angry!angry : Il ne faut pas insulter mon robot ! Il est sensible !
C.laugh : Il faudra lui donner des cours de soutien.

=== fossile-cour | Le fossile de la cour
titres: Un fossile de dinosaure dans la cour 🦖 / La découverte de {C}
# yard A:left B:center C:tree
C.surprise!surprised : J’ai trouvé un os énorme sous le grand arbre !
A.celebrate!happy : Un os de dinosaure ! On va être célèbres !
B.think : Attends. Il faut l’examiner avant de crier victoire.
A.talk : C’est un tyrannosaure. Je reconnais la forme.
C.talk : Il est très léger, pour un os de dinosaure.
B.point : Et il y a une étiquette dessus : « jouet pour chien ».
A.surprise!surprised : Un jouet pour chien ? Mais où est le chien ?
~1.0 sfx:boing r:A=surprise,B=surprise,C=jump cam:wide punch
C.scared!scared : Il y a un chien qui court vers nous !
B.laugh : C’est le chien du concierge. Il vient chercher son jouet.
A.talk!sad : Adieu, mon tyrannosaure…
C.laugh : Il a l’air très content de le récupérer, lui.

=== detective-gouter | Le détective du goûter
titres: Qui a mangé le goûter de {B} ? 🍫 / L’enquête du goûter disparu
# classroom A:left B:center C:right
B.angry!angry : Mon goûter a disparu de mon sac ! Une barre de chocolat !
C.scared!scared : Ce n’est pas moi ! Je le jure sur ma collection de billes !
A.think : Pas de panique. Le grand détective {A} va résoudre l’affaire.
B.talk : D’accord, détective. Tu soupçonnes qui ?
A.talk : Tout le monde. Sauf moi, bien sûr. Je suis le détective.
C.point : {A}, tu as du chocolat autour de la bouche.
A.surprise!surprised : C’est… du maquillage de détective.
B.think : Et un emballage de barre de chocolat dans ta poche.
A.talk!sad : Bon. Le coupable, c’est moi. Affaire résolue.
C.laugh : Le détective a enquêté sur lui-même !
B.laugh : Demain, tu m’apportes deux barres. Pour les frais d’enquête.
A.talk : C’est cher, de résoudre une affaire.

=== potion-magique | La potion magique
titres: La potion magique de {A} 🧪 / Ne bois pas ça !
# classroom A:center B:left C:right
A.celebrate!happy : J’ai préparé une potion magique qui rend très intelligent !
B.think : Qu’est-ce que tu as mis dedans ?
A.talk : Du jus d’orange, du sirop de menthe et une pincée de poivre.
C.scared!scared : Du poivre ? Ça va brûler la gorge !
A.talk : C’est le poivre qui rend intelligent. Tout le monde sait ça.
B.laugh : Personne ne sait ça, {A}. Parce que c’est faux.
A.talk : Je vais vous le prouver. Je bois tout.
~1.0 sfx:sting r:A=jump,B=surprise,C=surprise cam:closeup:A punch
A.scared!scared : C’est piquant ! C’est très piquant !
C.talk : Alors ? Tu te sens plus intelligent ?
A.talk!sad : Je me sens surtout plus assoiffé.
B.laugh : La potion rend intelligent : maintenant, il sait qu’il ne faut pas en boire.

=== plan-anti-lundi | Le plan anti-lundi
titres: Le plan pour supprimer le lundi 📅 / {A} contre le lundi
# hallway A:left B:center C:right
A.angry!angry : Je déteste le lundi. J’ai un plan pour le supprimer.
B.think : Supprimer un jour de la semaine ? Comment ?
A.talk : On écrit une lettre au ministre. On propose une semaine sans lundi.
C.talk : Mais alors, après le dimanche, il y aurait quoi ?
A.talk : Le dimanche bis. Un deuxième dimanche.
B.laugh : Et l’école, elle recommence quand ?
A.talk : Le mardi. Mais seulement l’après-midi.
C.laugh : Ça ne marchera jamais, ton plan.
A.talk : Tous les grands inventeurs ont entendu ça.
B.point : En attendant, aujourd’hui, on est lundi. Et il y a une dictée.
A.talk!sad : Le lundi a encore gagné.
C.laugh : Le lundi est invincible !

=== chef-cuisine | Le chef cuisinier
titres: {A} cuisine pour la classe 👨‍🍳 / La recette secrète de {A}
# classroom A:center B:left C:right
A.celebrate!happy : Aujourd’hui, je suis chef cuisinier ! J’ai préparé ma spécialité.
C.surprise!happy : Qu’est-ce que c’est ? Ça sent… bizarre.
A.talk : Des crêpes au fromage, à la confiture et aux cornichons.
B.surprise!surprised : Des cornichons ? Avec de la confiture ?
A.talk : C’est la cuisine moderne. Sucré, salé, et croquant.
C.think : Bon… je goûte une toute petite bouchée.
~1.0 sfx:sting r:C=surprise,B=surprise cam:closeup:C punch
C.surprise!surprised : C’est… en fait, c’est plutôt bon !
B.surprise!surprised : Sérieusement ?
C.laugh : Oui ! Le cornichon donne un petit goût génial.
A.celebrate!happy : Je vous l’avais dit ! Je suis un génie de la cuisine !
B.think : Bon… je goûte aussi. Mais sans les cornichons.

=== championnat-grimaces | Le championnat de grimaces
titres: Le championnat de grimaces 😜 / La grimace qui fait peur
# yard A:left B:center C:right
A.celebrate!happy : Grand championnat de grimaces ! Le gagnant devient roi de la cour.
B.talk : D’accord. Moi, je louche en tirant la langue.
C.laugh : C’est très réussi ! Tu ressembles à une grenouille.
A.talk : À moi. Je gonfle les joues et je fais les yeux ronds.
B.laugh : On dirait un poisson qui a vu un fantôme !
C.talk!sad : Moi, je ne sais pas faire de grimace.
A.talk : Essaie quand même. Pense à quelque chose de très dégoûtant.
C.think : Euh… des épinards au chocolat ?
~1.0 sfx:sting r:A=jump,B=surprise cam:closeup:C punch
B.surprise!surprised : Ah ! Ta grimace fait vraiment peur !
A.laugh : Le roi de la cour, c’est {C} !
C.laugh : C’est la pensée des épinards. Ça marche à chaque fois.

=== blague-du-jour | La blague du jour
titres: La pire blague du monde 😂 / {A} raconte une blague
# classroom A:center B:left C:right
A.celebrate!happy : J’ai la meilleure blague du monde. Vous êtes prêts ?
B.think : Vas-y, on t’écoute.
A.talk : Que dit une imprimante dans l’eau ? J’ai papier.
C.think : Je ne comprends pas.
A.talk : « J’ai pas pied ». Papier. Comme le papier de l’imprimante.
B.laugh : Ah… d’accord. C’est un jeu de mots.
A.talk : Deuxième blague. Pourquoi les poissons détestent l’ordinateur ?
C.talk : Je ne sais pas. Pourquoi ?
A.talk : À cause du réseau. Ils ont peur des filets.
B.laugh : Celle-là est pire que la première !
C.laugh : Elle est tellement nulle qu’elle est drôle !
A.celebrate!happy : C’est ça, mon talent : les blagues nulles qui font rire !

=== record-du-monde | Le record du monde
titres: {A} veut battre un record du monde 🌍 / Le record le plus étrange
# yard A:center B:left C:right
A.talk : Aujourd’hui, je vais battre un record du monde.
B.think : Lequel ? Le saut en hauteur ? Le sprint ?
A.talk : Le plus grand nombre de bonbons dans la bouche en même temps.
C.scared!scared : C’est dangereux, ça ! Tu pourrais t’étouffer !
B.angry!angry : {C} a raison. Choisis un autre record.
A.think : D’accord. Le plus long temps sans cligner des yeux.
C.talk : Bon. Celui-là, c’est moins dangereux.
B.point : C’est parti. Je compte. Un… deux… trois…
A.talk : Ça va… ça va… mes yeux piquent un peu.
~1.0 sfx:pop r:A=surprise cam:closeup:A punch
C.laugh : Il a cligné à quatre secondes !
A.talk!sad : Bon. Je vais choisir le record de la plus longue sieste.
B.laugh : Celui-là, tu vas le gagner facilement !

=== journal-ecole | Le journal de l’école
titres: Le journal de l’école 📰 / Le scoop de {A}
# classroom A:left B:center C:right
B.talk : Je suis la rédactrice en chef du journal de l’école. Qui a un article ?
C.talk : Moi, un article sur les escargots du jardin. Il y a des photos.
B.talk!happy : Très bien ! Et toi, {A} ?
A.celebrate!happy : J’ai un scoop énorme : le directeur porte des chaussettes avec des canards !
B.surprise!surprised : Tu ne peux pas écrire ça ! C’est sa vie privée !
A.talk : C’est de l’information. Les gens ont le droit de savoir.
C.think : Comment tu le sais, d’abord ?
A.talk : Il a croisé les jambes pendant la réunion. J’ai tout vu.
B.laugh : On va plutôt publier l’article sur les escargots.
A.talk!sad : Les escargots, ce n’est pas un scoop.
C.laugh : Si : ils avancent très lentement, mais sûrement !
B.laugh : Voilà le titre de la une !

=== meteo | Le bulletin météo
titres: Le présentateur météo de la classe 🌦️ / La météo selon {A}
# classroom A:center B:left C:right
A.celebrate!happy : Bonjour à tous ! Voici la météo de la semaine, présentée par {A} !
B.laugh : Vas-y, monsieur le présentateur.
A.talk : Lundi : il pleuvra des devoirs. Gros risque de dictée.
C.laugh : Ça, c’est une très mauvaise météo.
A.talk : Mardi : grand soleil sur la cour de récréation.
B.talk : Et mercredi ?
A.talk : Mercredi : averses de bonbons dans toute la région.
C.surprise!happy : Des averses de bonbons ? C’est vrai ?
A.talk : Non. Mais c’est mon souhait le plus cher.
B.laugh : Ce n’est pas de la météo, c’est une liste de souhaits.
A.talk : Jeudi et vendredi : vacances. Enfin, j’espère.
C.laugh : Le présentateur le moins fiable du monde !

=== hymne-ecole | L’hymne de l’école
titres: On a écrit l’hymne de l’école 🎵 / La chanson de {A}
# classroom A:center B:left C:right
B.talk : L’école cherche un hymne. On pourrait écrire une chanson.
A.celebrate!happy : J’ai déjà les paroles ! Écoutez bien.
A.talk : Notre école est la plus belle, on y mange des pâtes avec de la cannelle.
C.think : De la cannelle sur des pâtes ? Ce n’est pas très bon.
A.talk : C’était pour la rime. La poésie a ses exigences.
B.talk : Je propose : « Notre école est un grand jardin, on y apprend chaque matin. »
C.laugh : C’est mieux. C’est beaucoup plus joli.
A.talk : Mais moins drôle. Je propose un mélange.
B.think : Un mélange ? Comment ça ?
A.talk : « Notre école est un grand jardin, on y mange des pâtes chaque matin. »
C.laugh : Ça marche, en fait !
B.laugh : Adopté ! L’hymne officiel de la cantine !

=== ninja-silencieux | Le ninja silencieux
titres: {A} le ninja silencieux 🥷 / Le ninja le plus bruyant
# hallway A:farLeft B:left C:right
A.talk : Je m’entraîne pour devenir un ninja. Le plus silencieux de l’univers.
B.think : Un ninja ? Toi qui fais du bruit même en dormant ?
A.talk : Regardez. Personne ne m’entendra traverser le couloir.
A.talk mv:A=walk>center : Pas de ninja… tout doux… très léger.
~1.0 sfx:pop r:B=surprise,C=surprise cam:wide punch
C.surprise!surprised : Tu as fait tomber tous les cartables !
A.talk!sad : Ce n’était pas moi. C’était… un autre ninja.
B.laugh : Un autre ninja avec une casquette rouge ?
A.talk : Oui. Mon ennemi juré.
C.laugh : Il te ressemble beaucoup, ton ennemi.
A.talk : C’est ça, le problème avec les ninjas : ils sont très bien déguisés.
B.laugh : Le ninja le plus bruyant de l’école !

=== espion-cantine | L’espion de la cantine
titres: Mission secrète : le menu de la cantine 🕶️ / L’espion de la cantine
# hallway A:left B:center C:right
A.talk : Mission secrète : découvrir le dessert de la cantine avant tout le monde.
C.scared!scared : C’est dangereux ? On a le droit ?
A.talk : Personne ne doit le savoir. Je mets mes lunettes d’espion.
B.think : Ce sont des lunettes de soleil, {A}. Dans un couloir.
A.talk : Elles sont très discrètes. Je me faufile jusqu’à la porte.
C.talk : Alors ? Tu vois quelque chose ?
A.surprise!happy : Je vois des gâteaux au chocolat ! Des dizaines !
C.celebrate!happy : Des gâteaux au chocolat ? Génial !
B.point : Euh… c’est écrit sur le menu, juste à côté de la porte.
A.talk!sad : Ah. Donc la mission était un peu inutile.
C.laugh : Mais très bien réalisée !
B.laugh : Agent {A}, mission accomplie… avec trois heures de retard.

=== lettre-futur | La lettre au futur
titres: Une lettre à nous dans dix ans ✉️ / Ce qu’on sera plus tard
# classroom A:left B:center C:right
B.talk : On doit écrire une lettre à nous-mêmes, dans dix ans.
C.think : Moi, j’écris : « J’espère que tu n’as plus peur du noir. »
B.talk!happy : C’est très joli, {C}.
B.talk : Moi : « J’espère que tu es devenue scientifique. »
A.celebrate!happy : Moi, j’écris : « Cher moi du futur, tu es sûrement riche et célèbre. »
C.laugh : Tu es sûr de toi.
A.talk : « Et si ce n’est pas le cas, rends-moi mes bonbons. »
B.think : Quels bonbons ?
A.talk : Ceux que je vais cacher dans l’enveloppe. Pour mon moi du futur.
C.laugh : Ils seront très durs, dans dix ans.
A.talk : Les bonbons, ça ne vieillit pas. Comme moi.
B.laugh : On verra ça dans dix ans !

=== heros-du-jour | Le héros du jour
titres: {C}, héros malgré lui 🏅 / Le jour où {C} a sauvé la récré
# yard A:left B:center C:right
A.talk!sad : Oh non ! Le ballon de la classe roule vers la grille !
B.surprise!surprised : S’il passe sous la grille, on ne le reverra jamais !
C.scared!scared : Je n’aime pas courir. Je vais trébucher.
A.talk : Il n’y a que toi qui es assez près, {C} !
C.talk mv:C=run>farRight : D’accord… j’y vais… doucement !
B.think : Il court… il court vraiment vite, en fait !
~1.0 sfx:ding r:A=surprise,B=surprise cam:wide punch
A.celebrate!happy : Il l’a rattrapé avec le pied ! Juste avant la grille !
B.celebrate!happy : {C} est le héros de la récré !
C.talk!happy : J’ai juste trébuché sur le ballon, en fait.
A.laugh : Un trébuchement héroïque !
B.laugh : Tu as sauvé la récré, même par accident !

=== rentree-chien | Le chien à l’école
titres: Un chien à l’école ! 🐶 / Le nouveau chien de la classe
# classroom A:left B:center C:right
C.surprise!surprised r:A=surprise,B=surprise : Il y a un chien dans la classe ! Un tout petit chien !
A.celebrate!happy : Il est trop mignon ! On peut le garder ?
B.think : Il doit appartenir à quelqu’un. Il a un collier.
C.talk : C’est écrit : « Je m’appelle Biscuit. »
A.talk : Biscuit ! C’est le plus beau nom du monde.
B.talk : Il faut le rendre à son propriétaire.
A.talk : Ou alors, on l’inscrit à l’école. Il a l’air intelligent.
C.laugh : Il vient de manger ma gomme.
B.point : Attends, il y a un numéro de téléphone sur le collier.
A.talk!sad : Bon… on appelle. Mais je lui dis au revoir d’abord.
C.talk!happy : On pourra peut-être lui rendre visite.
B.laugh : Biscuit, le premier chien qui a passé une matinée à l’école !

=== cours-dessin-portrait | Le portrait
titres: Le portrait de {B} par {A} 🖼️ / Ressemblant… ou pas ?
# classroom A:left B:center C:right
B.talk : Pour le cours d’art, chacun dessine le portrait de son voisin.
A.celebrate!happy : Je dessine {B} ! Ne bouge surtout pas.
B.talk : D’accord. Je reste immobile. Comme une statue.
C.think : Tu dessines depuis vingt minutes, {A}.
A.talk : L’art ne se presse pas. Voilà ! Mon chef-d’œuvre !
B.surprise!surprised : Pourquoi j’ai trois yeux et des oreilles de lapin ?
A.talk : C’est ta personnalité. Je dessine l’intérieur des gens.
C.laugh : Alors {B} est un lapin très intelligent.
B.think : À mon tour. Je te dessine, {A}.
B.talk : Voilà. Une grande bouche qui parle tout le temps.
A.surprise!surprised : C’est méchant ! Mais… c’est très ressemblant.
C.laugh : Les deux portraits sont parfaits !
`;
