# expert-comptable

Site vitrine du **Cabinet Ben Salem**, cabinet d'expertise comptable à Tunis, avec
son espace d'administration.

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Drizzle ORM sur PostgreSQL.

## Ce que contient le projet

| Espace | Route | Rôle |
| --- | --- | --- |
| Site public | `/` | Page d'accueil : expertises, cabinet, parcours, formules, témoignages, FAQ, contact |
| Site public | `/confidentialite` | Politique de confidentialité |
| API | `POST /api/messages` | Enregistre une demande de contact (validation serveur) |
| API | `GET /api/health` | Sonde la base, renvoie `{"ok":true}` |
| API | `GET /api/images/[clé]` | Sert une image de la galerie, lue depuis la base |
| Administration | `/admin` | Tableau de bord : demandes à traiter, activité, état du contenu |
| Administration | `/admin/messages` | Boîte de réception : recherche, filtres, statuts, notes internes, export CSV |
| Administration | `/admin/contenu` | Édition du contenu de la page d'accueil (9 collections, galerie comprise) |
| Administration | `/admin/reglages` | Titres et coordonnées du cabinet |

## Démarrage

```bash
npm install
cp .env.example .env.local     # renseignez DATABASE_URL et ADMIN_PASSWORD
npx drizzle-kit migrate        # crée les tables
npm run dev                    # http://localhost:3000
```

La page publique fonctionne dès le premier lancement : tant que la base ne
contient aucun contenu, elle affiche celui livré avec le site. Pour le rendre
modifiable, ouvrez `/admin` et cliquez sur **Importer le contenu par défaut**
(l'opération est idempotente et n'affecte pas les messages reçus).

## Déploiement sur Netlify

Le projet est prêt à être déployé tel quel : `netlify.toml` déclare le greffon
officiel `@netlify/plugin-nextjs`, qui adapte le rendu serveur, les routes
d'API et les Server Actions au modèle serverless de Netlify.

### 1. Créer la base sur Supabase

