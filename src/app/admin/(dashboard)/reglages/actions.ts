"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { isContentSeeded } from "@/lib/content";
import { SETTINGS, normalizeSetting } from "@/lib/content-schema";
import { seedContent } from "@/lib/seed";
import type { FormState } from "@/lib/form-state";

/**
 * Réglages dont une valeur vide casserait un élément du site (titre vide,
 * lien téléphonique sans numéro…). Les autres peuvent être vidés pour
 * masquer l'élément correspondant.
 */
const REQUIRED_KEYS = new Set([
  "hero_eyebrow",
  "hero_title",
  "hero_description",
  "contact_address",
  "contact_phone",
  "contact_email",
  "contact_hours",
]);

export async function saveSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  if (!(await isContentSeeded())) {
    return {
      error:
        "Le contenu n’est pas encore importé. Utilisez « Importer le contenu par défaut » depuis la page Contenu avant de modifier les réglages.",
    };
  }

  const errors: Record<string, string> = {};
  const updates: { key: string; value: string }[] = [];

  for (const field of SETTINGS) {
    const raw = formData.get(field.key);
    const value = normalizeSetting(field, typeof raw === "string" ? raw : "");

    if (REQUIRED_KEYS.has(field.key) && value.length === 0) {
      errors[field.key] = "Ce champ ne peut pas être vide.";
      continue;
    }
    if (field.maxLength && value.length > field.maxLength) {
      errors[field.key] = `${field.maxLength} caractères maximum.`;
      continue;
    }
    updates.push({ key: field.key, value });
  }

  if (Object.keys(errors).length > 0) {
    return { errors, error: "Corrigez les champs signalés avant d’enregistrer." };
  }

  await db.transaction(async (tx) => {
    for (const update of updates) {
      await tx
        .insert(settings)
        .values({ key: update.key, value: update.value })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: update.value, updatedAt: sql`now()` },
        });
    }
  });

  revalidatePath("/", "layout");
  redirect("/admin/reglages?ok=" + encodeURIComponent("Les réglages ont été enregistrés."));
}

export async function importSettingsAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const report = await seedContent();
  revalidatePath("/", "layout");

  const target = formData.get("from") === "contenu" ? "/admin/contenu" : "/admin/reglages";
  redirect(
    `${target}?ok=${encodeURIComponent(
      report.done
        ? `Contenu et réglages importés (${report.settings} réglages).`
        : "Le contenu était déjà importé.",
    )}`,
  );
}
