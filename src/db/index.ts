import { getConnectionString } from "@netlify/database";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Connexion PostgreSQL.
 *
 * Deux sources possibles, essayées dans cet ordre :
 *
 *  1. **Netlify Database** — la base gérée par Netlify, créée automatiquement
 *     au premier déploiement. La plateforme l'annonce à l'application par la
 *     variable `NETLIFY_DB_URL` : aucun compte à ouvrir, aucune chaîne de
 *     connexion à recopier, aucune migration à lancer à la main.
 *  2. **`DATABASE_URL`** — n'importe quel autre PostgreSQL, si vous préférez
 *     gérer le vôtre : une base locale en développement, ou un service externe
 *     (Supabase, Neon…). L'application s'en sert sans rien changer au code.
 *
 * Aucune des deux n'est obligatoire pour démarrer : le site public se rabat
 * alors sur le contenu livré avec le code. Seul l'espace d'administration
 * exige une base, puisque c'est là que sont enregistrés le contenu, les
 * messages reçus et les images.
 */

type Connexion = { url: string; origine: string };

function trouverConnexion(): Connexion | null {
  // Hors de Netlify, `getConnectionString()` lève une exception : c'est le cas
  // normal en développement local, on passe simplement à `DATABASE_URL`.
  try {
    const depuisNetlify = getConnectionString();
    if (depuisNetlify) return { url: depuisNetlify, origine: "Netlify Database" };
  } catch {
    /* pas de base Netlify dans cet environnement */
  }

  const depuisEnvironnement = process.env.DATABASE_URL?.trim();
  if (depuisEnvironnement) {
    return { url: depuisEnvironnement, origine: "DATABASE_URL" };
  }

  return null;
}

type Base = { pool: Pool; db: NodePgDatabase<Record<string, never>> };

// En développement, le rechargement à chaud réexécute les modules à chaque
// modification de fichier : sans ce cache sur l'objet global, on rouvrirait un
// pool de connexions à chaque fois.
const globalPourLaBase = globalThis as typeof globalThis & { __cbsBase?: Base };

function ouvrirBase(): Base {
  if (globalPourLaBase.__cbsBase) return globalPourLaBase.__cbsBase;

  const connexion = trouverConnexion();
  if (!connexion) {
    throw new Error(
      "Aucune base de données n'est configurée : le site public fonctionne, mais l'espace d'administration ne peut rien enregistrer. Sur Netlify, la base est créée automatiquement (voir le README) ; ailleurs, renseignez DATABASE_URL.",
    );
  }

  // Un hébergement serverless (Netlify, Vercel) crée une instance de fonction
  // par invocation concurrente, et donc une connexion à la base pour chacune.
  // Un pool large épuiserait le quota de connexions : on le limite à une seule
  // par instance et on laisse la base mutualiser de son côté.
  const sansServeur = Boolean(
    process.env.NETLIFY ||
      process.env.NETLIFY_DB_URL ||
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME,
  );

  const avecPooler = /pooler\.supabase\.com|pgbouncer=true/.test(connexion.url);
  const locale = /@(localhost|127\.0\.0\.1|\[::1\])(:|\/)/.test(connexion.url);
  // Une base distante impose TLS. Si la chaîne le précise déjà (`sslmode=…`),
  // on la laisse décider : inutile de repasser par-dessus.
  const tlsImpose = !locale && !/[?&]sslmode=/.test(connexion.url);

  const pool = new Pool({
    connectionString: connexion.url,
    max: sansServeur || avecPooler ? 1 : 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
    ...(tlsImpose ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  const base: Base = { pool, db: drizzle(pool) };
  globalPourLaBase.__cbsBase = base;

  if (connexion.origine === "DATABASE_URL") {
    console.info(`Base de données : ${new URL(connexion.url).host} (via DATABASE_URL)`);
  }

  return base;
}

/**
 * La connexion n'est ouverte qu'au premier usage : importer ce module ne suffit
 * pas à en établir une. Un déploiement sans base — ou un build avant que la
 * base ne soit prête — n'échoue donc pas au chargement ; les lectures de
 * contenu, elles, retombent sur le contenu livré (voir `src/lib/content.ts`).
 */
export const db: NodePgDatabase<Record<string, never>> = new Proxy(
  {} as NodePgDatabase<Record<string, never>>,
  {
    get(_cible, propriete, recepteur) {
      const reelle = ouvrirBase().db;
      const valeur = Reflect.get(reelle, propriete, recepteur) as unknown;
      // Les méthodes doivent rester liées à l'instance réelle, sinon `select`,
      // `insert`… perdraient leur `this` en passant par le Proxy.
      return typeof valeur === "function" ? valeur.bind(reelle) : valeur;
    },
  },
);
