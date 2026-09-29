import { createHash } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ACCEPTED_FORMATS_LABEL,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
  PUBLIC_PREFIX,
  isUploadPath,
} from "@/lib/upload-rules";

/**
 * Gestion des images téléversées depuis l'administration — côté serveur.
 *
 * Le fichier est stocké sous un nom dérivé de son empreinte SHA-256, jamais du
 * nom fourni par le client : un même visuel envoyé deux fois n'occupe qu'un
 * fichier, et un nom comme « ../../etc/passwd » ne peut pas sortir du dossier.
 * Le type réel est vérifié sur les octets d'en-tête, pas sur l'extension ni sur
 * l'en-tête MIME de la requête, tous deux falsifiables.
 */

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export { ACCEPTED_MIME, MAX_UPLOAD_BYTES, PUBLIC_PREFIX, isUploadPath } from "@/lib/upload-rules";

type ImageKind = { ext: "jpg" | "png" | "webp" | "avif"; mime: string };

function startsWith(buffer: Buffer, bytes: number[]): boolean {
  return bytes.every((byte, index) => buffer[index] === byte);
}

/** Identifie le format à partir des octets d'en-tête. */
function sniff(buffer: Buffer): ImageKind | null {
  if (buffer.length < 16) return null;

  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return { ext: "jpg", mime: "image/jpeg" };
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { ext: "png", mime: "image/png" };
  }
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { ext: "webp", mime: "image/webp" };
  }
  if (buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buffer.subarray(8, 12).toString("ascii");
    if (brand === "avif" || brand === "avis") return { ext: "avif", mime: "image/avif" };
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

  const digest = createHash("sha256").update(buffer).digest("hex").slice(0, 20);
  const filename = `${digest}.${kind.ext}`;

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    // `flag: "wx"` échoue si le fichier existe déjà : les doublons ne sont pas
    // réécrits, et deux envois simultanés du même visuel ne se corrompent pas.
    await writeFile(path.join(UPLOAD_DIR, filename), buffer, { flag: "wx" });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "EEXIST") {
      console.error("Écriture de l'image impossible", error);
      return { ok: false, error: "L’image n’a pas pu être enregistrée sur le serveur." };
    }
  }

  return { ok: true, path: `${PUBLIC_PREFIX}${filename}` };
}

/**
 * Supprime un fichier téléversé. Le chemin est reconstruit à partir du dossier
 * d'accueil, jamais concaténé tel quel : un chemin forgé ne peut donc pas
 * désigner un fichier hors de `public/uploads`.
 */
export async function deleteUpload(publicPath: string): Promise<void> {
  if (!isUploadPath(publicPath)) return;

  const target = path.join(UPLOAD_DIR, path.basename(publicPath));

  if (path.dirname(target) !== UPLOAD_DIR) return;

  try {
    await unlink(target);
  } catch (error) {
    // Un fichier déjà absent n'est pas une erreur : l'objectif est atteint.
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Suppression de l'image impossible", error);
    }
  }
}
