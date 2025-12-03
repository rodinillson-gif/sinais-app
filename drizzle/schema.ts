import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Spreadsheets table - stores uploaded Excel files metadata
 */
export const spreadsheets = mysqlTable("spreadsheets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(), // S3 file key
  fileUrl: text("fileUrl").notNull(), // S3 file URL
  rowCount: int("rowCount").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Spreadsheet = typeof spreadsheets.$inferSelect;
export type InsertSpreadsheet = typeof spreadsheets.$inferInsert;

/**
 * Signals table - stores individual signal data from the spreadsheet
 * Each row from the Excel file becomes a signal entry
 */
export const signals = mysqlTable("signals", {
  id: int("id").autoincrement().primaryKey(),
  spreadsheetId: int("spreadsheetId").notNull().references(() => spreadsheets.id, { onDelete: "cascade" }),
  numero: varchar("numero", { length: 20 }).notNull(), // Numero column from Excel (multiplier)
  data: varchar("data", { length: 10 }).notNull(), // Data column (YYYY-MM-DD)
  horario: varchar("horario", { length: 8 }).notNull(), // Horario column (HH:MM:SS)
  idSignal: varchar("idSignal", { length: 20 }).notNull(), // ID column from Excel
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Signal = typeof signals.$inferSelect;
export type InsertSignal = typeof signals.$inferInsert;

/**
 * Alert History table - stores all alerts that have been triggered
 */
export const alertHistory = mysqlTable("alertHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  signalId: int("signalId").notNull().references(() => signals.id, { onDelete: "cascade" }),
  spreadsheetId: int("spreadsheetId").notNull().references(() => spreadsheets.id, { onDelete: "cascade" }),
  numero: varchar("numero", { length: 20 }).notNull(),
  horario: varchar("horario", { length: 8 }).notNull(),
  alertTriggeredAt: timestamp("alertTriggeredAt").defaultNow().notNull(),
  signalTime: varchar("signalTime", { length: 19 }).notNull(), // YYYY-MM-DD HH:MM:SS
  webhooksSent: int("webhooksSent").default(0).notNull(), // Count of webhooks sent
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AlertHistory = typeof alertHistory.$inferSelect;
export type InsertAlertHistory = typeof alertHistory.$inferInsert;

/**
 * Webhook Integrations table - stores user's webhook configurations
 */
export const webhookIntegrations = mysqlTable("webhookIntegrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["whatsapp", "telegram", "email", "custom"]).notNull(),
  isActive: int("isActive").default(1).notNull(), // 0 = inactive, 1 = active
  config: text("config").notNull(), // JSON string with configuration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WebhookIntegration = typeof webhookIntegrations.$inferSelect;
export type InsertWebhookIntegration = typeof webhookIntegrations.$inferInsert;

/**
 * User Preferences table - stores user's filter and notification preferences
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  minMultiplier: varchar("minMultiplier", { length: 10 }).default("0").notNull(), // Minimum multiplier filter
  enableNotifications: int("enableNotifications").default(1).notNull(), // 0 = disabled, 1 = enabled
  enableSound: int("enableSound").default(1).notNull(), // 0 = disabled, 1 = enabled
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;
