import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, spreadsheets, signals } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get spreadsheet by ID with all signals
 */
export async function getSpreadsheetWithSignals(spreadsheetId: number) {
  const db = await getDb();
  if (!db) return null;

  const spreadsheet = await db
    .select()
    .from(spreadsheets)
    .where(eq(spreadsheets.id, spreadsheetId))
    .limit(1);

  if (!spreadsheet.length) return null;

  const signalsList = await db
    .select()
    .from(signals)
    .where(eq(signals.spreadsheetId, spreadsheetId))
    .orderBy(desc(signals.data), desc(signals.horario));

  return {
    ...spreadsheet[0],
    signals: signalsList,
  };
}

/**
 * Get all spreadsheets for a user
 */
export async function getUserSpreadsheets(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(spreadsheets)
    .where(eq(spreadsheets.userId, userId))
    .orderBy(desc(spreadsheets.createdAt));
}

/**
 * Create a new spreadsheet and its signals
 */
export async function createSpreadsheetWithSignals(
  userId: number,
  filename: string,
  fileKey: string,
  fileUrl: string,
  signalsData: Array<{ numero: string; data: string; horario: string; idSignal: string }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const spreadsheetResult = await db.insert(spreadsheets).values({
    userId,
    filename,
    fileKey,
    fileUrl,
    rowCount: signalsData.length,
  });

  const spreadsheetId = spreadsheetResult[0]?.insertId || 0;

  if (signalsData.length > 0) {
    const signalsToInsert = signalsData.map((s) => ({
      spreadsheetId,
      numero: s.numero,
      data: s.data,
      horario: s.horario,
      idSignal: s.idSignal,
    }));

    await db.insert(signals).values(signalsToInsert);
  }

  return spreadsheetId;
}

/**
 * Delete spreadsheet and all its signals
 */
export async function deleteSpreadsheet(spreadsheetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Signals will be deleted automatically due to cascade delete
  await db
    .delete(spreadsheets)
    .where(eq(spreadsheets.id, spreadsheetId));
}
