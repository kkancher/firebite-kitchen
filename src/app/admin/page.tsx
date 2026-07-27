import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import OrdersAdminBoard from "@/components/OrdersAdminBoard";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type OrderItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

type OrderRecord = {
  id: number;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  customer_notes: string | null;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  order_status: "new" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  delivery_partner: string | null;
  estimated_minutes: number | null;
  tracking_note: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string | null;
};

async function loadOrders() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_id, customer_name, customer_phone, customer_email, customer_address, customer_notes, items, total_amount, currency, order_status, delivery_partner, estimated_minutes, tracking_note, delivered_at, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      const isMissingTrackingColumns =
        error.code === "42703" ||
        error.message.toLowerCase().includes("order_status") ||
        error.message.toLowerCase().includes("does not exist");

      if (isMissingTrackingColumns) {
        const legacy = await supabase
          .from("orders")
          .select(
            "id, order_id, customer_name, customer_phone, customer_email, customer_address, customer_notes, items, total_amount, currency, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(100);

        if (legacy.error) {
          return {
            orders: [] as OrderRecord[],
            error: `Unable to load orders: ${legacy.error.message}`,
            trackingReady: false,
          };
        }

        const hydrated = (legacy.data || []).map((row) => ({
          ...row,
          order_status: "new" as const,
          delivery_partner: null,
          estimated_minutes: null,
          tracking_note: null,
          delivered_at: null,
          updated_at: null,
        })) as OrderRecord[];

        return {
          orders: hydrated,
          error: "",
          trackingReady: false,
        };
      }

      return {
        orders: [] as OrderRecord[],
        error:
          error.code === "42501"
            ? "Reading orders is blocked by Supabase permissions. Add SUPABASE_SERVICE_ROLE_KEY in .env.local for admin reads."
            : `Unable to load orders: ${error.message}`,
        trackingReady: false,
      };
    }

    return {
      orders: (data || []) as OrderRecord[],
      error: "",
      trackingReady: true,
    };
  } catch (error) {
    return {
      orders: [] as OrderRecord[],
      error:
        error instanceof Error
          ? `Unable to load orders: ${error.message}`
          : "Unable to load orders.",
      trackingReady: false,
    };
  }
}

export default async function AdminPage() {
  const { orders, error, trackingReady } = await loadOrders();

  return (
    <>
      <Navbar />
      <main className="site-shell pt-28 pb-7">
        <section className="surface-panel bg-gradient-to-b from-white to-[#f4ecdf] p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2.5">
            <div>
              <p className="eyebrow">Admin</p>
              <h1 className="brand-font text-[2.15rem] leading-tight text-black sm:text-[2.5rem]">
                Order Operations Center
              </h1>
              <p className="section-copy mt-1.5">
                Track order progress, assign delivery, update ETA, and complete delivery lifecycle.
              </p>
            </div>
            <a
              href="/admin"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#1f2a30] to-[#3a454d] px-4 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-[#f9f3e8] shadow-[0_12px_20px_-16px_rgba(21,24,28,0.7)] transition-all hover:-translate-y-0.5"
            >
              Reload Board
            </a>
          </div>
        </section>

        {error ? (
          <section className="surface-panel mt-3.5 p-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          </section>
        ) : (
          <OrdersAdminBoard initialOrders={orders} trackingReady={trackingReady} />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
