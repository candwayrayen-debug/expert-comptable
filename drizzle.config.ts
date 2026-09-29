import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js lit `.env.local` ; drizzle-kit ne connaît que `.env` par défaut.
// On charge donc les deux, dans l'ordre de priorité de Next.js.
config({ path: ".env.local" });
config();

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL est requis pour drizzle-kit. Copiez .env.example vers .env.local et renseignez la connexion PostgreSQL.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
});
