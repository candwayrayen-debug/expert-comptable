import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL est requis. Copiez .env.example vers .env.local et renseignez la connexion PostgreSQL.",
  );
}

/**
 * Un hébergement serverless (Netlify, Vercel) crée une instance de fonction par
 * invocation concurrente, et donc une connexion à la base pour chacune. Un pool
 * large épuiserait le quota de connexions en quelques requêtes simultanées :
 * on le limite à une connexion par instance et on laisse le pooler de la base
 * (PgBouncer chez Supabase, port 6543) mutualiser.
 *
 * Une connexion en cours ne survit pas à la fin de l'invocation : le pool ne
 * sert donc qu'à éviter de rouvrir une connexion plusieurs fois au sein d'une
 * même requête.
 */
const serverless = Boolean(
  process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME,
);

const usesPooler = /pooler\.supabase\.com|pgbouncer=true/.test(databaseUrl);

/** Une base distante impose TLS ; une base locale s'en passe. */
const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])(:|\/)/.test(databaseUrl);

const globalForDb = globalThis as typeof globalThis & {
  __cbsPostgresPool?: Pool;
};

export const pool =
  globalForDb.__cbsPostgresPool ??
  new Pool({
    connectionString: databaseUrl,
    max: serverless || usesPooler ? 1 : 10,
    // Le pooler de Supabase ferme les connexions inactives de son côté ;
    // on libère donc les nôtres plus tôt pour ne pas garder de sockets morts.
    idleTimeoutMillis: usesPooler ? 5_000 : 30_000,
    connectionTimeoutMillis: 10_000,
    // Les hébergeurs gérés exigent TLS. Le certificat n'est pas vérifié contre
    // les autorités du système : à durcir avec le certificat de l'hébergeur si
    // votre politique de sécurité l'impose.
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });

// En développement, le rechargement à chaud recréerait un pool à chaque
// modification de fichier sans ce cache sur l'objet global.
if (process.env.NODE_ENV !== "production") {
  globalForDb.__cbsPostgresPool = pool;
}

export const db = drizzle(pool);
