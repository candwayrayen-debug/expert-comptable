"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { isStatus } from "@/lib/messages";

function readId(formData: FormData): number | null {
  const raw = formData.get("id");
  if (typeof raw !== "string" || raw.length === 0) return null;
  const parsed = Number(raw);
  return Number.isInteger(parsed) ? parsed : null;
}

/**
 * Destination de retour. Restreinte aux chemins internes de l'administration :
 * sans ce contrôle, le paramètre permettrait de rediriger ailleurs (open redirect).
 */
function returnTo(formData: FormData, fallback: string): string {
  const raw = formData.get("returnTo");
  if (typeof raw === "string" && raw.startsWith("/admin") && !raw.startsWith("//")) return raw;
  return fallback;
}

function message(id: number, text: string): string {
  return `/admin/messages/${id}?ok=${encodeURIComponent(text)}`;
}

export async function setStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = readId(formData);
  const status = formData.get("status");
  if (id === null || !isStatus(status)) {
    redirect("/admin/messages?error=Requête%20invalide.");
  }

  await db
    .update(messages)
    .set({
      status,
      // L'horodatage de traitement suit l'état : il est posé au passage à
      // « traité » et effacé si la demande repart en cours de traitement.
      handledAt: status === "traite" ? sql`now()` : null,
    })
    .where(eq(messages.id, id));

  revalidatePath("/admin", "layout");
  redirect(returnTo(formData, message(id, "Statut mis à jour.")));
}

export async function saveNotesAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = readId(formData);
  if (id === null) redirect("/admin/messages?error=Requête%20invalide.");

  const raw = formData.get("notes");
  const notes = typeof raw === "string" ? raw.trim().slice(0, 4000) : "";

  await db.update(messages).set({ notes: notes.length > 0 ? notes : null }).where(eq(messages.id, id));

  revalidatePath("/admin", "layout");
  redirect(returnTo(formData, message(id, "Note interne enregistrée.")));
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = readId(formData);
  if (id === null) redirect("/admin/messages?error=Requête%20invalide.");

  await db.delete(messages).where(eq(messages.id, id));

  revalidatePath("/admin", "layout");
  redirect("/admin/messages?ok=" + encodeURIComponent("La demande a été supprimée définitivement."));
}

/** Passe toutes les demandes non lues à « lu ». */
export async function markAllReadAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const updated = await db
    .update(messages)
    .set({ status: "lu" })
    .where(eq(messages.status, "nouveau"))
    .returning({ id: messages.id });

  revalidatePath("/admin", "layout");

  const target = returnTo(formData, "/admin/messages");
  const separator = target.includes("?") ? "&" : "?";
  redirect(`${target}${separator}ok=${encodeURIComponent(`${updated.length} demande(s) marquée(s) comme lue(s).`)}`);
}
