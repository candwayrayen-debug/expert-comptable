import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { contentItems, settings } from "@/db/schema";
import { DEFAULT_CONTENT } from "@/lib/content-defaults";
import { COLLECTION_KEYS, SETTINGS } from "@/lib/content-schema";

const SEED_MARKER = "content_seeded";

/** Verrou consultatif : sérialise deux imports lancés en même temps. */
const SEED_LOCK_KEY = 918_273_645;

export type SeedReport = {
  done: boolean;
  items: number;
  settings: number;
};

async function isSeeded(): Promise<boolean> {
  const rows = await db
    .select({ key: settings.key })
    .from(settings)
    .where(eq(settings.key, SEED_MARKER))
    .limit(1);
  return rows.length > 0;
}

/**
 * Importe le contenu livré avec le site dans la base, pour qu'il devienne
 * modifiable depuis /admin.
 *
 * La fonction est idempotente et réparable : sans `force`, elle ne remplit que
 * les collections encore vides et ignore les réglages déjà présents. Elle peut
 * donc être relancée sans risque après un import partiel ou si le marqueur de
 * seed a été supprimé à la main. Avec `force`, tout est effacé et réécrit —
 * le contenu personnalisé est alors perdu.
 */
export async function seedContent({ force = false }: { force?: boolean } = {}): Promise<SeedReport> {
  if (!force && (await isSeeded())) {
    return { done: false, items: 0, settings: 0 };
  }

  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${SEED_LOCK_KEY})`);

    if (force) {
      await tx.delete(contentItems);
      await tx.delete(settings);
    }

    // Collections déjà pourvues : les compléter dupliquerait le contenu.
    const filled = new Set(
      (await tx.selectDistinct({ collection: contentItems.collection }).from(contentItems)).map(
        (row) => row.collection,
      ),
    );

    let items = 0;
    for (const collection of COLLECTION_KEYS) {
      if (filled.has(collection)) continue;

      const rows = DEFAULT_CONTENT[collection].map((data, index) => ({
        collection,
        position: index,
        published: true,
        data,
      }));
      if (rows.length > 0) {
        await tx.insert(contentItems).values(rows);
        items += rows.length;
      }
    }

    const settingRows = SETTINGS.map((field) => ({ key: field.key, value: field.fallback }));
    await tx.insert(settings).values(settingRows).onConflictDoNothing({ target: settings.key });
    await tx
      .insert(settings)
      .values({ key: SEED_MARKER, value: new Date().toISOString() })
      .onConflictDoNothing({ target: settings.key });

    return { done: true, items, settings: settingRows.length };
  });
}
