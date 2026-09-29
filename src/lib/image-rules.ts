/**
 * Règles de gestion des images, partagées entre le serveur et le navigateur.
 *
 * Ce module ne doit importer aucun module Node (`node:fs`, `node:crypto`,
 * `path`) : il est chargé par des composants client. Les opérations sur les
 * données vivent dans `src/lib/image-store.ts`, réservé au serveur.
 */

/**
 * Les images sont adressées par le contenu : la clé est une empreinte SHA-256
 * tronquée, donc deux envois du même visuel désignent la même ressource.
 */
export const IMAGE_PATH_PREFIX = "/api/images/";
export const IMAGE_KEY_LENGTH = 20;
export const IMAGE_KEY_PATTERN = /^[a-f0-9]{20}$/;

/**
 * 4 Mo, et non 5 : Netlify plafonne le corps des fonctions synchrones à 6 Mo,
 * mais les envois binaires y sont encodés en base64, ce qui ajoute environ
 * 30 % — la limite réelle pour un fichier tourne donc autour de 4,5 Mo. Rester
 * à 4 Mo garantit que c'est bien notre message qui s'affiche, et non une erreur
 * de la plateforme.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** SVG est volontairement exclu : il peut embarquer du script et serait servi
 *  depuis notre propre domaine. */
export const ACCEPTED_MIME = "image/jpeg,image/png,image/webp,image/avif";

export const ACCEPTED_FORMATS_LABEL = "JPEG, PNG, WebP ou AVIF";
export const MAX_UPLOAD_LABEL = "4 Mo";

/** Chemin public d'une image à partir de sa clé. */
export function imagePath(key: string): string {
  return `${IMAGE_PATH_PREFIX}${key}`;
}

export function isImageKey(value: unknown): value is string {
  return typeof value === "string" && IMAGE_KEY_PATTERN.test(value);
}

/** Vérifie qu'un chemin désigne bien une image gérée par le cabinet. */
export function isImagePath(value: unknown): value is string {
  if (typeof value !== "string" || !value.startsWith(IMAGE_PATH_PREFIX)) return false;
  return isImageKey(value.slice(IMAGE_PATH_PREFIX.length));
}

/** Extrait la clé d'un chemin public, ou `null` si le chemin n'est pas valide. */
export function imageKeyFromPath(value: unknown): string | null {
  return isImagePath(value) ? value.slice(IMAGE_PATH_PREFIX.length) : null;
}
