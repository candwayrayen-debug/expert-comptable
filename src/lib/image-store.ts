import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { images } from "@/db/schema";
import {
  ACCEPTED_FORMATS_LABEL,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
  imageKeyFromPath,
  imagePath,
} from "@/lib/image-rules";

/**
 * Stockage des images en base de données — côté serveur.
 *
 * Le choix du stockage en base, plutôt que sur le disque, tient à
 * l'hébergement : les fonctions serverless (Netlify) ont un système de
 * fichiers en lecture seule, et les fichiers écrits à l'exécution n'y
 * survivraient pas d'un déploiement à l'autre. La contrepartie est que les
 * images pèsent sur la base et sur ses sauvegardes.
 *
 * Le type réel du fichier est vérifié sur les octets d'en-tête, pas sur
 * l'extension ni sur l'en-tête MIME de la requête, tous deux falsifiables.
 */

type ImageKind = { mime: string };

function startsWith(buffer: Buffer, bytes: number[]): boolean {
  return bytes.every((byte, index) => buffer[index] === byte);
}

/** Identifie le format à partir des octets d'en-tête. */
function sniff(buffer: Buffer): ImageKind | null {
  if (buffer.length < 16) return null;

  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return { mime: "image/jpeg" };
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: "image/png" };
  }
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { mime: "image/webp" };
  }
  if (buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buffer.subarray(8, 12).toString("ascii");
    if (brand === "avif" || brand === "avis") return { mime: "image/avif" };
  }
  return null;
}

export type SaveResult = { ok: true; path: string } | { ok: false; error: string };

/** Vérifie qu'une valeur de formulaire est bien un fichier téléversé. */
export function isFileLike(value: unknown): value is File {
  if (typeof File !== "undefined" && value instanceof File) return true;
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as File).arrayBuffer === "function" &&
    typeof (value as File).size === "number"
  );
}

export async function saveImage(file: File): Promise<SaveResult> {
  if (file.size === 0) return { ok: false, error: "Le fichier est vide." };

  if (file.size > MAX_UPLOAD_BYTES) {
    const mo = (file.size / 1024 / 1024).toFixed(1).replace(".", ",");
    return { ok: false, error: `Image trop lourde (${mo} Mo). Maximum ${MAX_UPLOAD_LABEL}.` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = sniff(buffer);

  if (!kind) {
    return {
      ok: false,
      error: `Format non reconnu. Utilisez une image ${ACCEPTED_FORMATS_LABEL}.`,
    };
  }

  const key = createHash("sha256").update(buffer).digest("hex").slice(0, 20);

  try {
    // `onConflictDoNothing` rend l'envoi idempotent : renvoyer le même visuel
    // réutilise la ligne existante au lieu de la dupliquer.
    await db
      .insert(images)
      .values({ key, contentType: kind.mime, bytes: buffer.length, data: buffer })
      .onConflictDoNothing({ target: images.key });
  } catch (error) {
    console.error("Enregistrement de l'image impossible", error);
    return { ok: false, error: "L’image n’a pas pu être enregistrée." };
  }

  return { ok: true, path: imagePath(key) };
}

/**
 * Supprime une image. L'appelant doit avoir vérifié qu'aucun contenu ne la
 * référence plus : le même visuel peut illustrer plusieurs fiches.
 */
export async function deleteImage(publicPath: unknown): Promise<void> {
  const key = imageKeyFromPath(publicPath);
  if (!key) return;

  try {
    await db.delete(images).where(eq(images.key, key));
  } catch (error) {
    console.error("Suppression de l'image impossible", error);
  }
}

/** Lit une image pour la servir. Seule la route de diffusion appelle ceci. */
export async function readImage(
  key: string,
): Promise<{ data: Buffer; contentType: string; bytes: number } | null> {
  const [row] = await db
    .select({ data: images.data, contentType: images.contentType, bytes: images.bytes })
    .from(images)
    .where(eq(images.key, key))
    .limit(1);

  return row ?? null;
}
