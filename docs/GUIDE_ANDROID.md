# Guide Android — utiliser RobloxShortsStudio depuis le téléphone

Tout se fait dans **Chrome** (ou l'application GitHub pour l'étape 5). Aucune installation.

## 1. Rendre le dépôt public (une seule fois)
Chrome → `github.com/<votre-compte>/RobloxShortsStudio` → **Settings** (onglet ⚙️ du dépôt ; sur mobile,
faites défiler les onglets ou utilisez « Afficher la version ordinateur ») → tout en bas, **Danger Zone**
→ **Change repository visibility** → **Change to public** → confirmez en tapant le nom du dépôt.

## 2. Activer GitHub Pages (une seule fois)
Dépôt → **Settings** → **Pages** (menu de gauche) → **Build and deployment** → **Source** :
choisissez **GitHub Actions**. Prévenez-moi : je lance la publication du tableau de bord.

## 3. Créer votre jeton personnel (une seule fois)
Photo de profil → **Settings** → **Developer settings** → **Personal access tokens** →
**Fine-grained tokens** → **Generate new token** :
- Token name : `shorts-studio` · Expiration : 90 jours (ou plus)
- Repository access : **Only select repositories** → `RobloxShortsStudio`
- Permissions → Repository permissions → **Actions : Read and write** (rien d'autre)
- **Generate token** → copiez-le (il ne s'affiche qu'une fois).

## 4. Ouvrir le tableau de bord
Chrome → `https://<votre-compte>.github.io/RobloxShortsStudio/` → onglet **Réglages** → collez le jeton →
**Tester et enregistrer**. Astuce : menu ⋮ de Chrome → **Ajouter à l'écran d'accueil** pour une icône.

- **Générer** : « Génération automatique » (un seul appui) ou « Personnaliser » (décor, histoire,
  rôles des personnages, qualité, graine).
- **Historique** : suivi en direct (≈ 12 min par épisode), erreurs affichées en clair.
- **Épisodes** : aperçu vidéo, **Exporter le MP4**, copier le titre et la description YouTube.

## 5. Sans le tableau de bord (solution de secours)
Application GitHub ou Chrome → dépôt → **Actions** → **Générer un épisode** → **Run workflow** →
choisissez les options → **Run workflow**. Le MP4 se télécharge en bas de la page de l'exécution
(**Artifacts**) ou dans **Releases**.

## Sécurité
- Le jeton reste uniquement dans le navigateur du téléphone ; il ne donne accès qu'aux générations
  de ce dépôt. Pour le révoquer : page des jetons GitHub → **Delete**.
- Le dépôt ne contient aucun secret.
