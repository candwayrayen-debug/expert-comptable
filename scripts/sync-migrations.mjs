/**
 * Recopie les migrations Drizzle vers le dossier que Netlify applique.
 *
 * Drizzle écrit ses fichiers SQL dans `drizzle/`, accompagnés de son journal et
 * de ses instantanés — ce qui lui permet de générer les migrations suivantes.
 * Netlify Database, lui, applique tout ce qu'il trouve dans
 * `netlify/database/migrations/` juste avant de mettre la nouvelle version en
 * ligne.
 *
 * Les noms produits par Drizzle (`0001_damp_firestar.sql`) respectent déjà le
 * format attendu par Netlify (`<numéro>_<slug>.sql`) : il suffit donc de copier.
 * Le dossier de destination est reconstruit à chaque exécution, pour qu'une
 * migration supprimée côté Drizzle ne reste pas appliquée par Netlify.
 *
 * Appelé automatiquement par `npm run db:generate`.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";

const SOURCE = "drizzle";
const DESTINATION = "netlify/database/migrations";

const migrations = existsSync(SOURCE)
  ? readdirSync(SOURCE)
      .filter((fichier) => fichier.endsWith(".sql"))
      .sort()
  : [];

if (migrations.length === 0) {
  console.error(
    `Aucune migration trouvée dans ${SOURCE}/. Lancez d'abord « npm run db:generate ».`,
  );
  process.exit(1);
}

rmSync(DESTINATION, { recursive: true, force: true });
mkdirSync(DESTINATION, { recursive: true });

for (const fichier of migrations) {
  cpSync(`${SOURCE}/${fichier}`, `${DESTINATION}/${fichier}`);
}

console.log(`${migrations.length} migration(s) copiée(s) vers ${DESTINATION}/ :`);
for (const fichier of migrations) console.log(`  ${fichier}`);
