/**
 * Règles de téléversement partagées entre le serveur et le navigateur.
 *
 * Ce module ne doit importer aucun module Node (`node:fs`, `node:crypto`,
 * `path`) : il est chargé par des composants client. Les opérations sur les
 * fichiers vivent dans `src/lib/uploads.ts`, réservé au serveur.
 */

export const PUBLIC_PREFIX = "/uploads/";
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** SVG est volontairement exclu : il peut embarquer du script et serait servi
 *  depuis notre propre domaine. */
export const ACCEPTED_MIME = "image/jpeg,image/png,image/webp,image/avif";

export const ACCEPTED_FORMATS_LABEL = "JPEG, PNG, WebP ou AVIF";
export const MAX_UPLOAD_LABEL = "5 Mo";

/** Vérifie qu'un chemin désigne bien une image gérée par le cabinet. */
export function isUploadPath(value: unknown): value is string {
  return typeof value === "string" && /^\/uploads\/[a-f0-9]{20}\.(jpg|png|webp|avif)$/.test(value);
}
