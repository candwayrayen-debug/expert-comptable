import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/** Drizzle ne fournit pas de type `bytea` : on le déclare. */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

/** Statuts du cycle de vie d'une demande de contact. */
export const MESSAGE_STATUSES = ["nouveau", "lu", "traite", "archive"] as const;

export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    company: varchar("company", { length: 160 }),
    email: varchar("email", { length: 180 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    service: varchar("service", { length: 100 }).notNull(),
    message: text("message").notNull(),
    status: varchar("status", { length: 20 }).default("nouveau").notNull(),
    notes: text("notes"),
    handledAt: timestamp("handled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("messages_status_idx").on(table.status),
    index("messages_created_at_idx").on(table.createdAt),
    check("messages_status_check", sql`${table.status} in ('nouveau','lu','traite','archive')`),
  ],
);

/**
 * Contenu éditorial du site vitrine, stocké en JSONB derrière une clé de
 * collection. Chaque collection (services, team, plans…) partage la même
 * table : les champs autorisés sont décrits dans `src/lib/content-schema.ts`
 * et validés à l'écriture, ce qui évite de migrer le schéma à chaque ajout
 * de champ tout en gardant des données vérifiées.
 */
export const contentItems = pgTable(
  "content_items",
  {
    id: serial("id").primaryKey(),
    collection: varchar("collection", { length: 40 }).notNull(),
    position: integer("position").default(0).notNull(),
    published: boolean("published").default(true).notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("content_items_collection_idx").on(table.collection, table.position)],
);

/** Réglages scalaires du site (titre du hero, coordonnées, mentions…). */
export const settings = pgTable("settings", {
  key: varchar("key", { length: 60 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Images téléversées depuis l'administration, stockées en base.
 *
 * L'hébergement étant serverless, le disque est en lecture seule et les
 * fichiers écrits à l'exécution ne survivraient pas à un déploiement. La clé
 * est l'empreinte SHA-256 tronquée du contenu : deux envois du même visuel
 * partagent donc une seule ligne, et l'adresse de diffusion peut être mise en
 * cache indéfiniment.
 */
export const images = pgTable("images", {
  key: varchar("key", { length: 40 }).primaryKey(),
  contentType: varchar("content_type", { length: 60 }).notNull(),
  bytes: integer("bytes").notNull(),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type MessageRow = typeof messages.$inferSelect;
export type ImageRow = typeof images.$inferSelect;
export type ContentItemRow = typeof contentItems.$inferSelect;
export type SettingRow = typeof settings.$inferSelect;
