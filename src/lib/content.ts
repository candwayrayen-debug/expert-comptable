import { asc, count, eq, sql } from "drizzle-orm";
import type { LucideIcon } from "lucide-react";
import { db } from "@/db";
import { contentItems, settings } from "@/db/schema";
import { DEFAULT_CONTENT } from "@/lib/content-defaults";
import {
  COLLECTION_KEYS,
  SETTINGS,
  type CollectionKey,
  type CollectionDef,
  COLLECTIONS,
} from "@/lib/content-schema";
import { resolveIcon } from "@/lib/icons";

/** Clé de réglage marquant que le contenu a déjà été importé en base. */
const SEED_MARKER = "content_seeded";

export type ContentRow = {
  id: number;
  data: Record<string, unknown>;
  position: number;
  published: boolean;
};

/* ------------------------------------------------------------------ */
/* Helpers de coercion                                                 */
/* ------------------------------------------------------------------ */

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function strList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function bool(value: unknown): boolean {
  return value === true;
}

/* ------------------------------------------------------------------ */
/* Lecture du contenu                                                  */
/* ------------------------------------------------------------------ */

export async function isContentSeeded(): Promise<boolean> {
  try {
    const rows = await db
      .select({ key: settings.key })
      .from(settings)
      .where(eq(settings.key, SEED_MARKER))
      .limit(1);
    return rows.length > 0;
  } catch {
    return false;
  }
}

/** Repli : le contenu livré avec le site, présenté comme des lignes éditables. */
function defaultRows(collection: CollectionKey, publishedOnly: boolean): ContentRow[] {
  return DEFAULT_CONTENT[collection]
    .map((data, index) => ({
      id: -(index + 1),
      data,
      position: index,
      published: true,
    }))
    .filter((row) => (publishedOnly ? row.published : true));
}

/**
 * Lit une collection. En l'absence de base initialisée, retombe sur le
 * contenu par défaut : la page d'accueil ne peut donc jamais s'afficher vide
 * ni faire échouer un build pour cause de base indisponible.
 */
export async function readCollection(
  collection: CollectionKey,
  options: { publishedOnly?: boolean } = {},
): Promise<ContentRow[]> {
  const publishedOnly = options.publishedOnly ?? true;

  if (!(await isContentSeeded())) return defaultRows(collection, publishedOnly);

  try {
    const rows = await db
      .select({
        id: contentItems.id,
        data: contentItems.data,
        position: contentItems.position,
        published: contentItems.published,
      })
      .from(contentItems)
      .where(
        publishedOnly
          ? sql`${contentItems.collection} = ${collection} and ${contentItems.published} = true`
          : eq(contentItems.collection, collection),
      )
      .orderBy(asc(contentItems.position), asc(contentItems.id));

    return rows;
  } catch (error) {
    console.error(`Lecture du contenu « ${collection} » impossible`, error);
    return defaultRows(collection, publishedOnly);
  }
}

export async function readAllCollections(): Promise<Record<CollectionKey, ContentRow[]>> {
  if (!(await isContentSeeded())) {
    return Object.fromEntries(
      COLLECTION_KEYS.map((key) => [key, defaultRows(key, false)]),
    ) as Record<CollectionKey, ContentRow[]>;
  }

  const entries = await Promise.all(
    COLLECTION_KEYS.map(async (key) => [key, await readCollection(key, { publishedOnly: false })] as const),
  );
  return Object.fromEntries(entries) as Record<CollectionKey, ContentRow[]>;
}

/* ------------------------------------------------------------------ */
/* Réglages                                                            */
/* ------------------------------------------------------------------ */

export type SiteSettings = Record<string, string>;

const DEFAULT_SETTINGS: SiteSettings = Object.fromEntries(
  SETTINGS.map((field) => [field.key, field.fallback]),
);

export async function readSettings(): Promise<SiteSettings> {
  const merged = { ...DEFAULT_SETTINGS };
  try {
    const rows = await db.select({ key: settings.key, value: settings.value }).from(settings);
    for (const row of rows) {
      // Le repli ne s'applique qu'aux clés absentes de la base. Une clé
      // présente mais vide est un choix explicite de l'administrateur :
      // on la respecte, et le site omet simplement l'élément concerné.
      if (row.key in DEFAULT_SETTINGS) merged[row.key] = row.value;
    }
  } catch (error) {
    console.error("Lecture des réglages impossible", error);
  }
  return merged;
}

