import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  getUserAlertHistory,
  getUserPreferences,
  updateUserPreferences,
  getUserWebhooks,
  createWebhookIntegration,
  updateWebhookIntegration,
  deleteWebhookIntegration,
} from "../dbAlerts";

export const alertsRouter = router({
  /**
   * Get alert history for the current user
   */
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ ctx, input }) => getUserAlertHistory(ctx.user.id, input.limit)),

  /**
   * Get user preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) =>
    getUserPreferences(ctx.user.id)
  ),

  /**
   * Update user preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        minMultiplier: z.string().optional(),
        enableNotifications: z.number().optional(),
        enableSound: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateUserPreferences(ctx.user.id, input);
      return { success: true };
    }),

  /**
   * Get user's webhook integrations
   */
  getWebhooks: protectedProcedure.query(async ({ ctx }) =>
    getUserWebhooks(ctx.user.id)
  ),

  /**
   * Create a new webhook integration
   */
  createWebhook: protectedProcedure
    .input(
      z.object({
        type: z.enum(["whatsapp", "telegram", "email", "custom"]),
        config: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const webhookId = await createWebhookIntegration({
        userId: ctx.user.id,
        type: input.type,
        config: JSON.stringify(input.config),
        isActive: 1,
      });

      return { id: webhookId };
    }),

  /**
   * Update webhook integration
   */
  updateWebhook: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        isActive: z.number().optional(),
        config: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const webhooks = await getUserWebhooks(ctx.user.id);
      const webhook = webhooks.find((w) => w.id === input.id);

      if (!webhook) {
        throw new Error("Webhook not found");
      }

      const updates: any = {};
      if (input.isActive !== undefined) updates.isActive = input.isActive;
      if (input.config) updates.config = JSON.stringify(input.config);

      await updateWebhookIntegration(input.id, updates);
      return { success: true };
    }),

  /**
   * Delete webhook integration
   */
  deleteWebhook: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const webhooks = await getUserWebhooks(ctx.user.id);
      const webhook = webhooks.find((w) => w.id === input.id);

      if (!webhook) {
        throw new Error("Webhook not found");
      }

      await deleteWebhookIntegration(input.id);
      return { success: true };
    }),
});
