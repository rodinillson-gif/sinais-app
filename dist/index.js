// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var spreadsheets = mysqlTable("spreadsheets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  // S3 file key
  fileUrl: text("fileUrl").notNull(),
  // S3 file URL
  rowCount: int("rowCount").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var signals = mysqlTable("signals", {
  id: int("id").autoincrement().primaryKey(),
  spreadsheetId: int("spreadsheetId").notNull().references(() => spreadsheets.id, { onDelete: "cascade" }),
  numero: varchar("numero", { length: 20 }).notNull(),
  // Numero column from Excel (multiplier)
  data: varchar("data", { length: 10 }).notNull(),
  // Data column (YYYY-MM-DD)
  horario: varchar("horario", { length: 8 }).notNull(),
  // Horario column (HH:MM:SS)
  idSignal: varchar("idSignal", { length: 20 }).notNull(),
  // ID column from Excel
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var alertHistory = mysqlTable("alertHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  signalId: int("signalId").notNull().references(() => signals.id, { onDelete: "cascade" }),
  spreadsheetId: int("spreadsheetId").notNull().references(() => spreadsheets.id, { onDelete: "cascade" }),
  numero: varchar("numero", { length: 20 }).notNull(),
  horario: varchar("horario", { length: 8 }).notNull(),
  alertTriggeredAt: timestamp("alertTriggeredAt").defaultNow().notNull(),
  signalTime: varchar("signalTime", { length: 19 }).notNull(),
  // YYYY-MM-DD HH:MM:SS
  webhooksSent: int("webhooksSent").default(0).notNull(),
  // Count of webhooks sent
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var webhookIntegrations = mysqlTable("webhookIntegrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["whatsapp", "telegram", "email", "custom"]).notNull(),
  isActive: int("isActive").default(1).notNull(),
  // 0 = inactive, 1 = active
  config: text("config").notNull(),
  // JSON string with configuration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  minMultiplier: varchar("minMultiplier", { length: 10 }).default("0").notNull(),
  // Minimum multiplier filter
  enableNotifications: int("enableNotifications").default(1).notNull(),
  // 0 = disabled, 1 = enabled
  enableSound: int("enableSound").default(1).notNull(),
  // 0 = disabled, 1 = enabled
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getSpreadsheetWithSignals(spreadsheetId) {
  const db = await getDb();
  if (!db) return null;
  const spreadsheet = await db.select().from(spreadsheets).where(eq(spreadsheets.id, spreadsheetId)).limit(1);
  if (!spreadsheet.length) return null;
  const signalsList = await db.select().from(signals).where(eq(signals.spreadsheetId, spreadsheetId)).orderBy(desc(signals.data), desc(signals.horario));
  return {
    ...spreadsheet[0],
    signals: signalsList
  };
}
async function getUserSpreadsheets(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(spreadsheets).where(eq(spreadsheets.userId, userId)).orderBy(desc(spreadsheets.createdAt));
}
async function createSpreadsheetWithSignals(userId, filename, fileKey, fileUrl, signalsData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const spreadsheetResult = await db.insert(spreadsheets).values({
    userId,
    filename,
    fileKey,
    fileUrl,
    rowCount: signalsData.length
  });
  const spreadsheetId = spreadsheetResult[0]?.insertId || 0;
  if (signalsData.length > 0) {
    const signalsToInsert = signalsData.map((s) => ({
      spreadsheetId,
      numero: s.numero,
      data: s.data,
      horario: s.horario,
      idSignal: s.idSignal
    }));
    await db.insert(signals).values(signalsToInsert);
  }
  return spreadsheetId;
}
async function deleteSpreadsheet(spreadsheetId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(spreadsheets).where(eq(spreadsheets.id, spreadsheetId));
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z3 } from "zod";

// server/excelParser.ts
import * as XLSX from "xlsx";
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
async function parseExcelFile(fileBuffer) {
  try {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("No sheets found in Excel file");
    }
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1
      // Get raw arrays
    });
    if (data.length < 2) {
      throw new Error("Excel file must have headers and at least one data row");
    }
    const headers = data[0];
    const numeroIndex = headers.findIndex((h) => removeAccents(h?.toString().toLowerCase()) === "numero");
    const dataIndex = headers.findIndex((h) => removeAccents(h?.toString().toLowerCase()) === "data");
    const horarioIndex = headers.findIndex((h) => removeAccents(h?.toString().toLowerCase()) === "horario");
    const idIndex = headers.findIndex((h) => removeAccents(h?.toString().toLowerCase()) === "id");
    if (numeroIndex === -1 || dataIndex === -1 || horarioIndex === -1 || idIndex === -1) {
      throw new Error(
        "Excel file must have columns: Numero, Data, Horario, ID"
      );
    }
    const signals2 = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const numero = row[numeroIndex];
      const dataValue = row[dataIndex];
      const horario = row[horarioIndex]?.toString().trim();
      const id = row[idIndex]?.toString().trim();
      if (!numero || !dataValue || !horario || !id) continue;
      const numeroStr = typeof numero === "number" ? numero.toFixed(2) : numero.toString().trim();
      let formattedDate;
      if (dataValue instanceof Date) {
        formattedDate = dataValue.toISOString().split("T")[0];
      } else if (typeof dataValue === "number") {
        const excelDate = new Date((dataValue - 25569) * 86400 * 1e3);
        formattedDate = excelDate.toISOString().split("T")[0];
      } else {
        formattedDate = dataValue.toString().trim();
      }
      signals2.push({
        numero: numeroStr,
        data: formattedDate,
        horario,
        idSignal: id
      });
    }
    if (signals2.length === 0) {
      throw new Error("No valid signal data found in Excel file");
    }
    return signals2;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// server/storage.ts
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/routers/alertsRouter.ts
import { z as z2 } from "zod";

// server/dbAlerts.ts
import { eq as eq2 } from "drizzle-orm";
import { drizzle as drizzle2 } from "drizzle-orm/mysql2";
var _db2 = null;
async function getDb2() {
  if (!_db2 && process.env.DATABASE_URL) {
    try {
      _db2 = drizzle2(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db2 = null;
    }
  }
  return _db2;
}
async function getUserAlertHistory(userId, limit = 100) {
  const db = await getDb2();
  if (!db) return [];
  return db.select().from(alertHistory).where(eq2(alertHistory.userId, userId)).orderBy((t2) => t2.alertTriggeredAt).limit(limit);
}
async function getUserPreferences(userId) {
  const db = await getDb2();
  if (!db) return null;
  const prefs = await db.select().from(userPreferences).where(eq2(userPreferences.userId, userId)).limit(1);
  if (prefs.length > 0) {
    return prefs[0];
  }
  await db.insert(userPreferences).values({
    userId,
    minMultiplier: "0",
    enableNotifications: 1,
    enableSound: 1
  });
  return {
    userId,
    minMultiplier: "0",
    enableNotifications: 1,
    enableSound: 1
  };
}
async function updateUserPreferences(userId, updates) {
  const db = await getDb2();
  if (!db) throw new Error("Database not available");
  const updateSet = {};
  if (updates.minMultiplier !== void 0) updateSet.minMultiplier = updates.minMultiplier;
  if (updates.enableNotifications !== void 0) updateSet.enableNotifications = updates.enableNotifications;
  if (updates.enableSound !== void 0) updateSet.enableSound = updates.enableSound;
  await db.update(userPreferences).set(updateSet).where(eq2(userPreferences.userId, userId));
}
async function getUserWebhooks(userId) {
  const db = await getDb2();
  if (!db) return [];
  return db.select().from(webhookIntegrations).where(eq2(webhookIntegrations.userId, userId));
}
async function createWebhookIntegration(data) {
  const db = await getDb2();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(webhookIntegrations).values(data);
  return result[0]?.insertId || 0;
}
async function updateWebhookIntegration(id, updates) {
  const db = await getDb2();
  if (!db) throw new Error("Database not available");
  const updateSet = {};
  if (updates.isActive !== void 0) updateSet.isActive = updates.isActive;
  if (updates.config !== void 0) updateSet.config = updates.config;
  await db.update(webhookIntegrations).set(updateSet).where(eq2(webhookIntegrations.id, id));
}
async function deleteWebhookIntegration(id) {
  const db = await getDb2();
  if (!db) throw new Error("Database not available");
  await db.delete(webhookIntegrations).where(eq2(webhookIntegrations.id, id));
}

// server/routers/alertsRouter.ts
var alertsRouter = router({
  /**
   * Get alert history for the current user
   */
  getHistory: protectedProcedure.input(z2.object({ limit: z2.number().default(100) })).query(async ({ ctx, input }) => getUserAlertHistory(ctx.user.id, input.limit)),
  /**
   * Get user preferences
   */
  getPreferences: protectedProcedure.query(
    async ({ ctx }) => getUserPreferences(ctx.user.id)
  ),
  /**
   * Update user preferences
   */
  updatePreferences: protectedProcedure.input(
    z2.object({
      minMultiplier: z2.string().optional(),
      enableNotifications: z2.number().optional(),
      enableSound: z2.number().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    await updateUserPreferences(ctx.user.id, input);
    return { success: true };
  }),
  /**
   * Get user's webhook integrations
   */
  getWebhooks: protectedProcedure.query(
    async ({ ctx }) => getUserWebhooks(ctx.user.id)
  ),
  /**
   * Create a new webhook integration
   */
  createWebhook: protectedProcedure.input(
    z2.object({
      type: z2.enum(["whatsapp", "telegram", "email", "custom"]),
      config: z2.record(z2.string(), z2.any())
    })
  ).mutation(async ({ ctx, input }) => {
    const webhookId = await createWebhookIntegration({
      userId: ctx.user.id,
      type: input.type,
      config: JSON.stringify(input.config),
      isActive: 1
    });
    return { id: webhookId };
  }),
  /**
   * Update webhook integration
   */
  updateWebhook: protectedProcedure.input(
    z2.object({
      id: z2.number(),
      isActive: z2.number().optional(),
      config: z2.record(z2.string(), z2.any()).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const webhooks = await getUserWebhooks(ctx.user.id);
    const webhook = webhooks.find((w) => w.id === input.id);
    if (!webhook) {
      throw new Error("Webhook not found");
    }
    const updates = {};
    if (input.isActive !== void 0) updates.isActive = input.isActive;
    if (input.config) updates.config = JSON.stringify(input.config);
    await updateWebhookIntegration(input.id, updates);
    return { success: true };
  }),
  /**
   * Delete webhook integration
   */
  deleteWebhook: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
    const webhooks = await getUserWebhooks(ctx.user.id);
    const webhook = webhooks.find((w) => w.id === input.id);
    if (!webhook) {
      throw new Error("Webhook not found");
    }
    await deleteWebhookIntegration(input.id);
    return { success: true };
  })
});

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  spreadsheets: router({
    /**
     * List all spreadsheets for the current user
     */
    list: protectedProcedure.query(
      ({ ctx }) => getUserSpreadsheets(ctx.user.id)
    ),
    /**
     * Get a specific spreadsheet with all its signals
     */
    getWithSignals: protectedProcedure.input(z3.object({ id: z3.number() })).query(async ({ input, ctx }) => {
      const spreadsheet = await getSpreadsheetWithSignals(input.id);
      if (!spreadsheet) {
        throw new Error("Spreadsheet not found");
      }
      if (spreadsheet.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      return spreadsheet;
    }),
    /**
     * Upload and parse an Excel file
     */
    upload: protectedProcedure.input(z3.object({ file: z3.union([z3.instanceof(Buffer), z3.instanceof(Uint8Array)]), filename: z3.string() })).mutation(async ({ input, ctx }) => {
      try {
        const fileBuffer = Buffer.isBuffer(input.file) ? input.file : Buffer.from(input.file);
        const signals2 = await parseExcelFile(fileBuffer);
        const fileKey = `spreadsheets/${ctx.user.id}/${Date.now()}-${input.filename}`;
        const { url: fileUrl } = await storagePut(fileKey, fileBuffer, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        const spreadsheetId = await createSpreadsheetWithSignals(
          ctx.user.id,
          input.filename,
          fileKey,
          fileUrl,
          signals2
        );
        return {
          id: spreadsheetId,
          filename: input.filename,
          rowCount: signals2.length,
          createdAt: /* @__PURE__ */ new Date()
        };
      } catch (error) {
        throw new Error(`Failed to upload spreadsheet: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
    /**
     * Delete a spreadsheet and all its signals
     */
    delete: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input, ctx }) => {
      const spreadsheet = await getSpreadsheetWithSignals(input.id);
      if (!spreadsheet) {
        throw new Error("Spreadsheet not found");
      }
      if (spreadsheet.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      await deleteSpreadsheet(input.id);
      return { success: true };
    })
  }),
  alerts: alertsRouter
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
