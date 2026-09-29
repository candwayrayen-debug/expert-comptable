"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import { seedContent } from "@/lib/seed";

export type LoginState = { error?: string };

/**
 * Limiteur de tentatives en mémoire : le mot de passe est unique et l'espace
 * d'administration est exposé publiquement, une protection minimale contre le
 * bourrage est donc nécessaire. Le compteur est volontairement global — il
 * n'y a qu'un seul compte à protéger.
 */
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 5 * 60 * 1000;

const globalForThrottle = globalThis as typeof globalThis & {
  __cbsAdminAttempts?: { count: number; firstAt: number; blockedUntil: number };
};

globalForThrottle.__cbsAdminAttempts ??= { count: 0, firstAt: 0, blockedUntil: 0 };

function throttleState() {
  return globalForThrottle.__cbsAdminAttempts!;
}

function minutesUntil(until: number): number {
  return Math.max(1, Math.ceil((until - Date.now()) / 60000));
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const state = throttleState();

  if (state.blockedUntil > Date.now()) {
    return {
      error: `Trop de tentatives. Nouvel essai possible dans ${minutesUntil(state.blockedUntil)} minute(s).`,
    };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0) {
    return { error: "Saisissez le mot de passe." };
  }

  if (!checkPassword(password)) {
    const now = Date.now();
    if (now - state.firstAt > WINDOW_MS) {
      state.count = 0;
      state.firstAt = now;
    }
    state.count += 1;
    if (state.count >= MAX_ATTEMPTS) {
      state.blockedUntil = now + WINDOW_MS;
      state.count = 0;
      state.firstAt = now;
      return { error: `Trop de tentatives. Nouvel essai possible dans ${minutesUntil(state.blockedUntil)} minute(s).` };
    }
    return { error: "Mot de passe incorrect." };
  }

  state.count = 0;
  state.blockedUntil = 0;
  await startSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

/**
 * Importe le contenu livré avec le site pour le rendre modifiable. Volontairement
 * non destructif : sans `force`, la fonction ne fait rien si un contenu existe
 * déjà. Le bouton n'est d'ailleurs proposé que lorsque la base est vide.
 */
export async function seedAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const raw = formData.get("collection");
  const collection = typeof raw === "string" && raw.length > 0 ? raw : "";
  const report = await seedContent();

  revalidatePath("/", "layout");

  const target = collection ? `/admin/contenu/${collection}` : "/admin";
  const message = report.done
    ? `Contenu par défaut importé : ${report.items} éléments et ${report.settings} réglages.`
    : "Le contenu était déjà importé, aucune modification n'a été apportée.";
  redirect(`${target}?ok=${encodeURIComponent(message)}`);
}