/** Un réglage de type liste est stocké multiligne, restitué ici en tableau. */
export function readSettingList(all: SiteSettings, key: string): string[] {
  return (all[key] ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Vues typées consommées par la page d'accueil                        */
/* ------------------------------------------------------------------ */

export type ServiceCard = { id: number; icon: LucideIcon; iconName: string; title: string; text: string; points: string[] };
export type ValueCard = { id: number; icon: LucideIcon; title: string; text: string };
export type TeamMember = { id: number; initials: string; color: string; name: string; role: string; bio: string };
export type Step = { id: number; num: string; title: string; text: string };
export type Stat = { id: number; value: string; label: string };
export type Plan = { id: number; name: string; price: string | null; desc: string; features: string[]; featured: boolean };
export type Testimonial = { id: number; quote: string; name: string; company: string };
export type Faq = { id: number; q: string; a: string };
export type GalleryImage = { id: number; src: string; caption: string; alt: string };

export async function getServices(): Promise<ServiceCard[]> {
  const rows = await readCollection("services");
  return rows.map((row) => ({
    id: row.id,
    iconName: str(row.data.icon, "BookOpenCheck"),
    icon: resolveIcon(row.data.icon, "BookOpenCheck"),
    title: str(row.data.title, "Expertise"),
    text: str(row.data.text),
    points: strList(row.data.points),
  }));
}

export async function getValues(): Promise<ValueCard[]> {
  const rows = await readCollection("values");
  return rows.map((row) => ({
    id: row.id,
    icon: resolveIcon(row.data.icon),
    title: str(row.data.title),
    text: str(row.data.text),
  }));
}

export async function getTeam(): Promise<TeamMember[]> {
  const rows = await readCollection("team");
  return rows.map((row) => ({
    id: row.id,
    initials: str(row.data.initials, "—").slice(0, 3),
    color: str(row.data.color, "#dde9d9"),
    name: str(row.data.name),
    role: str(row.data.role),
    bio: str(row.data.bio),
  }));
}

export async function getSteps(): Promise<Step[]> {
  const rows = await readCollection("steps");
  return rows.map((row) => ({
    id: row.id,
    num: str(row.data.num, "01"),
    title: str(row.data.title),
    text: str(row.data.text),
  }));
}

export async function getPlans(): Promise<Plan[]> {
  const rows = await readCollection("plans");
  return rows.map((row) => ({
    id: row.id,
    name: str(row.data.name),
    // Une chaîne vide en base signifie « Sur devis » : on la convertit en null.
    price: str(row.data.price) || null,
    desc: str(row.data.desc),
    features: strList(row.data.features),
    featured: bool(row.data.featured),
  }));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const rows = await readCollection("testimonials");
  return rows.map((row) => ({
    id: row.id,
    quote: str(row.data.quote),
    name: str(row.data.name),
    company: str(row.data.company),
  }));
}

export async function getStats(): Promise<Stat[]> {
  const rows = await readCollection("stats");
  return rows.map((row) => ({
    id: row.id,
    value: str(row.data.value),
    label: str(row.data.label),
  }));
}

export async function getGallery(): Promise<GalleryImage[]> {
  const rows = await readCollection("gallery");
  return rows
    .map((row) => ({
      id: row.id,
      src: str(row.data.src),
      caption: str(row.data.caption),
      // À défaut de description dédiée, la légende fait un alt acceptable :
      // mieux vaut cela qu'un attribut vide, qui fait ignorer l'image par les
      // lecteurs d'écran sans rien dire de son contenu.
      alt: str(row.data.alt) || str(row.data.caption),
    }))
    .filter((image) => image.src.length > 0);
}

export async function getFaqs(): Promise<Faq[]> {
  const rows = await readCollection("faqs");
  return rows.map((row) => ({
    id: row.id,
    q: str(row.data.q),
    a: str(row.data.a),
  }));
}

/**
 * Intitulés proposés dans le formulaire de contact. Toujours complétés par
 * « Autre demande » : un visiteur dont le besoin sort du catalogue doit
 * pouvoir écrire au cabinet.
 */
export async function getServiceNames(): Promise<string[]> {
  const services = await getServices();
  const names = services.map((service) => service.title).filter(Boolean);
  if (!names.includes("Autre demande")) names.push("Autre demande");
  return names;
}

export function collectionDef(key: CollectionKey): CollectionDef {
  return COLLECTIONS[key];
}

export { telHref } from "@/lib/format";

/** Nombre d'éléments par collection, pour la navigation de l'administration. */
export async function countByCollection(): Promise<Record<CollectionKey, { total: number; published: number }>> {
  const base = Object.fromEntries(
    COLLECTION_KEYS.map((key) => [key, { total: 0, published: 0 }]),
  ) as Record<CollectionKey, { total: number; published: number }>;

  if (!(await isContentSeeded())) {
    for (const key of COLLECTION_KEYS) {
      base[key] = { total: DEFAULT_CONTENT[key].length, published: DEFAULT_CONTENT[key].length };
    }
    return base;
  }

  try {
    const rows = await db
      .select({
        collection: contentItems.collection,
        total: count(),
        published: sql<number>`count(*) filter (where ${contentItems.published} = true)`,
      })
      .from(contentItems)
      .groupBy(contentItems.collection);

    for (const row of rows) {
      if (row.collection in base) {
        const key = row.collection as CollectionKey;
        base[key] = { total: Number(row.total), published: Number(row.published) };
      }
    }
  } catch (error) {
    console.error("Comptage du contenu impossible", error);
  }

  return base;
}

