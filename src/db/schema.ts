import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  company: varchar("company", { length: 160 }),
  email: varchar("email", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  service: varchar("service", { length: 100 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
