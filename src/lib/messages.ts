import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { messages, MESSAGE_STATUSES, type MessageStatus } from "@/db/schema";

export const PER_PAGE = 20;

export type MessageFilters = {
  q?: string;
  status?: string;
  service?: string;
  page?: number;
};

export const STATUS_LABELS: Record<MessageStatus, string> = {
  nouveau: "Nouveau",
  lu: "Lu",
  traite: "Traité",
  archive: "Archivé",
};

export function isStatus(value: unknown): value is MessageStatus {
  return typeof value === "string" && (MESSAGE_STATUSES as readonly string[]).includes(value);
}

export function isArchiveStatus(value: unknown): boolean {
  return value === "archive";
}

/**
 * Échappe les métacaractères LIKE. Sans cela, un visiteur qui saisit « 100% »
 * dans la recherche élargirait la requête à tous les enregistrements.
 */
function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

function buildWhere(filters: MessageFilters): SQL | undefined {
  const clauses: SQL[] = [];

  const term = filters.q?.trim();
  if (term) {
    const pattern = likePattern(term);
    const match = or(
      ilike(messages.name, pattern),
      ilike(messages.email, pattern),
      ilike(messages.company, pattern),
      ilike(messages.message, pattern),
      ilike(messages.phone, pattern),
    );
    if (match) clauses.push(match);
  }

  if (filters.status && isStatus(filters.status)) {
    clauses.push(eq(messages.status, filters.status));
  } else if (filters.status === "actifs") {
    // Vue par défaut : tout ce qui n'est pas archivé.
    clauses.push(sql`${messages.status} <> 'archive'`);
  }

  const service = filters.service?.trim();
  if (service) clauses.push(eq(messages.service, service));

  if (clauses.length === 0) return undefined;
  return and(...clauses);
}

export type MessageListResult = {
  rows: (typeof messages.$inferSelect)[];
  total: number;
  page: number;
  pageCount: number;
};

export async function listMessages(filters: MessageFilters): Promise<MessageListResult> {
  const where = buildWhere(filters);
  const page = Math.max(1, Math.floor(filters.page ?? 1));

  const [totals] = await db.select({ value: count() }).from(messages).where(where);
  const total = totals?.value ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, pageCount);

  const rows = await db
    .select()
    .from(messages)
    .where(where)
    // Les demandes non traitées remontent d'abord, puis la plus récente.
    .orderBy(sql`case when ${messages.status} = 'nouveau' then 0 else 1 end`, desc(messages.createdAt))
    .limit(PER_PAGE)
    .offset((safePage - 1) * PER_PAGE);

  return { rows, total, page: safePage, pageCount };
}

/** Export sans pagination, plafonné pour ne pas charger toute la table en mémoire. */
export async function listMessagesForExport(filters: MessageFilters, limit = 5000) {
  return db
    .select()
    .from(messages)
    .where(buildWhere(filters))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function getMessage(id: number) {
  const rows = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
  return rows[0] ?? null;
}

export type StatusCounts = Record<MessageStatus, number> & {
  total: number;
  actifs: number;
};

export async function countByStatus(): Promise<StatusCounts> {
  const base = { nouveau: 0, lu: 0, traite: 0, archive: 0, total: 0, actifs: 0 };

  const rows = await db
    .select({ status: messages.status, value: count() })
    .from(messages)
    .groupBy(messages.status);

  for (const row of rows) {
    base.total += row.value;
    if (isStatus(row.status)) base[row.status] = row.value;
    if (!isArchiveStatus(row.status)) base.actifs += row.value;
  }
  return base as StatusCounts;
}

/** Nombre de demandes reçues depuis `days` jours, comparé à la période précédente. */
export async function countRecent(days: number): Promise<{ current: number; previous: number }> {
  const [row] = await db
    .select({
      current: sql<number>`count(*) filter (where ${messages.createdAt} >= now() - ${`${days} days`}::interval)`,
      previous: sql<number>`count(*) filter (where ${messages.createdAt} >= now() - ${`${days * 2} days`}::interval and ${messages.createdAt} < now() - ${`${days} days`}::interval)`,
    })
    .from(messages);

  return { current: Number(row?.current ?? 0), previous: Number(row?.previous ?? 0) };
}

/** Intitulés de service réellement présents en base, pour alimenter le filtre. */
export async function listServiceOptions(): Promise<string[]> {
  const rows = await db
    .select({ service: messages.service })
    .from(messages)
    .groupBy(messages.service)
    .orderBy(asc(messages.service));
  return rows.map((row) => row.service);
}

export type ServiceBreakdown = { service: string; value: number };

export async function serviceBreakdown(limit = 6): Promise<ServiceBreakdown[]> {
  const rows = await db
    .select({ service: messages.service, value: count() })
    .from(messages)
    .groupBy(messages.service)
    .orderBy(desc(count()))
    .limit(limit);
  return rows.map((row) => ({ service: row.service, value: Number(row.value) }));
}