1. Créez un projet sur [supabase.com](https://supabase.com), en notant le mot de
   passe de la base demandé à la création.
2. Ouvrez **Connect** (bouton en haut du tableau de bord) et copiez la chaîne
   **Connection pooling / Transaction** — port **6543**. La connexion directe
   (port 5432) est en IPv6 seul et chaque appel de fonction ouvre sa propre
   connexion : sans pooler, le quota est épuisé en quelques requêtes.
3. Remplacez `[YOUR-PASSWORD]` par le mot de passe de la base. S'il est perdu,
   régénérez-le dans **Settings → Database → Reset database password** ; les
   clés d'API ne le remplacent pas.

La chaîne ressemble à :

```
postgresql://postgres.abcdefgh:motdepasse@aws-0-eu-west-3.pooler.supabase.com:6543/postgres
```

> **À ne pas confondre.** Supabase expose deux familles d'identifiants. Les clés
> d'API — `SUPABASE_URL`, clé *publishable*, clé *secret*, URL JWKS — servent son
> API REST et son authentification. L'application n'en a pas besoin : elle parle
> directement à PostgreSQL via Drizzle. Le seul identifiant requis est la chaîne
> **`DATABASE_URL`**, avec le mot de passe de la base. La clé *secret* ne doit
> jamais être exposée côté navigateur ni versionnée.

### 2. Créer les tables

Depuis votre machine, avec la chaîne de connexion de Supabase :

```bash
DATABASE_URL='postgresql://…pooler.supabase.com:6543/postgres' npx drizzle-kit migrate
```

À relancer à chaque nouvelle migration. L'application ne modifie jamais le
schéma d'elle-même.

### 3. Déployer

1. Sur [app.netlify.com](https://app.netlify.com), **Add new site → Import an
   existing project**, puis choisissez le dépôt GitHub.
2. Netlify propose `npm run build` et publie `.next` : ce sont les valeurs de
   `netlify.toml`, il n'y a rien à corriger.
3. Dans **Site configuration → Environment variables**, ajoutez les variables
   du tableau ci-dessous, puis relancez un déploiement.

| Variable | Valeur sur Netlify |
| --- | --- |
| `DATABASE_URL` | Chaîne *Connection pooling* de Supabase (port 6543) |
| `ADMIN_PASSWORD` | Mot de passe de l'espace `/admin`, 8 caractères minimum |
| `ADMIN_SESSION_SECRET` | 64 caractères hexadécimaux, voir ci-dessous |

### 4. Après le déploiement

- Ouvrez `/admin`, connectez-vous, puis **Importer le contenu par défaut**.
- Vérifiez `GET /api/health` : il doit renvoyer `{"ok":true}`.
- Les déploiements suivants sont automatiques à chaque `git push` sur la
  branche de production.

### Bon à savoir

- **Images** : elles sont stockées dans la table `images`, pas sur le disque.
  Le système de fichiers d'une fonction serverless est en lecture seule et
  n'est pas conservé d'un déploiement à l'autre. Les images sont donc
  sauvegardées avec la base — un `pg_dump` suffit à tout emporter, et
  l'application reste déployable ailleurs sans dépendre d'un service tiers.
- **Taille des envois** : Netlify plafonne le corps d'une fonction synchrone à
  6 Mo, et les envois binaires y sont encodés en base64 (+30 %). La limite est
  donc fixée à 4 Mo par image, ce qui laisse une marge confortable sous ce
  plafond et garantit que le message d'erreur affiché est le nôtre.
- **Variables au build** : `DATABASE_URL` est lue pendant le build, pas seulement
  à l'exécution — la page d'accueil et le pied de page sont pré-générés à
  partir de la base. Un build sans elle échoue sur
  « DATABASE_URL est requis ». Les variables déclarées dans *Site
  configuration* de Netlify sont disponibles au build comme à l'exécution ;
  ne les restreignez pas au seul contexte *Functions*.
- **Connexion à la base** : si le pooler en mode *transaction* (6543) refuse
  les requêtes avec une erreur de *prepared statement*, basculez sur le mode
  *Session* de la même page **Connect** (même hôte, port 5432) : il ne
  mutualise pas aussi bien, mais il accepte tout.
- **Durée d'exécution** : 60 secondes maximum par appel de fonction.
- **Coût** : une image est servie par une fonction tant qu'elle n'est pas en
  cache. L'en-tête `Cache-Control: immutable` posé par la route de diffusion
  et l'optimiseur d'images de Next.js limitent les lectures répétées.

## Variables d'environnement

| Variable | Obligatoire | Rôle |
| --- | --- | --- |
| `DATABASE_URL` | oui | Connexion PostgreSQL. Sans elle, `src/db/index.ts` lève une erreur au chargement. En production, utilisez la chaîne du pooler. |
| `ADMIN_PASSWORD` | en production | Mot de passe unique de l'espace d'administration (8 caractères minimum). |
| `ADMIN_SESSION_SECRET` | en production | Clé de signature des cookies de session. À défaut, une clé est dérivée du mot de passe. |

Générer un secret :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Scripts

| Script | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm start` | Serveur de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, sans émission |
| `npm run db:generate` | Génère une migration à partir de `src/db/schema.ts` |
| `npm run db:migrate` | Applique les migrations |
| `npm run db:push` | Synchronise le schéma sans fichier de migration (développement) |
| `npm run db:studio` | Explorateur de base Drizzle Studio |

## La galerie

La collection `gallery` alimente la section « En images » de la page d'accueil :
une mosaïque où la première image est mise en avant, et qui reste invisible tant
qu'aucune photo n'a été téléversée.

Chaque image comporte une légende et une description d'accessibilité — cette
dernière est obligatoire, car c'est ce que liront les lecteurs d'écran.

### Où sont stockés les fichiers

Dans la table `images` de la base, jamais sur le disque. La clé est l'empreinte
SHA-256 du contenu : envoyer deux fois le même visuel n'enregistre qu'une seule
ligne, et plusieurs fiches peuvent la partager sans la dupliquer.

L'application ne lit donc pas de fichiers : la route `GET /api/images/[clé]`
renvoie l'image au navigateur, et l'optimiseur de Next.js la sollicite aussi
pour produire les miniatures. Le type MIME est celui déduit des octets du
fichier à l'envoi, jamais celui annoncé par le client.

Ce choix découle de l'hébergement : une fonction Netlify a un système de
fichiers en lecture seule, non conservé d'un déploiement à l'autre. Un fichier
écrit à l'exécution dans `public/uploads/` ne serait ni servi, ni retrouvé après
le déploiement suivant.

La contrepartie est que les images pèsent sur la base et sur ses sauvegardes :
préférez des visuels de 1600 px de large, ce qui suffit largement à l'affichage.
La clé étant l'empreinte du contenu, l'en-tête `Cache-Control: immutable` peut
être posé sur un an : remplacer une image change son adresse.

### Contrôles à l'envoi

| Contrôle | Détail |
| --- | --- |
| Taille | 4 Mo maximum, vérifié aussi côté navigateur pour éviter un envoi inutile |
| Format | JPEG, PNG, WebP ou AVIF, identifié sur les octets d'en-tête et non sur l'extension |
| SVG | Refusé : il peut embarquer du script et serait servi depuis notre domaine |
| Nom de fichier | Toujours régénéré, jamais celui fourni par le client |
| Contenu | Stocké tel quel dans une colonne `bytea`, jamais interprété ni exécuté |

Une image n'est conservée qu'à l'enregistrement de la fiche. Si la validation
échoue ensuite, l'image envoyée est supprimée. Une image remplacée ou dont la
fiche est supprimée l'est aussi, sauf si une autre fiche l'utilise encore —
deux visuels identiques partageant une même ligne, la suppression est
comptée par références.

## Comment le contenu est structuré

`src/lib/content-schema.ts` est la source de vérité : il décrit les champs de
chaque collection, leurs types et leurs contraintes. Ce fichier alimente à la
fois le rendu du site public, la validation à l'écriture et les formulaires de
l'administration. Ajouter un champ se fait donc à un seul endroit, sans écrire
d'écran d'édition.

Les éléments sont stockés dans la table `content_items` (une ligne par élément,
données en JSONB). Les réglages scalaires — titres, coordonnées — vivent dans
`settings`. Le repli sur le contenu livré (`src/lib/content-defaults.ts`) n'est
appliqué qu'aux clés absentes de la base : vider un réglage en base est un choix
explicite de l'administrateur, qui masque l'élément correspondant sur le site.

## Sécurité de l'administration

- Mot de passe unique, comparé à temps constant (`node:crypto.timingSafeEqual`).
- Session par cookie `httpOnly` signé HMAC-SHA256, valable 8 heures.
- Limitation des tentatives de connexion : 8 échecs sur 5 minutes bloquent
  l'accès pendant 5 minutes.
- Les Server Actions sont protégées nativement par le contrôle d'origine de
  Next.js ; une origine inconnue voit sa requête rejetée.
- `/admin` et `/api` sont exclus de l'indexation (`src/app/robots.ts` et
  en-tête `robots` sur l'espace d'administration).

## Notes techniques

- La page d'accueil est statique avec un délai de revalidation de 5 minutes ;
  chaque enregistrement depuis l'administration la revalide immédiatement.
- Les sections dont la collection est vide ne sont pas rendues.
- L'export CSV utilise le point-virgule et un BOM UTF-8, pour une ouverture
  directe dans Excel en configuration francophone.
- Le pied de page lit lui-même ses données : il reste cohérent sur toutes les
  pages, y compris la page 404.
- La limite de taille des Server Actions est fixée à 6 Mo dans
  `next.config.ts`, au-dessus de la limite métier de 4 Mo : sans cette marge,
  Next.js rejetterait la requête avant notre propre contrôle et
  l'administrateur verrait une erreur technique au lieu du message expliquant
  la limite. C'est aussi le plafond de Netlify pour une fonction synchrone ;
  `src/app/admin/(dashboard)/error.tsx` affiche un message lisible si un envoi
  le franchit malgré tout.
- `src/lib/image-rules.ts` ne contient que des constantes et des fonctions
  pures, sans import Node : il est chargé par des composants client,
  contrairement à `image-store.ts` qui interroge la base.

## Pistes d'évolution

- Envoi d'un e-mail de notification au cabinet à chaque nouvelle demande.
- Comptes nominatifs et rôles, si plusieurs personnes doivent accéder à l'admin.
- Pagination ou recherche côté serveur au-delà de quelques milliers de messages.
- Rendre le visuel du hero modifiable depuis l'administration : c'est
  désormais le dernier fichier image encore statique dans `public/images`.
- Réduction à l'envoi : les images sont stockées telles qu'elles ont été
  téléversées, ce qui alourdit la base ; un redimensionnement à 1600 px les
  allégerait nettement.
