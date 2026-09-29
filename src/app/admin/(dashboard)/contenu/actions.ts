"use server";

import { and, asc, count, eq, max, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { contentItems } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { isContentSeeded } from "@/lib/content";
import { COLLECTIONS, isCollectionKey, validateItemData, type CollectionKey } from "@/lib/content-schema";
import { seedContent } from "@/lib/seed";
import { deleteImage, isFileLike, saveImage } from "@/lib/image-store";
import type { FormState } from "@/lib/form-state";

function revalidateSite(): void {
  revalidatePath("/", "layout");
}

async function resolveCollection(formData: FormData): Promise<CollectionKey | null> {
  const raw = formData.get("collection");
  return isCollectionKey(raw) ? raw : null;
}

function readId(formData: FormData): number | null {
  const raw = formData.get("id");
  if (typeof raw !== "string" || raw.length === 0) return null;
  const parsed = Number(raw);
  return Number.isInteger(parsed) ? parsed : null;
}

/** Message d'aide commun lorsque la base ne contient pas encore le contenu. */
const NOT_SEEDED =
  "Le contenu n’est pas encore importé en base. Utilisez « Importer le contenu par défaut » avant de modifier un élément.";

async function nextPosition(collection: CollectionKey): Promise<number> {
  const [row] = await db
    .select({ value: max(contentItems.position) })
    .from(contentItems)
    .where(eq(contentItems.collection, collection));
  return (row?.value ?? -1) + 1;
}

async function orderedIds(collection: CollectionKey): Promise<{ id: number; position: number }[]> {
  return db
    .select({ id: contentItems.id, position: contentItems.position })
    .from(contentItems)
    .where(eq(contentItems.collection, collection))
    .orderBy(asc(contentItems.position), asc(contentItems.id));
}

/* ------------------------------------------------------------------ */
/* Images téléversées                                                  */
/* ------------------------------------------------------------------ */

/**
 * Traite les champs image du formulaire : enregistre les fichiers choisis et
 * réécrit la valeur du champ avec le chemin public obtenu. Les fichiers écrits
 * sont renvoyés pour pouvoir être supprimés si la validation échoue ensuite.
 */
async function resolveImageFields(
  collection: CollectionKey,
  form: FormData,
): Promise<{ uploaded: string[]; errors: Record<string, string> }> {
  const uploaded: string[] = [];
  const errors: Record<string, string> = {};

  for (const field of COLLECTIONS[collection].fields) {
    if (field.type !== "image") continue;

    const file = form.get(`__upload_${field.name}`);

    if (isFileLike(file) && file.size > 0) {
      const result = await saveImage(file);
      if (result.ok) {
        form.set(field.name, result.path);
        uploaded.push(result.path);
      } else {
        errors[field.name] = result.error;
      }
      continue;
    }

    // Aucun nouveau fichier : l'image en place est conservée, sauf si
    // l'administrateur a explicitement demandé son retrait.
    if (form.get(`__clear_${field.name}`) === "true") form.set(field.name, "");
  }

  return { uploaded, errors };
}

/**
 * Supprime une image téléversée si plus aucun élément de contenu ne la
 * référence. `jsonb_each_text` parcourt les valeurs textuelles de la ligne : la
 * recherche reste valable quel que soit le nom du champ qui porte l'image.
 */
async function releaseImage(publicPath: unknown): Promise<void> {
  if (typeof publicPath !== "string" || publicPath.length === 0) return;

  const [row] = await db
    .select({ value: count() })
    .from(contentItems)
    .where(sql`exists (select 1 from jsonb_each_text(${contentItems.data}) as kv where kv.value = ${publicPath})`);

  if ((row?.value ?? 0) === 0) await deleteImage(publicPath);
}

/** Adresses des images présentes dans la donnée d'un élément. */
function imagePaths(data: Record<string, unknown>): string[] {
  return Object.values(data).filter((value): value is string => typeof value === "string" && value.startsWith("/api/images/"));
}

/** Supprime les images enregistrées pendant une requête qui n'aboutit pas. */
async function discardUploads(paths: string[]): Promise<void> {
  for (const path of paths) await releaseImage(path);
}

/* ------------------------------------------------------------------ */
/* Création et mise à jour                                             */
/* ------------------------------------------------------------------ */

export async function saveItemAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const collection = await resolveCollection(formData);
  if (!collection) return { error: "Collection inconnue." };

  if (!(await isContentSeeded())) return { error: NOT_SEEDED };

  const id = readId(formData);

  // Les fichiers sont écrits avant la validation : celle-ci travaille alors sur
  // le chemin public définitif, comme n'importe quel autre champ texte.
  const { uploaded, errors: uploadErrors } = await resolveImageFields(collection, formData);

  if (Object.keys(uploadErrors).length > 0) {
    await discardUploads(uploaded);
    return { errors: uploadErrors, error: "L’image n’a pas pu être enregistrée." };
  }

  const result = validateItemData(collection, formData);

  if (!result.ok) {
    await discardUploads(uploaded);
    return { errors: result.errors, error: "Corrigez les champs signalés avant d’enregistrer." };
  }

  const def = COLLECTIONS[collection];
  const title = String(result.data[def.titleField] ?? "").slice(0, 80);

  // Image précédente, pour libérer le fichier s'il n'est plus utilisé.
  let replacedImage: string | null = null;

  if (id === null) {
    await db.insert(contentItems).values({
      collection,
      position: await nextPosition(collection),
      published: true,
      data: result.data,
    });
    revalidateSite();
    redirect(`/admin/contenu/${collection}?ok=${encodeURIComponent(`« ${title} » a été ajouté.`)}`);
  }

  const [previous] = await db
    .select({ data: contentItems.data })
    .from(contentItems)
    .where(and(eq(contentItems.id, id), eq(contentItems.collection, collection)))
    .limit(1);

  if (!previous) {
    await discardUploads(uploaded);
    return { error: "Cet élément n’existe plus. Il a peut-être été supprimé." };
  }

  const updated = await db
    .update(contentItems)
    .set({ data: result.data, updatedAt: sql`now()` })
    .where(and(eq(contentItems.id, id), eq(contentItems.collection, collection)))
    .returning({ id: contentItems.id });

  if (updated.length === 0) {
    await discardUploads(uploaded);
    return { error: "L’enregistrement a échoué. Réessayez dans un instant." };
  }

  // Une image remplacée n'est plus référencée par cet élément : on ne la
  // supprime que si aucun autre élément ne l'utilise encore.
  const previousPaths = imagePaths(previous.data);
  const currentPaths = new Set(imagePaths(result.data));
  for (const path of previousPaths) {
    if (!currentPaths.has(path)) replacedImage = path;
  }
  if (replacedImage) await releaseImage(replacedImage);

  revalidateSite();
  redirect(`/admin/contenu/${collection}?ok=${encodeURIComponent(`« ${title} » a été enregistré.`)}`);
}

