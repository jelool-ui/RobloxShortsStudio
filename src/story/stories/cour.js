// Série 3 : la cour de récréation (20 histoires). Format : voir src/story/dsl.js
export default String.raw`
=== ballon-arbre | Le ballon dans l’arbre
titres: Le ballon coincé dans l’arbre ⚽ / Mission : récupérer le ballon
# yard A:left B:right C:tree
C.talk!sad : Le ballon est coincé tout en haut de l’arbre.
A.celebrate mv:A=run>center : Pas de problème ! Je vais grimper comme un singe.
B.angry!angry : Non, {A} ! C’est beaucoup trop haut.
A.talk : Alors je saute. J’ai des ressorts dans les jambes.
A.jump sfx:boing : Hop ! Et… raté.
C.think : On pourrait secouer l’arbre très fort.
B.talk : Ou attendre que le vent le fasse tomber.
A.talk : Le vent est en vacances, aujourd’hui.
~1.0 sfx:pop r:A=surprise,B=surprise,C=surprise cam:wide punch
B.surprise!surprised : Il est tombé tout seul !
A.celebrate!happy : C’est grâce à mon saut. Il a eu peur de moi.
C.laugh : Ou alors c’est la pomme de pin qui l’a poussé.
B.laugh : Allez, on joue avant qu’il reparte dans l’arbre !

=== cache-cache | Le cache-cache
titres: Le meilleur cache-cache du monde 🙈 / Où est passé {C} ?
# yard A:center B:left C:right
A.talk : On joue à cache-cache ! Je compte jusqu’à dix.
B.talk : D’accord. Ne triche pas, ferme les yeux.
A.think : Un, deux, trois… dix ! J’arrive !
B.laugh mv:B=walk>bench : Trouvée, je suppose. Je n’ai pas eu le temps.
A.talk : Il manque {C}. Il est où ?
B.think : Il est peut-être derrière l’arbre.
A.talk : Non. Ni derrière le banc, ni sous le panier.
B.surprise!surprised : Ça fait cinq minutes. Il est vraiment très fort.
C.talk!happy : Je suis là ! Je n’ai pas bougé depuis le début.
A.surprise!surprised r:B=surprise punch : Quoi ? Tu étais juste devant moi ?
C.talk : Je suis resté très immobile. Comme une statue.
B.laugh : La meilleure cachette, c’est de ne pas se cacher !
A.talk!sad : Je ne regarderai plus jamais une statue de la même façon.

=== chasse-tresor | La chasse au trésor
titres: La chasse au trésor de la récré 🗺️ / Le trésor caché de l’école
# yard A:left B:center C:right
A.celebrate!happy : J’ai trouvé une carte au trésor dans la cour !
C.surprise!happy : Un vrai trésor ? Avec des pièces d’or ?
B.think : Montre-moi. La croix est dessinée près du grand arbre.
A.talk : Allons-y ! On va devenir riches !
C.talk mv:C=walk>tree : Il faut creuser ici, je crois.
B.talk : Doucement. On ne doit pas abîmer la pelouse.
~1.0 sfx:ding r:A=surprise,B=surprise,C=surprise cam:wide punch
C.surprise!surprised : Il y a une boîte en métal !
A.celebrate!happy : Ouvre-la ! Ouvre-la !
C.talk : Il y a… un mot : « Bravo, vous avez trouvé ma collection de billes. »
B.laugh : C’est la boîte d’un ancien élève !
A.talk!sad : Des billes ? Moi qui voulais acheter un château.
C.laugh : On pourra jouer aux billes dans le château !

=== marelle-championne | La championne de marelle
titres: Le grand championnat de marelle 🔢 / {A} contre {B} à la marelle
# yard A:left B:hopscotch C:right
B.talk : Je suis la championne de la marelle. Personne ne me bat.
A.talk : La marelle ? C’est un jeu de bébé. Je gagne les yeux fermés.
B.point : Vas-y, montre-nous.
A.jump sfx:boing : Un, deux, trois… quatre !
C.think : Tu as marché sur la ligne. Tu as perdu.
A.angry!angry : La ligne a bougé ! C’est la ligne qui triche !
B.jump sfx:boing : À moi. Un, deux, trois, quatre… et le ciel !
C.celebrate!happy : Parfait ! Pas une seule erreur !
A.talk!sad : Bon. Elle a peut-être un tout petit peu de talent.
B.laugh : Un tout petit peu ? Je t’entraîne si tu veux.
A.talk : D’accord. Mais seulement si personne ne regarde.
C.laugh : Toute la cour regarde, {A}.

=== course-escargots | La course d’escargots
titres: La course d’escargots la plus lente 🐌 / Le grand prix des escargots
# yard A:left B:center C:right
A.celebrate!happy : Grande course d’escargots ! Mon champion s’appelle Éclair.
C.talk : Le mien s’appelle Doudou. Il est très gentil.
B.talk : Le mien s’appelle Professeur. Il est très intelligent.
A.point : Prêts… partez !
C.think : Ils ne bougent pas du tout.
A.talk : Ils se concentrent. C’est une course de haut niveau.
B.talk : Ça fait cinq minutes. Professeur a avancé d’un centimètre.
A.angry!angry : Éclair, avance ! Pense à la gloire !
C.surprise!surprised r:A=surprise punch : Doudou a fait demi-tour ! Il retourne dans son coin !
B.laugh : Il a compris que la course était trop longue.
A.talk!sad : Éclair dort. Je crois qu’il a abandonné.
C.laugh : Le gagnant, c’est celui qui a fait la meilleure sieste !

=== flocons-mai | De la neige en mai ?
titres: Il neige en plein mois de mai ❄️ / La neige mystérieuse
# yard A:left B:center C:right
C.surprise!surprised r:A=surprise,B=surprise punch : Regardez ! Il neige en plein mois de mai !
A.celebrate!happy : Une bataille de boules de neige ! Tous à vos postes !
B.think : Attends. Il fait vingt-cinq degrés. Ce n’est pas possible.
C.talk : Pourtant, il y a des flocons blancs partout.
A.talk : C’est un miracle météorologique. On sera dans le journal.
B.point : Ce ne sont pas des flocons. Regardez, ils ne fondent pas.
C.think : On dirait du coton tout doux.
B.talk : Ce sont les graines des peupliers. Le vent les fait voler.
A.talk!sad : Donc pas de bataille de boules de neige ?
C.laugh : On peut faire une bataille de boules de coton !
A.celebrate!happy : Encore mieux ! Ça ne fait pas mal.
B.laugh : Et personne n’a froid aux mains.

=== nuages-formes | Les formes des nuages
titres: Qu’est-ce que tu vois dans les nuages ? ☁️ / Le nuage en forme de…
# yard A:left B:center C:right
B.point : Allongeons-nous et regardons les nuages. Moi, je vois un lapin.
C.talk : Moi, je vois un bateau avec une grande voile.
A.think : Et moi, je vois une énorme pizza aux quatre fromages.
B.laugh : Tu as faim, {A}, c’est tout.
A.talk : Non, regarde. Là, c’est la croûte. Et là, le fromage qui coule.
C.think : Maintenant que tu le dis… on dirait vraiment une pizza.
B.surprise!surprised : C’est vrai ! Il y a même une olive !
A.celebrate!happy : Vous voyez ? Je suis un expert des nuages.
C.talk!sad : Oh non… le vent est en train de la manger.
A.talk : Tant mieux. Ça m’a donné faim. On va à la cantine ?
B.laugh : Il est dix heures du matin, {A}.
A.talk : Mon ventre ne sait pas lire l’heure.

=== tournoi-billes | Le tournoi de billes
titres: Le grand tournoi de billes 🔵 / La bille magique de {C}
# yard A:left B:center C:right
A.talk : Grand tournoi de billes ! Le gagnant remporte la bille géante.
B.talk : J’ai mes billes en verre. Elles sont très précises.
C.talk : Moi, j’ai une seule bille. Elle est un peu cabossée.
A.laugh : Avec une seule bille cabossée ? Tu n’as aucune chance.
B.point : Le premier qui touche la bille du milieu a gagné.
A.talk : Regardez la technique du champion. Pan !
B.think : Raté. Ta bille est partie sous le banc.
C.talk : Bon… j’essaie. Doucement.
~1.0 sfx:ding r:A=surprise,B=surprise cam:closeup:C punch
C.surprise!surprised : Je l’ai touchée ! Du premier coup !
A.surprise!surprised : C’est une bille magique ou quoi ?
C.laugh : Non. C’est une bille qui a beaucoup d’expérience.
B.laugh : La bille cabossée remporte le tournoi !

=== pigeon-gourmand | Le pigeon gourmand
titres: Le pigeon voleur de goûter 🐦 / {A} contre le pigeon
# yard A:center B:left C:right
A.celebrate!happy : Mon goûter du jour : un énorme croissant au beurre.
C.point!surprised : Attention ! Un pigeon te regarde avec des yeux affamés.
A.talk : Un pigeon ? Il ne me fait pas peur. Je suis plus grand que lui.
B.think : Il n’est pas tout seul. Il a appelé ses amis.
A.scared!scared : Il y en a combien ?
C.talk : Un, deux… onze. Ils sont onze.
A.talk : D’accord. Je propose un marché. Je vous donne une miette chacun.
~1.0 sfx:whoosh r:A=jump,B=surprise,C=surprise cam:wide punch
B.surprise!surprised : Ils ont tout pris ! Même le papier !
A.talk!sad : Mon croissant… il était si beau.
C.talk : Tiens, je partage ma pomme avec toi.
A.talk!happy : Merci, {C}. Les pigeons n’aiment pas les pommes ?
B.laugh : Apparemment, ils préfèrent le beurre.

=== un-deux-trois-soleil | Un, deux, trois, soleil
titres: Le roi du un, deux, trois, soleil ☀️ / Personne ne bouge !
# yard A:left B:center C:right
B.talk : On joue à un, deux, trois, soleil. Je compte face à l’arbre.
A.talk : Je vais gagner. Je suis le plus rapide de la cour.
C.talk : Et moi, je suis le meilleur pour rester immobile.
B.talk : Un, deux, trois… soleil !
A.surprise!surprised : Euh… je suis tout à fait immobile.
B.point : Tu as bougé ton petit doigt, {A}. Retour au départ.
A.angry!angry : C’est mon doigt qui a bougé tout seul !
B.talk : Un, deux, trois… soleil !
C.think : Je ne bouge pas. Je suis une statue. Je suis un arbre.
B.surprise!surprised : {C}, tu es déjà arrivé ? Je ne t’ai jamais vu bouger !
C.celebrate!happy : C’est ma technique secrète : je marche quand tu clignes des yeux.
A.laugh : Il est vraiment très fort, ce {C}.
B.laugh : Le roi du un, deux, trois, soleil !

=== panier-impossible | Le panier impossible
titres: Le tir impossible au basket 🏀 / {C} marque le panier du siècle
# yard A:left B:center C:hoop
A.talk : Regardez-moi marquer un panier de très loin.
B.talk : Tu es au milieu de la cour. C’est beaucoup trop loin.
A.talk : Pour les autres, peut-être. Pour moi, c’est la distance parfaite.
A.jump sfx:boing : Et… je tire !
B.think : Le ballon est parti dans la direction opposée.
A.talk!sad : C’est le vent. Il souffle contre moi.
C.talk : Je peux essayer ? Je n’ai jamais joué au basket.
A.laugh : Vas-y. De toute façon, c’est impossible.
~1.0 sfx:ding r:A=surprise,B=surprise cam:low:C punch
B.surprise!surprised : Il est rentré ! Sans toucher le panier !
C.surprise!surprised : Je voulais juste te rendre le ballon…
A.talk : Ça ne compte pas. Ce n’était pas fait exprès.
B.laugh : C’est un panier quand même, {A} !

=== gouter-echange | L’échange de goûter
titres: Le goûter échangé 🍪 / Le marché du goûter
# yard A:left B:center C:right
A.talk : Qui veut échanger son goûter avec moi ?
C.think : Qu’est-ce que tu as ?
A.talk : Un trésor rare. Une compote à la pomme.
B.talk : Moi, j’ai des biscuits au chocolat.
A.talk : Je te donne ma compote contre tous tes biscuits.
B.angry!angry : Tous ? Ce n’est pas un échange équitable.
A.talk : Ma compote a voyagé. Elle est très précieuse.
C.talk : Moi, j’ai un sandwich au fromage. Je peux participer ?
A.surprise!happy : Au fromage ? Je te donne ma compote !
C.think : Non merci. J’adore mon sandwich.
B.laugh : Finalement, personne ne veut de ta compote.
A.talk!sad : Bon… je vais la manger. Elle est délicieuse, en fait.

=== casquette-vent | La casquette s’envole
titres: Le vent a volé la casquette de {A} 🌬️ / Rattrape ta casquette !
# yard A:center B:left C:right
A.celebrate!happy : Quelle belle journée ! Ma casquette brille au soleil.
B.point : Attention, le vent souffle très fort aujourd’hui.
~1.0 sfx:whoosh r:A=jump,B=surprise,C=surprise cam:wide punch
A.surprise!surprised : Ma casquette ! Elle s’envole !
C.point mv:C=run>left : Elle part vers le terrain de basket !
A.talk mv:A=run>right : Reviens ! Je t’ai toujours bien traitée !
B.think : Elle tourne autour du panier…
C.surprise!surprised : Elle est tombée pile dans le panier de basket !
B.laugh : Deux points pour la casquette !
A.talk : C’est la première fois que je marque un panier.
C.laugh : Techniquement, c’est ta casquette qui a marqué.
A.celebrate!happy : On forme une équipe. C’est pareil !

=== avion-papier | L’avion en papier
titres: Le meilleur avion en papier 🛩️ / Le vol record de l’avion de {C}
# yard A:left B:center C:right
B.talk : Concours d’avions en papier ! Le plus long vol gagne.
A.talk : J’ai fabriqué le meilleur avion. Il s’appelle le Supersonique.
C.talk : Le mien est un peu tordu. Il s’appelle Patatras.
B.talk : Le mien est plié selon les lois de l’aérodynamique.
A.point : Le Supersonique décolle ! Trois, deux, un !
B.think : Il a fait trois loopings… et il s’est planté dans la poubelle.
A.talk!sad : Il voulait se reposer.
B.talk : À moi. Un vol parfait, en ligne droite.
C.talk : Et Patatras… je le lance doucement.
~1.0 sfx:whoosh r:A=surprise,B=surprise cam:wide punch
A.surprise!surprised : Il vole toujours ! Il est déjà au-dessus de l’école !
C.surprise!surprised : Je crois qu’il ne reviendra jamais.
B.laugh : Patatras a gagné… et il a pris des vacances.

=== club-secret | Le club secret
titres: Le club secret de la récré 🤫 / Qui peut entrer dans le club ?
# yard A:tree B:center C:right
A.talk : Bienvenue dans mon club secret. Le mot de passe, s’il vous plaît.
B.think : Je ne connais pas le mot de passe. C’est quoi ?
A.talk : Je ne peux pas le dire. Il est secret.
C.talk : Alors comment on fait pour le deviner ?
A.talk : C’est un mot qui commence par « choco » et qui finit par « lat ».
B.laugh : Chocolat ?
A.celebrate!happy : Bravo ! Vous êtes membres du club !
C.think : Et qu’est-ce qu’on fait, dans ce club ?
A.talk : On cherche un nouveau mot de passe. Celui-là, tout le monde le connaît.
B.talk : Combien de membres il y a dans le club ?
A.talk : Avec vous ? Trois. Et le pigeon qui dort sur la branche.
C.laugh : Le club le plus secret… de toute la cour !

=== pluie-soudaine | L’averse surprise
titres: L’averse surprise à la récré 🌧️ / Sauve qui peut, il pleut !
# yard A:left B:center C:right
A.celebrate!happy : Grand soleil ! Récré parfaite pour une partie de ballon.
B.point : Euh… il y a un énorme nuage noir juste au-dessus de nous.
C.scared!scared : Un nuage noir ? C’est l’orage ! Il va y avoir des éclairs !
A.talk : Un nuage tout seul, ce n’est rien. Il va passer.
~1.0 sfx:whoosh r:A=jump,B=surprise,C=scared cam:wide punch
B.surprise!surprised : Il pleut des cordes !
C.scared mv:C=run>door : Tout le monde à l’abri !
A.talk : Moi, je reste. Je ne fonds pas, je ne suis pas en sucre.
B.laugh : Tu es trempé jusqu’aux chaussettes, {A}.
A.talk!sad : Bon… je suis peut-être un tout petit peu en sucre.
C.laugh : Viens te sécher avant de te transformer en flaque !
B.laugh : Le soleil revient déjà. Quel timing parfait.

=== corde-a-sauter | La corde à sauter
titres: Le record de corde à sauter 🪢 / Qui sautera le plus longtemps ?
# yard A:left B:center C:right
B.talk : Je vais battre mon record de corde à sauter : cent sauts !
A.talk : Cent ? Moi, je peux en faire mille.
C.think : Tu as déjà fait de la corde à sauter, {A} ?
A.talk : Non. Mais j’ai beaucoup d’imagination.
B.jump sfx:boing : Un, deux, trois… cinquante… cent ! Record battu !
C.celebrate!happy : Bravo ! Tu as sauté comme un kangourou !
A.talk : À moi. Regardez le futur champion.
A.jump sfx:boing : Un… et… zut. La corde s’est enroulée autour de mes pieds.
B.laugh : Un saut. Le record de {A} est d’un saut.
A.talk : C’est un record quand même. Le record du plus court.
C.laugh : On devrait l’inscrire dans le livre des records.
A.celebrate!happy : Enfin ! Je deviens célèbre !

=== sieste-banc | La sieste sur le banc
titres: {C} s’est endormi sur le banc 😴 / La sieste la plus longue
# yard A:left B:center C:bench
B.think : Où est {C} ? La récré est finie depuis cinq minutes.
A.point : Il est là, sur le banc. Il dort comme un bébé.
B.talk : Il faut le réveiller, sinon il va rater la leçon.
A.talk : Laisse-moi faire. Je connais une méthode très douce.
A.celebrate : Debout ! Les dinosaures attaquent l’école !
~0.9 r:C=jump cam:low:C punch sfx:boing
C.scared!scared : Où ça ? Où sont les dinosaures ?
B.angry!angry : {A}, tu avais dit une méthode douce !
A.talk : C’était doux. Je n’ai pas crié très fort.
C.talk!sad : Je rêvais que je mangeais une glace géante…
A.laugh : Une glace ? Fallait le dire, je t’aurais laissé dormir.
B.laugh : Allez, tout le monde en classe. Même les dinosaures.

=== fourmis-colonne | La colonne de fourmis
titres: L’armée de fourmis 🐜 / Les fourmis ont un plan
# yard A:left B:center C:right
C.point!surprised r:A=surprise,B=surprise : Regardez ! Une longue file de fourmis traverse la cour !
A.talk : Elles vont où, comme ça ? En vacances ?
B.think : Elles transportent de la nourriture vers leur fourmilière.
C.talk : Il y en a une qui porte une miette énorme. Elle est super forte.
A.talk : C’est la chef. Elle s’appelle Hercule.
B.talk : Les fourmis peuvent porter dix fois leur poids.
A.think : Dix fois ? Alors je pourrais porter mon cartable et celui de {C}.
C.laugh : Tu n’es pas une fourmi, {A}.
B.point!surprised r:A=surprise punch : Attendez… elles viennent toutes de ton sac !
A.surprise!surprised : Mon goûter ! Elles volent mon goûter !
C.laugh : Hercule a trouvé ton gâteau au miel.
A.talk!sad : Bon… elles ont plus faim que moi. Je leur laisse.

=== statue-humaine | La statue humaine
titres: {A} se transforme en statue 🗿 / La statue qui bouge
# yard A:center B:left C:right
A.talk : Je vais devenir une statue vivante. Je ne bougerai plus jamais.
B.think : Plus jamais ? Même pour aller manger ?
A.talk : Les statues n’ont pas besoin de manger. C’est leur force.
C.talk : On va voir combien de temps tu tiens.
B.talk : Ça fait une minute. Il n’a pas bougé.
C.think : Ça fait deux minutes. Il a les yeux qui piquent.
B.point : Il y a une mouche qui se pose sur son nez.
A.talk : Je… ne… bouge… pas.
C.talk : Et on vient d’annoncer des frites à la cantine.
~1.0 r:A=jump cam:low:A punch sfx:boing
A.celebrate!happy : Des frites ? La statue a faim !
B.laugh : Trois minutes. Record de la statue la plus gourmande.
C.laugh : Les statues adorent les frites, apparemment.
`;
