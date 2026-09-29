import { db } from "@/db";
import { messages } from "@/db/schema";
import { getServiceNames } from "@/lib/content";
import { SERVICES } from "@/lib/services";

/**
 * Liste des services acceptés. Elle provient du contenu éditable pour rester
 * alignée sur le formulaire ; en cas d'indisponibilité de la base, on retombe
 * sur la liste livrée avec le site afin de ne jamais rejeter une demande
 * légitime.
 */
async function allowedServices(): Promise<readonly string[]> {
  try {
    const names = await getServiceNames();
    return names.length > 0 ? names : SERVICES;
  } catch (error) {
    console.error("Lecture des services impossible, repli sur la liste par défaut", error);
    return SERVICES;
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid JSON");
    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "La demande n'a pas pu être lue." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const service = typeof body.service === "string" ? body.service.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  const services = await allowedServices();

  if (name.length < 2 || name.length > 120 ||
      company.length > 160 ||
      email.length > 180 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      phone.length > 40 ||
      !services.includes(service) ||
      message.length < 15 || message.length > 2000 ||
      body.consent !== true) {
    return Response.json({ error: "Vérifiez les informations saisies et votre consentement." }, { status: 400 });
  }

  try {
    await db.insert(messages).values({
      name,
      company: company || null,
      email,
      phone: phone || null,
      service,
      message,
    });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Message creation failed", error);
    return Response.json({ error: "Le service est momentanément indisponible. Réessayez plus tard." }, { status: 500 });
  }
}