/* ------------------------------------------------------------------ */
/* Publication, ordre, suppression                                     */
/* ------------------------------------------------------------------ */

export async function togglePublishAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const collection = await resolveCollection(formData);
  const id = readId(formData);
  if (!collection || id === null) redirect("/admin/contenu?error=Requête%20invalide.");

  const [row] = await db
    .select({ published: contentItems.published })
    .from(contentItems)
    .where(and(eq(contentItems.id, id), eq(contentItems.collection, collection)))
    .limit(1);

  if (!row) {
    redirect(`/admin/contenu/${collection}?error=${encodeURIComponent("Cet élément n’existe plus.")}`);
  }

  await db
    .update(contentItems)
    .set({ published: !row.published, updatedAt: sql`now()` })
    .where(eq(contentItems.id, id));

  revalidateSite();
  redirect(
    `/admin/contenu/${collection}?ok=${encodeURIComponent(
      row.published ? "Élément retiré du site public." : "Élément publié sur le site.",
    )}`,
  );
}

/** Déplace un élément d'un cran vers le haut ou vers le bas. */
export async function moveItemAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const collection = await resolveCollection(formData);
  const id = readId(formData);
  const direction = formData.get("direction") === "up" ? -1 : 1;
  if (!collection || id === null) redirect("/admin/contenu?error=Requête%20invalide.");

  const rows = await orderedIds(collection);
  const index = rows.findIndex((row) => row.id === id);
  const target = index + direction;

  if (index === -1 || target < 0 || target >= rows.length) {
    redirect(`/admin/contenu/${collection}?info=${encodeURIComponent("Déjà en première ou dernière position.")}`);
  }

  // Les positions sont réattribuées à partir de l'ordre courant : les doublons
  // hérités d'anciennes données sont ainsi résorbés au passage.
  await db.transaction(async (tx) => {
    const reordered = [...rows];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    for (const [position, row] of reordered.entries()) {
      if (row.position !== position) {
        await tx.update(contentItems).set({ position }).where(eq(contentItems.id, row.id));
      }
    }
  });

  revalidateSite();
  redirect(`/admin/contenu/${collection}`);
}

export async function deleteItemAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const collection = await resolveCollection(formData);
  const id = readId(formData);
  if (!collection || id === null) redirect("/admin/contenu?error=Requête%20invalide.");

  const def = COLLECTIONS[collection];
  const [row] = await db
    .select({ data: contentItems.data })
    .from(contentItems)
    .where(and(eq(contentItems.id, id), eq(contentItems.collection, collection)))
    .limit(1);

  const removed = await db
    .delete(contentItems)
    .where(and(eq(contentItems.id, id), eq(contentItems.collection, collection)))
    .returning({ data: contentItems.data });

  // Les images de l'élément supprimé sont libérées, sauf si un autre élément
  // les utilise encore (le même fichier peut illustrer deux fiches).
  for (const row of removed) {
    for (const path of imagePaths(row.data)) await releaseImage(path);
  }

  revalidateSite();
  const label = row ? String((row.data as Record<string, unknown>)[def.titleField] ?? "L’élément") : "L’élément";
  redirect(
    `/admin/contenu/${collection}?ok=${encodeURIComponent(`« ${label} » a été supprimé définitivement.`)}`,
  );
}

/* ------------------------------------------------------------------ */
/* Import du contenu par défaut                                        */
/* ------------------------------------------------------------------ */

export async function importDefaultsAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const collection = await resolveCollection(formData);
  const report = await seedContent();
  revalidateSite();

  const suffix = collection ? `/admin/contenu/${collection}` : "/admin/contenu";
  redirect(
    `${suffix}?ok=${encodeURIComponent(
      report.done
        ? `Contenu par défaut importé : ${report.items} éléments sont désormais modifiables.`
        : "Le contenu était déjà importé.",
    )}`,
  );
}
