# Mijoté — Livre de recettes partagé

Application web de recettes maison, faite pour être partagée entre amis.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Stockage** : fichiers JSON en local, [Upstash Redis](https://upstash.com) en production
- **Photos** : dossier local en dev, [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) en production
- **Hébergement** : [Vercel](https://vercel.com)

## Lancer en local

```bash
# 1. Cloner le repo
git clone <url-du-repo>
cd <nom-du-repo>/app

# 2. Installer les dépendances
npm install

# 3. Créer le fichier d'environnement
cp .env.local.example .env.local
# puis éditer .env.local avec ton mot de passe et ta clé Anthropic

# 4. Lancer
npm run dev
```

Ouvrir http://localhost:3000

En local, les recettes sont lues et écrites dans `src/data/recipes.json` et les photos dans `public/images/recipes/` — pas besoin de Redis ni de Blob.

## Variables d'environnement

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `ADMIN_PASSWORD` | ✅ | Mot de passe du backoffice |
| `ANTHROPIC_API_KEY` | ✅ | Pour l'import de recettes via Claude |
| `UPSTASH_REDIS_REST_URL` | Production | URL REST Upstash (injecté par Vercel) |
| `UPSTASH_REDIS_REST_TOKEN` | Production | Token Upstash (injecté par Vercel) |
| `BLOB_READ_WRITE_TOKEN` | Production | Token Vercel Blob (injecté par Vercel) |

## Pages

| URL | Description |
|-----|-------------|
| `/` | Homepage — recettes, recherche, catégories |
| `/recettes/[id]` | Détail recette + impression |
| `/admin` | Backoffice (protégé par mot de passe) |
| `/admin/new` | Ajouter une recette |
| `/admin/edit/[id]` | Modifier une recette |

## Déploiement sur Vercel

1. Pousser le code sur GitHub
2. Importer le repo sur [vercel.com](https://vercel.com) — le `vercel.json` à la racine pointe automatiquement vers le dossier `app/`
3. Dans le dashboard Vercel, ajouter l'intégration **Upstash Redis** (marketplace) → injecte `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`
4. Ajouter un **Blob store** → injecte `BLOB_READ_WRITE_TOKEN`
5. Ajouter les variables `ADMIN_PASSWORD` et `ANTHROPIC_API_KEY`
6. Déployer — au premier accès, les recettes de `src/data/recipes.json` sont automatiquement importées dans Redis
