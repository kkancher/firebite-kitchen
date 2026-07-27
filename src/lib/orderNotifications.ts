import { Agent } from "undici";

type OrderLineItem = {
  name: string;
  price: number;
  qty: number;
};

type OrderNotificationInput = {
  orderId: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  totalAmount: number;
  currency: string;
  items: OrderLineItem[];
};

export type ChannelResult = {
  configured: boolean;
  sent: boolean;
  error?: string;
};

export type OrderNotificationResult = {
  email: ChannelResult;
  whatsapp: ChannelResult;
};

let insecureTlsAgent: Agent | null = null;

function getNotificationFetchInit() {
  const allowInsecureTls =
    process.env.RESEND_TLS_INSECURE === "true" ||
    process.env.NOTIFICATIONS_TLS_INSECURE === "true";

  if (!allowInsecureTls) {
    return {} as RequestInit;
  }

  if (!insecureTlsAgent) {
    insecureTlsAgent = new Agent({
      connect: {
        rejectUnauthorized: false,
      },
    });
  }

  return {
    dispatcher: insecureTlsAgent,
  } as RequestInit & { dispatcher: Agent };
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-FR", {
    style: "currency",
    currency,
  }).format(amount);
}

function buildOrderItemsText(items: OrderLineItem[]) {
  return items
    .map((item) => `- ${item.name} x${item.qty} (${formatCurrency(item.price, "EUR")} each)`)
    .join("\n");
}

function formatPhoneForWhatsApp(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("whatsapp:")) {
    return trimmed;
  }

  const normalized = trimmed.replace(/[\s()-]/g, "");
  if (!normalized.startsWith("+")) {
    return "";
  }

  return `whatsapp:${normalized}`;
}

async function sendOrderEmail(input: OrderNotificationInput): Promise<ChannelResult> {
  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.ORDER_FROM_EMAIL || process.env.FROM_EMAIL || "";

  if (!input.customerEmail) {
    return {
      configured: false,
      sent: false,
      error: "Customer email is missing on order payload.",
    };
  }

  if (!apiKey || !from) {
    return {
      configured: false,
      sent: false,
      error: "Email not configured. Set RESEND_API_KEY and ORDER_FROM_EMAIL (or FROM_EMAIL).",
    };
  }

  const itemsText = buildOrderItemsText(input.items);
  const prettyTotal = formatCurrency(input.totalAmount, input.currency);

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1d2432;">
      <h2 style="margin-bottom: 8px;">Order Confirmation</h2>
      <p>Hi ${input.customerName}, your order has been received.</p>
      <p><strong>Order ID:</strong> ${input.orderId}</p>
      <p><strong>Total:</strong> ${prettyTotal}</p>
      <p><strong>Items:</strong></p>
      <pre style="background:#f6f8fb; padding:12px; border-radius:8px;">${itemsText}</pre>
      <p>Thank you for ordering with FireBite Kitchen.</p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.customerEmail],
        subject: `FireBite order ${input.orderId} confirmed`,
        html,
      }),
      ...getNotificationFetchInit(),
    });

    if (!response.ok) {
      const detail = await response.text();
      return {
        configured: true,
        sent: false,
        error: `Email provider error: ${detail || response.statusText}`,
      };
    }

    return { configured: true, sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    if (message.toLowerCase().includes("fetch failed")) {
      return {
        configured: true,
        sent: false,
        error:
          "Cannot reach Resend API from server runtime. Check firewall/proxy/TLS. For local TLS interception, set RESEND_TLS_INSECURE=true and restart.",
      };
    }

    return {
      configured: true,
      sent: false,
      error: message,
    };
  }
}

async function sendOrderWhatsApp(input: OrderNotificationInput): Promise<ChannelResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
  const authToken = process.env.TWILIO_AUTH_TOKEN || "";
  const from = formatPhoneForWhatsApp(process.env.TWILIO_WHATSAPP_FROM || "");
  const to = formatPhoneForWhatsApp(input.customerPhone || "");

  if (!accountSid || !authToken) {
    return {
      configured: false,
      sent: false,
      error:
        "WhatsApp not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_FROM.",
    };
  }

  if (!from) {
    return {
      configured: false,
      sent: false,
      error:
        "TWILIO_WHATSAPP_FROM is invalid. Use WhatsApp format like whatsapp:+14155238886.",
    };
  }

  if (!to) {
    return {
      configured: false,
      sent: false,
      error: "Customer phone must include country code, for example +33...",
    };
  }

  const prettyTotal = formatCurrency(input.totalAmount, input.currency);
  const itemsText = input.items.map((item) => `${item.name} x${item.qty}`).join(", ");
  const message = `FireBite confirmation\nOrder: ${input.orderId}\nTotal: ${prettyTotal}\nItems: ${itemsText}`;

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const body = new URLSearchParams({
      From: from,
      To: to,
      Body: message,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      ...getNotificationFetchInit(),
    });

    if (!response.ok) {
      const detail = await response.text();
      if (detail.includes("\"code\":21910")) {
        return {
          configured: true,
          sent: false,
          error:
            "Twilio channel mismatch (21910). Ensure both From and To are WhatsApp addresses like whatsapp:+14155238886 and whatsapp:+33...",
        };
      }

      if (detail.includes("\"code\":63007")) {
        return {
          configured: true,
          sent: false,
          error:
            "Twilio 63007: From number is not a WhatsApp-enabled Twilio sender. Use sandbox sender (whatsapp:+14155238886) or an approved WhatsApp Business sender in Twilio Console.",
        };
      }

      return {
        configured: true,
        sent: false,
        error: `WhatsApp provider error: ${detail || response.statusText}`,
      };
    }

    return { configured: true, sent: true };
  } catch (error) {
    return {
      configured: true,
      sent: false,
      error: error instanceof Error ? error.message : "Unknown WhatsApp error",
    };
  }
}

export async function sendOrderNotifications(
  input: OrderNotificationInput
): Promise<OrderNotificationResult> {
  const [email, whatsapp] = await Promise.all([
    sendOrderEmail(input),
    sendOrderWhatsApp(input),
  ]);

  return { email, whatsapp };
}
