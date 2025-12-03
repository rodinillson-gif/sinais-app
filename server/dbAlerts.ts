import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { alertHistory, userPreferences, webhookIntegrations, InsertAlertHistory, InsertUserPreferences, InsertWebhookIntegration } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Record an alert in the history
 */
export async function recordAlert(data: InsertAlertHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(alertHistory).values(data);
}

/**
 * Get alert history for a user
 */
export async function getUserAlertHistory(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(alertHistory)
    .where(eq(alertHistory.userId, userId))
    .orderBy((t) => t.alertTriggeredAt)
    .limit(limit);
}

/**
 * Get or create user preferences
 */
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const prefs = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  if (prefs.length > 0) {
    return prefs[0];
  }

  // Create default preferences
  await db.insert(userPreferences).values({
    userId,
    minMultiplier: "0",
    enableNotifications: 1,
    enableSound: 1,
  });

  return {
    userId,
    minMultiplier: "0",
    enableNotifications: 1,
    enableSound: 1,
  };
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(userId: number, updates: Partial<Omit<InsertUserPreferences, 'userId'>>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateSet: Record<string, any> = {};
  if (updates.minMultiplier !== undefined) updateSet.minMultiplier = updates.minMultiplier;
  if (updates.enableNotifications !== undefined) updateSet.enableNotifications = updates.enableNotifications;
  if (updates.enableSound !== undefined) updateSet.enableSound = updates.enableSound;

  await db
    .update(userPreferences)
    .set(updateSet)
    .where(eq(userPreferences.userId, userId));
}

/**
 * Get user's webhook integrations
 */
export async function getUserWebhooks(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(webhookIntegrations)
    .where(eq(webhookIntegrations.userId, userId));
}

/**
 * Create a webhook integration
 */
export async function createWebhookIntegration(data: InsertWebhookIntegration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(webhookIntegrations).values(data);
  return result[0]?.insertId || 0;
}

/**
 * Update webhook integration
 */
export async function updateWebhookIntegration(id: number, updates: Partial<Omit<InsertWebhookIntegration, 'userId'>>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateSet: Record<string, any> = {};
  if (updates.isActive !== undefined) updateSet.isActive = updates.isActive;
  if (updates.config !== undefined) updateSet.config = updates.config;

  await db
    .update(webhookIntegrations)
    .set(updateSet)
    .where(eq(webhookIntegrations.id, id));
}

/**
 * Delete webhook integration
 */
export async function deleteWebhookIntegration(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(webhookIntegrations)
    .where(eq(webhookIntegrations.id, id));
}
