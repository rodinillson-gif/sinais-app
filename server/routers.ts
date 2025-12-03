import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createSpreadsheetWithSignals, deleteSpreadsheet, getUserSpreadsheets, getSpreadsheetWithSignals } from "./db";
import { parseExcelFile } from "./excelParser";
import { storagePut } from "./storage";
import { alertsRouter } from "./routers/alertsRouter";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  spreadsheets: router({
    /**
     * List all spreadsheets for the current user
     */
    list: protectedProcedure.query(({ ctx }) =>
      getUserSpreadsheets(ctx.user.id)
    ),

    /**
     * Get a specific spreadsheet with all its signals
     */
    getWithSignals: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const spreadsheet = await getSpreadsheetWithSignals(input.id);
        if (!spreadsheet) {
          throw new Error("Spreadsheet not found");
        }
        // Verify ownership
        if (spreadsheet.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        return spreadsheet;
      }),

    /**
     * Upload and parse an Excel file
     */
    upload: protectedProcedure
      .input(z.object({ file: z.union([z.instanceof(Buffer), z.instanceof(Uint8Array)]), filename: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Convert Uint8Array to Buffer if needed
          const fileBuffer = Buffer.isBuffer(input.file) ? input.file : Buffer.from(input.file);
          
          // Parse Excel file
          const signals = await parseExcelFile(fileBuffer);

          // Upload file to S3
          const fileKey = `spreadsheets/${ctx.user.id}/${Date.now()}-${input.filename}`;
          const { url: fileUrl } = await storagePut(fileKey, fileBuffer, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

          // Create spreadsheet and signals in database
          const spreadsheetId = await createSpreadsheetWithSignals(
            ctx.user.id,
            input.filename,
            fileKey,
            fileUrl,
            signals
          );

          return {
            id: spreadsheetId,
            filename: input.filename,
            rowCount: signals.length,
            createdAt: new Date(),
          };
        } catch (error) {
          throw new Error(`Failed to upload spreadsheet: ${error instanceof Error ? error.message : String(error)}`);
        }
      }),

    /**
     * Delete a spreadsheet and all its signals
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const spreadsheet = await getSpreadsheetWithSignals(input.id);
        if (!spreadsheet) {
          throw new Error("Spreadsheet not found");
        }
        // Verify ownership
        if (spreadsheet.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        await deleteSpreadsheet(input.id);
        return { success: true };
      }),
  }),

  alerts: alertsRouter,
});

export type AppRouter = typeof appRouter;
