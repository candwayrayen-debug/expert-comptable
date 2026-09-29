import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js lit `.env.local` ; drizzle-kit ne connaît que `.env` par défaut.
// On charge donc les deux, dans l'ordre de priorité de Next.js.
config({ path: ".env.local" });
config();

// La chaîne n'est utile que pour les commandes qui se connectent réellement
// (`db:migrate`, `db:push`, `db:studio`). `db:generate`, lui, travaille sur le
// schéma seul : on peut donc générer une migration sans base configurée.
// Sur Netlify, la base est fournie par la plateforme (NETLIFY_DB_URL) et les
// migrations sont appliquées au déploiement : cette configuration ne sert qu'au
// développement local.
const url = process.env.DATABASE_URL ?? process.env.NETLIFY_DB_URL ?? "";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
});
