import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "cbs_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 heures

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;

  const password = process.env.ADMIN_PASSWORD;
  if (password && password.length >= 8) {
    // Repli acceptable en développement : la clé dérive du mot de passe, donc
    // changer le mot de passe invalide les sessions en cours.
    return `derived:${password}`;
  }

  throw new Error(
    "ADMIN_PASSWORD est requis (8 caractères minimum). Copiez .env.example vers .env.local et définissez un mot de passe.",
  );
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

/** Comparaison à temps constant : évite de fuiter le mot de passe par timing. */
function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function isAdminConfigured(): boolean {
  try {
    sessionSecret();
    return true;
  } catch {
    return false;
  }
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

function createToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const separator = token.lastIndexOf(".");
  if (separator === -1) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!safeEqual(signature, sign(payload))) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export async function getAdminSession(): Promise<boolean> {
  // Sans mot de passe configuré, aucune session ne peut être valide : on
  // renvoie `false` au lieu de laisser `sessionSecret()` lever une exception,
  // ce qui transformerait la page de connexion en erreur serveur.
  if (!isAdminConfigured()) return false;

  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

/** À appeler en tête de chaque page et action d'administration. */
export async function requireAdmin(): Promise<void> {
  if (!(await getAdminSession())) redirect("/admin/login");
}

export async function startSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
