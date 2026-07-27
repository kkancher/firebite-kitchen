import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { isAdminConfigured, isAdminEmail } from "@/lib/adminAccess";
import { sendOrderNotifications } from "@/lib/orderNotifications";

type OrderPayload = {
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  };
  items?: Array<{
    id: number;
    name: string;
    price: number;
    qty: number;
  }>;
};

const ORDER_STATUSES = [
  "new",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

type OrderUpdatePayload = {
  id?: number;
  status?: OrderStatus;
  deliveryPartner?: string;
  estimatedMinutes?: number | null;
  trackingNote?: string;
};

async function getRequestUserEmail(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    return { email: null, token: "" };
  }

  const supabase = getSupabaseServerClient();
  const { data: userData, error } = await supabase.auth.getUser(token);

  if (error || !userData.user?.email) {
    return { email: null, token };
  }

  return { email: userData.user.email.toLowerCase(), token };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawLimit = Number(searchParams.get("limit") || "30");
  const customerEmail = searchParams.get("customerEmail")?.trim().toLowerCase() || "";
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 200)
    : 30;

  try {
    const supabase = getSupabaseServerClient();
    const { email: requestEmail, token } = await getRequestUserEmail(request);

    let query = supabase
      .from("orders")
      .select(
        "id, order_id, customer_name, customer_phone, customer_email, customer_address, customer_notes, items, total_amount, currency, order_status, delivery_partner, estimated_minutes, tracking_note, delivered_at, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (customerEmail) {
      if (!token) {
        return NextResponse.json(
          { message: "Authentication required to access customer orders." },
          { status: 401 }
        );
      }

      if (!requestEmail) {
        return NextResponse.json(
          { message: "Invalid session for customer order lookup." },
          { status: 401 }
        );
      }

      if (requestEmail !== customerEmail) {
        return NextResponse.json(
          { message: "You can access only your own orders." },
          { status: 403 }
        );
      }

      query = query.eq("customer_email", customerEmail);
    } else {
      if (!token || !requestEmail) {
        return NextResponse.json(
          { message: "Authentication required for admin order access." },
          { status: 401 }
        );
      }

      if (!isAdminConfigured()) {
        return NextResponse.json(
          {
            message:
              "Admin access is not configured. Set ADMIN_EMAILS (comma-separated) or ADMIN_EMAIL in .env.local.",
          },
          { status: 403 }
        );
      }

      if (!isAdminEmail(requestEmail)) {
        return NextResponse.json(
          { message: "You are not allowed to access admin orders." },
          { status: 403 }
        );
      }
    }

    const { data, error } = await query;

    if (error) {
      const isMissingTrackingColumns =
        error.code === "42703" ||
        error.message.toLowerCase().includes("order_status") ||
        error.message.toLowerCase().includes("does not exist");

      if (isMissingTrackingColumns) {
        let legacyQuery = supabase
          .from("orders")
          .select(
            "id, order_id, customer_name, customer_phone, customer_email, customer_address, customer_notes, items, total_amount, currency, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(limit);

        if (customerEmail) {
          legacyQuery = legacyQuery.eq("customer_email", customerEmail);
        }

        const legacy = await legacyQuery;
        if (!legacy.error) {
          const hydrated = (legacy.data || []).map((row) => ({
            ...row,
            order_status: "new",
            delivery_partner: null,
            estimated_minutes: null,
            tracking_note: null,
            delivered_at: null,
            updated_at: null,
          }));

          return NextResponse.json({ orders: hydrated, trackingReady: false });
        }
      }

      const isRlsIssue =
        error.code === "42501" ||
        error.message.toLowerCase().includes("row-level security") ||
        error.message.toLowerCase().includes("permission denied");

      return NextResponse.json(
        {
          message: isRlsIssue
            ? "Reading orders is blocked by Supabase RLS. Set SUPABASE_SERVICE_ROLE_KEY in .env.local for server-side admin reads."
            : "Unable to load submitted orders.",
          detail: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders: data || [], trackingReady: true });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to load submitted orders.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as OrderPayload;

  const supabase = getSupabaseServerClient();
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  let sessionEmail: string | null = null;

  if (token) {
    const { data: userData } = await supabase.auth.getUser(token);
    sessionEmail = userData.user?.email?.toLowerCase() || null;
  }

  const hasCustomer =
    payload.customer?.name?.trim() &&
    payload.customer?.phone?.trim() &&
    payload.customer?.address?.trim();

  const hasItems = Array.isArray(payload.items) && payload.items.length > 0;

  if (!hasCustomer || !hasItems) {
    return NextResponse.json(
      { message: "Please add cart items and fill required details." },
      { status: 400 }
    );
  }

  const orderId = `FB-${Date.now()}`;
  const totalAmount = (payload.items || []).reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  try {
    const { error } = await supabase.from("orders").insert({
      order_id: orderId,
      customer_name: payload.customer?.name,
      customer_phone: payload.customer?.phone,
      customer_email: sessionEmail || payload.customer?.email || null,
      customer_address: payload.customer?.address,
      customer_notes: payload.customer?.notes || null,
      items: payload.items,
      total_amount: totalAmount,
      currency: "EUR",
      order_status: "new",
    });

    if (error) {
      const isMissingTable =
        error.code === "42P01" ||
        error.message.toLowerCase().includes("relation") ||
        error.message.toLowerCase().includes("does not exist");

      const isRlsIssue =
        error.code === "42501" ||
        error.message.toLowerCase().includes("row-level security") ||
        error.message.toLowerCase().includes("permission denied");
      const isSequenceIssue =
        error.message.toLowerCase().includes("orders_id_seq") ||
        error.message.toLowerCase().includes("sequence");
      const isTlsIssue =
        error.details?.toLowerCase().includes("unable to get local issuer certificate") ||
        error.message.toLowerCase().includes("unable to get local issuer certificate");

      return NextResponse.json(
        {
          message: isMissingTable
            ? "Orders table is missing. Run supabase/orders_table.sql in Supabase SQL Editor."
            : isTlsIssue
            ? "Server TLS trust issue while connecting to Supabase. Configure SUPABASE_CA_CERT_PATH or set SUPABASE_TLS_INSECURE=true for local development."
            : isSequenceIssue
            ? "Database sequence permission missing. Re-run supabase/orders_table.sql to grant sequence usage."
            : isRlsIssue
            ? "Order insert blocked by Supabase RLS/policies. Run supabase/orders_table.sql to create policies."
            : "Order could not be saved to database. Verify Supabase table setup.",
          detail: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    const isFetchFailure =
      detail.toLowerCase().includes("fetch failed") ||
      detail.toLowerCase().includes("network");
    const isTlsIssue =
      detail.toLowerCase().includes("unable to get local issuer certificate") ||
      detail.toLowerCase().includes("unable_to_get_issuer_cert_locally");

    return NextResponse.json(
      {
        message: isTlsIssue
          ? "Server TLS trust issue while connecting to Supabase. Configure SUPABASE_CA_CERT_PATH or set SUPABASE_TLS_INSECURE=true for local development."
          : isFetchFailure
          ? "Could not reach Supabase from server. Verify NEXT_PUBLIC_SUPABASE_URL and internet/firewall access."
          : "Supabase is not configured correctly. Set environment variables and table schema.",
        detail,
      },
      { status: 500 }
    );
  }

  const customerEmail = sessionEmail || payload.customer?.email || null;
  const notificationResult = await sendOrderNotifications({
    orderId,
    customerName: payload.customer?.name?.trim() || "Customer",
    customerEmail,
    customerPhone: payload.customer?.phone || null,
    totalAmount,
    currency: "EUR",
    items: payload.items || [],
  });

  const emailFailed = notificationResult.email.configured && !notificationResult.email.sent;
  const whatsappFailed =
    notificationResult.whatsapp.configured && !notificationResult.whatsapp.sent;

  const message =
    emailFailed || whatsappFailed
      ? "Order received. Notification delivery is partially pending."
      : "Order received. Confirmation sent by email and WhatsApp when configured.";

  return NextResponse.json({
    message,
    orderId,
    notifications: notificationResult,
  });
}

export async function PATCH(request: Request) {
  const payload = (await request.json()) as OrderUpdatePayload;

  const { email: requestEmail, token } = await getRequestUserEmail(request);

  if (!token || !requestEmail) {
    return NextResponse.json(
      { message: "Authentication required for admin updates." },
      { status: 401 }
    );
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        message:
          "Admin access is not configured. Set ADMIN_EMAILS (comma-separated) or ADMIN_EMAIL in .env.local.",
      },
      { status: 403 }
    );
  }

  if (!isAdminEmail(requestEmail)) {
    return NextResponse.json(
      { message: "You are not allowed to update orders." },
      { status: 403 }
    );
  }

  if (!payload.id || !Number.isFinite(payload.id)) {
    return NextResponse.json(
      { message: "Order id is required for updates." },
      { status: 400 }
    );
  }

  if (payload.status && !ORDER_STATUSES.includes(payload.status)) {
    return NextResponse.json(
      { message: "Invalid order status." },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.status) {
    updateData.order_status = payload.status;
    updateData.delivered_at =
      payload.status === "delivered" ? new Date().toISOString() : null;
  }

  if (payload.deliveryPartner !== undefined) {
    updateData.delivery_partner = payload.deliveryPartner || null;
  }

  if (payload.estimatedMinutes !== undefined) {
    updateData.estimated_minutes =
      payload.estimatedMinutes === null
        ? null
        : Math.max(0, Math.floor(Number(payload.estimatedMinutes) || 0));
  }

  if (payload.trackingNote !== undefined) {
    updateData.tracking_note = payload.trackingNote || null;
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", payload.id)
      .select(
        "id, order_status, delivery_partner, estimated_minutes, tracking_note, delivered_at, updated_at"
      )
      .single();

    if (error) {
      return NextResponse.json(
        {
          message:
            "Unable to update order. Ensure update permissions are enabled in Supabase policies.",
          detail: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Order updated.", order: data });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to update order status.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
