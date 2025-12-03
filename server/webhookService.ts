import { WebhookIntegration } from "../drizzle/schema";

interface WebhookPayload {
  signal: {
    numero: string;
    horario: string;
    data: string;
    idSignal: string;
  };
  alertTriggeredAt: Date;
  signalTime: Date;
}

/**
 * Send notification via webhook
 */
export async function sendWebhookNotification(
  webhook: WebhookIntegration,
  payload: WebhookPayload
): Promise<boolean> {
  try {
    const config = JSON.parse(webhook.config);

    switch (webhook.type) {
      case "whatsapp":
        return await sendWhatsAppNotification(config, payload);
      case "telegram":
        return await sendTelegramNotification(config, payload);
      case "email":
        return await sendEmailNotification(config, payload);
      case "custom":
        return await sendCustomWebhook(config, payload);
      default:
        return false;
    }
  } catch (error) {
    console.error(`[Webhook] Error sending ${webhook.type} notification:`, error);
    return false;
  }
}

/**
 * Send WhatsApp notification via Twilio or similar service
 */
async function sendWhatsAppNotification(
  config: any,
  payload: WebhookPayload
): Promise<boolean> {
  try {
    const message = formatMessage(payload);
    const phoneNumber = config.phoneNumber;

    if (!phoneNumber) {
      throw new Error("Phone number not configured");
    }

    // Example using a generic webhook endpoint
    // In production, you would use Twilio SDK or similar
    const response = await fetch(config.webhookUrl || "https://api.example.com/whatsapp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey || ""}`,
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: message,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("[Webhook] WhatsApp error:", error);
    return false;
  }
}

/**
 * Send Telegram notification
 */
async function sendTelegramNotification(
  config: any,
  payload: WebhookPayload
): Promise<boolean> {
  try {
    const message = formatMessage(payload);
    const chatId = config.chatId;
    const botToken = config.botToken;

    if (!chatId || !botToken) {
      throw new Error("Chat ID or Bot Token not configured");
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("[Webhook] Telegram error:", error);
    return false;
  }
}

/**
 * Send Email notification
 */
async function sendEmailNotification(
  config: any,
  payload: WebhookPayload
): Promise<boolean> {
  try {
    const email = config.email;
    const apiKey = config.apiKey;
    const provider = config.provider || "sendgrid"; // sendgrid, mailgun, etc

    if (!email || !apiKey) {
      throw new Error("Email or API key not configured");
    }

    const subject = `🔔 Sinal Chegando: ${payload.signal.horario}`;
    const htmlContent = formatEmailHTML(payload);

    if (provider === "sendgrid") {
      return await sendViaMailService(
        "https://api.sendgrid.com/v3/mail/send",
        {
          personalizations: [
            {
              to: [{ email }],
            },
          ],
          from: { email: "noreply@2xwin.app" },
          subject,
          content: [
            {
              type: "text/html",
              value: htmlContent,
            },
          ],
        },
        `Bearer ${apiKey}`
      );
    } else if (provider === "mailgun") {
      return await sendViaMailService(
        `https://api.mailgun.net/v3/${config.domain}/messages`,
        {
          from: "noreply@2xwin.app",
          to: email,
          subject,
          html: htmlContent,
        },
        `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
        "application/x-www-form-urlencoded"
      );
    }

    return false;
  } catch (error) {
    console.error("[Webhook] Email error:", error);
    return false;
  }
}

/**
 * Send custom webhook
 */
async function sendCustomWebhook(
  config: any,
  payload: WebhookPayload
): Promise<boolean> {
  try {
    const webhookUrl = config.url;
    const secret = config.secret;

    if (!webhookUrl) {
      throw new Error("Webhook URL not configured");
    }

    const body = JSON.stringify({
      event: "signal_alert",
      timestamp: new Date().toISOString(),
      signal: payload.signal,
      alertTriggeredAt: payload.alertTriggeredAt.toISOString(),
      signalTime: payload.signalTime.toISOString(),
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (secret) {
      // Add HMAC signature if secret is provided
      const crypto = await import("crypto");
      const signature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");
      headers["X-Webhook-Signature"] = signature;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body,
    });

    return response.ok;
  } catch (error) {
    console.error("[Webhook] Custom webhook error:", error);
    return false;
  }
}

/**
 * Helper to send via mail service
 */
async function sendViaMailService(
  url: string,
  body: any,
  auth: string,
  contentType: string = "application/json"
): Promise<boolean> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      Authorization: auth,
    },
    body: contentType === "application/json" ? JSON.stringify(body) : new URLSearchParams(body).toString(),
  });

  return response.ok;
}

/**
 * Format message for notification
 */
function formatMessage(payload: WebhookPayload): string {
  return `🔔 *Sinal Chegando em 1 Minuto!*\n\n` +
    `📊 Multiplicador: *${payload.signal.numero}x*\n` +
    `⏰ Horário: *${payload.signal.horario}*\n` +
    `📅 Data: *${payload.signal.data}*\n` +
    `🆔 ID: ${payload.signal.idSignal}`;
}

/**
 * Format HTML for email
 */
function formatEmailHTML(payload: WebhookPayload): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #0da271 100%); padding: 20px; border-radius: 8px; color: white; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🔔 Sinal Chegando!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Em 1 minuto você receberá um sinal</p>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <div style="margin-bottom: 15px;">
          <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Multiplicador</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #10b981;">${payload.signal.numero}x</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Horário</p>
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">${payload.signal.horario}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Data</p>
          <p style="margin: 0; font-size: 16px; color: #1f2937;">${payload.signal.data}</p>
        </div>
        
        <div>
          <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">ID</p>
          <p style="margin: 0; font-size: 16px; color: #1f2937;">${payload.signal.idSignal}</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p>Enviado por 2x WIN - Gerador de Sinais</p>
      </div>
    </div>
  `;
}
