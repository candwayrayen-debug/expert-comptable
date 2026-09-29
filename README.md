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
npm run dev                    # http://localhost:3000
```

Le site s'affiche immédiatement, avec le contenu livré dans
`src/lib/content-defaults.ts`. **Aucune base de données n'est nécessaire pour
le consulter.**

L'espace `/admin`, lui, a besoin d'une base — c'est là que sont enregistrés le
contenu modifié, les messages reçus et les images. Deux façons d'en avoir une :

- **avec la CLI Netlify** (`npm i -g netlify-cli`, puis `netlify link` et
  `netlify dev`) : la base du site est accessible en local, telle quelle, sans
  rien configurer ;
- **avec un PostgreSQL local** : renseignez `DATABASE_URL` dans `.env.local`
  (voir `.env.example`), puis `npx drizzle-kit migrate` pour créer les tables.

Une fois une base en place : ouvrez `/admin`, connectez-vous, puis cliquez sur
**Importer le contenu par défaut**. L'opération est idempotente et n'affecte
pas les messages reçus.

## Déploiement sur Netlify

Le site utilise **Netlify Database**, la base PostgreSQL gérée par Netlify.
Elle est créée automatiquement au premier déploiement : il n'y a aucun compte
à ouvrir chez un fournisseur, aucune chaîne de connexion à recopier, aucun mot
de passe à retrouver, et aucune migration à lancer à la main.

1. Sur [app.netlify.com](https://app.netlify.com) : **Add new site → Import an
   existing project**, choisissez le dépôt GitHub, puis la branche à publier.
2. Ne touchez à rien dans les réglages de build : `netlify.toml` fournit déjà
   la commande (`npm run build`), le dossier publié (`.next`), la version de
   Node et le greffon Next.js.
3. Dans **Site configuration → Environment variables**, ajoutez une seule
   variable : `ADMIN_PASSWORD`, le mot de passe de l'espace `/admin`
   (8 caractères minimum). Les autres sont facultatives.
4. Lancez le déploiement. Le journal de build doit mentionner la mise en place
   de la base, puis l'application des migrations.

Ouvrez ensuite `/admin`, connectez-vous avec ce mot de passe, et cliquez sur
**Importer le contenu par défaut**. `GET /api/health` doit renvoyer
`{"ok":true}`. Les déploiements suivants partent automatiquement à chaque
`git push` sur la branche publiée.

### Ce dont Netlify s'occupe tout seul

| Étape | Qui s'en charge |
| --- | --- |
| Création de la base PostgreSQL | Netlify, au premier déploiement |
| Application des migrations | Netlify, juste avant chaque mise en ligne |
| Sauvegardes | Netlify (3 jours sur l'offre gratuite) |
| HTTPS, CDN, domaine personnalisé | Netlify |

L'application reçoit la connexion par la variable `NETLIFY_DB_URL`, que Netlify
injecte elle-même dans les builds, les fonctions et `netlify dev` : c'est pour
cela qu'il n'y a rien à configurer. `src/db/index.ts` lit cette variable en
priorité, et se rabat sur `DATABASE_URL` si vous préférez votre propre base.

### Ajouter une migration plus tard

`npm run db:generate` génère le fichier SQL avec Drizzle, puis le recopie
automatiquement dans `netlify/database/migrations/`, le dossier que Netlify
applique. Il n'y a donc rien d'autre à faire : committez, poussez, et la
migration part avec le déploiement.

N'utilisez jamais `db:migrate` ni `db:push` contre la base Netlify : c'est
Netlify qui applique les migrations. Ces deux commandes ne servent qu'à une
base locale.

### Coût

L'offre gratuite inclut 3 bases de 5 Go et 300 crédits par mois. Une base
consomme des crédits quand elle travaille, et s'endort après 5 minutes sans
requête ; pour un site vitrine, la consommation reste très en deçà du quota.
Si le trafic augmente, l'offre Personal (9 $/mois, 1 000 crédits) laisse une
marge très large.

### Bon à savoir

- **Images** : elles sont stockées dans la table `images`, pas sur le disque.
  Le système de fichiers d'une fonction serverless est en lecture seule et
  n'est pas conservé d'un déploiement à l'autre. Les images sont donc
  sauvegardées avec la base, et l'application reste déployable ailleurs sans
  dépendre d'un service tiers.
- **Taille des envois** : Netlify plafonne le corps d'une fonction synchrone à
  6 Mo, et les envois binaires y sont encodés en base64 (+30 %). La limite est
  donc fixée à 4 Mo par image, ce qui laisse une marge confortable sous ce
  plafond et garantit que le message d'erreur affiché est le nôtre.
- **Durée d'exécution** : 60 secondes maximum par appel de fonction.
- **Coût des images** : chacune est servie par une fonction tant qu'elle n'est
  pas en cache. L'en-tête `Cache-Control: immutable` posé par la route de
  diffusion et l'optimiseur d'images de Next.js limitent les lectures répétées.
- **Déjà un PostgreSQL ?** L'application accepte n'importe quelle base :
  renseignez `DATABASE_URL` (Supabase, Neon…). Sur Supabase, prenez la chaîne
  *Connection pooling* (port 6543) plutôt que la connexion directe, et
  appliquez les migrations avec `npx drizzle-kit migrate`.

## Variables d'environnement

| Variable | Obligatoire | Rôle |
| --- | --- | --- |
| `NETLIFY_DB_URL` | — | Renseignée par Netlify, jamais à saisir : c'est la connexion à la base de la plateforme, injectée dans les builds, les fonctions et `netlify dev`. |
| `DATABASE_URL` | non | Connexion à **votre** PostgreSQL, si vous préférez le vôtre. Inutile sur Netlify. |
| `ADMIN_PASSWORD` | oui | Mot de passe unique de l'espace d'administration (8 caractères minimum). Sur Netlify, c'est la seule variable à déclarer. |
| `ADMIN_SESSION_SECRET` | recommandé | Clé de signature des cookies de session. À défaut, une clé est dérivée du mot de passe. |

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
| `npm run db:generate` | Génère une migration depuis `src/db/schema.ts`, puis la recopie dans `netlify/database/migrations/` |
| `npm run db:migrations:sync` | Recopie seule, si besoin |
| `npm run db:migrate` | Applique les migrations à **votre base locale** (jamais à celle de Netlify, qui s'en charge) |
| `npm run db:push` | Synchronise le schéma sans fichier de migration (développement local uniquement) |
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
- L'application démarre et se construit **sans base de données** : la connexion
  n'est ouverte qu'à la première requête, et les lectures de contenu se
  rabattent sur `src/lib/content-defaults.ts` si elle est absente ou
  injoignable. Un premier déploiement ne peut donc pas échouer faute de base.
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
