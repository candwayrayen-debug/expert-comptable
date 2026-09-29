import { isImageKey } from "@/lib/image-rules";
import { readImage } from "@/lib/image-store";

export const dynamic = "force-dynamic";

/**
 * Diffusion des images de la galerie.
 *
 * Les images vivent en base et ne sont donc pas accessibles comme des fichiers
 * statiques : cette route les sert aux visiteurs et à l'optimiseur d'images de
 * Next.js, qui la sollicite côté serveur.
 *
 * L'en-tête `Cache-Control` est immuable et d'un an : la clé étant l'empreinte
 * du contenu, une même adresse désigne toujours les mêmes octets. Si une image
 * est remplacée, son adresse change — inutile de purger quoi que ce soit.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  if (!isImageKey(key)) {
    return new Response("Image inconnue", { status: 404 });
  }

  try {
    const image = await readImage(key);
    if (!image) return new Response("Image inconnue", { status: 404 });

    return new Response(new Uint8Array(image.data), {
      headers: {
        "Content-Type": image.contentType,
        "Content-Length": String(image.bytes),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Lecture de l'image impossible", error);
    return new Response("Image momentanément indisponible", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
