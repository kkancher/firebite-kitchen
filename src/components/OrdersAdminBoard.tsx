"use client";

import { useMemo, useState } from "react";

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

type Draft = {
  status: OrderRecord["order_status"];
  deliveryPartner: string;
  estimatedMinutes: string;
  trackingNote: string;
};

const statusOptions: Array<{ value: OrderRecord["order_status"]; label: string }> = [
  { value: "new", label: "New" },
  { value: "preparing", label: "Preparing" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const statusClass: Record<OrderRecord["order_status"], string> = {
  new: "bg-amber-100 text-amber-800",
  preparing: "bg-blue-100 text-blue-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

function makeDraft(order: OrderRecord): Draft {
  return {
    status: order.order_status,
    deliveryPartner: order.delivery_partner || "",
    estimatedMinutes:
      order.estimated_minutes === null ? "" : String(order.estimated_minutes),
    trackingNote: order.tracking_note || "",
  };
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrdersAdminBoard({
  initialOrders,
  trackingReady,
}: {
  initialOrders: OrderRecord[];
  trackingReady: boolean;
}) {
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderRecord["order_status"]>("all");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [drafts, setDrafts] = useState<Record<number, Draft>>(() => {
    const entries = initialOrders.map((order) => [order.id, makeDraft(order)] as const);
    return Object.fromEntries(entries);
  });

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.order_status !== statusFilter) {
        return false;
      }
      if (!query.trim()) {
        return true;
      }
      const haystack = `${order.order_id} ${order.customer_name} ${order.customer_phone} ${order.customer_email || ""} ${order.customer_address}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });
  }, [orders, query, statusFilter]);

  const totalRevenue = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
    [filteredOrders]
  );

  function updateDraft(orderId: number, patch: Partial<Draft>) {
    setDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        ...patch,
      },
    }));
  }

  async function saveOrder(orderId: number) {
    const draft = drafts[orderId];
    if (!draft) return;

    setSavingId(orderId);
    setNotice("");

    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          status: draft.status,
          deliveryPartner: draft.deliveryPartner.trim(),
          estimatedMinutes:
            draft.estimatedMinutes.trim().length === 0
              ? null
              : Number(draft.estimatedMinutes),
          trackingNote: draft.trackingNote.trim(),
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        detail?: string;
        order?: Partial<OrderRecord>;
      };

      if (!response.ok) {
        setNotice(data.detail ? `${data.message || "Update failed"}: ${data.detail}` : data.message || "Update failed");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                order_status: draft.status,
                delivery_partner: draft.deliveryPartner.trim() || null,
                estimated_minutes:
                  draft.estimatedMinutes.trim().length === 0
                    ? null
                    : Number(draft.estimatedMinutes),
                tracking_note: draft.trackingNote.trim() || null,
                delivered_at: data.order?.delivered_at as string | null,
                updated_at: data.order?.updated_at as string | null,
              }
            : order
        )
      );

      setNotice("Order updated successfully.");
    } catch {
      setNotice("Unable to update order. Please try again.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      {!trackingReady && (
        <section className="surface-panel mt-3.5 p-3.5 sm:p-4.5">
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Tracking columns are not yet in your Supabase table. Orders are visible, but status updates are disabled.
            Run the latest SQL migration from supabase/orders_table.sql, then reload this page.
          </p>
        </section>
      )}

      <section className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="surface-panel p-3.5">
          <p className="text-xs font-bold uppercase tracking-wide text-black/60">Visible Orders</p>
          <p className="brand-font mt-1 text-[2rem] leading-none text-[#6a5132]">{filteredOrders.length}</p>
        </article>
        <article className="surface-panel p-3.5">
          <p className="text-xs font-bold uppercase tracking-wide text-black/60">Visible Revenue</p>
          <div className="mt-1.5 flex items-end gap-1.5">
            <span className="text-[0.82rem] font-extrabold uppercase tracking-[0.18em] text-[#6a5132]/85">EUR</span>
            <span className="brand-font bg-gradient-to-r from-[#1f2a30] to-[#6a5132] bg-clip-text text-[2.15rem] leading-none text-transparent [font-variant-numeric:tabular-nums]">
              {totalRevenue.toFixed(2)}
            </span>
          </div>
        </article>
        <article className="surface-panel p-3.5">
          <p className="text-xs font-bold uppercase tracking-wide text-black/60">Quick Filters</p>
          <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order"
              className="rounded-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | OrderRecord["order_status"])}
              className="rounded-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="all">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </article>
      </section>

      <section className="surface-panel mt-3.5 p-3.5 sm:p-4.5">
        {notice && (
          <p className="mb-3 rounded-lg border border-stone-300 bg-[#f3eadc] px-3 py-2 text-sm text-black/75">
            {notice}
          </p>
        )}

        {filteredOrders.length === 0 && (
          <p className="text-sm text-black/70">No orders match your filters yet.</p>
        )}

        {filteredOrders.length > 0 && (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const draft = drafts[order.id] || makeDraft(order);
              return (
                <article
                  key={order.id}
                  className="rounded-xl border border-stone-200 bg-gradient-to-b from-white to-[#f6eee2]/45 p-3.5 shadow-[0_10px_20px_-16px_rgba(56,44,30,0.28)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[1.15rem] font-semibold leading-tight tracking-tight text-black sm:text-[1.28rem]">
                        {order.order_id}
                      </p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-black/55">
                        Placed {formatWhen(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${statusClass[draft.status]}`}>
                        {draft.status.replaceAll("_", " ")}
                      </span>
                      <div className="mt-1.5 flex items-end gap-1.5 justify-end">
                        <span className="text-[0.74rem] font-extrabold uppercase tracking-[0.14em] text-[#6a5132]/85">
                          {order.currency}
                        </span>
                        <span className="text-[1.45rem] font-black leading-none text-[#6a5132] [font-variant-numeric:tabular-nums]">
                          {Number(order.total_amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 grid grid-cols-1 gap-2 text-sm text-black/75 sm:grid-cols-2">
                    <p><span className="font-bold text-black">Customer:</span> {order.customer_name}</p>
                    <p><span className="font-bold text-black">Phone:</span> {order.customer_phone}</p>
                    <p><span className="font-bold text-black">Email:</span> {order.customer_email || "-"}</p>
                    <p><span className="font-bold text-black">Address:</span> {order.customer_address}</p>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
                    <select
                      value={draft.status}
                      onChange={(e) => updateDraft(order.id, { status: e.target.value as Draft["status"] })}
                      disabled={!trackingReady}
                      className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm"
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <input
                      value={draft.deliveryPartner}
                      onChange={(e) => updateDraft(order.id, { deliveryPartner: e.target.value })}
                      placeholder="Delivery partner"
                      disabled={!trackingReady}
                      className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm"
                    />
                    <input
                      value={draft.estimatedMinutes}
                      onChange={(e) => updateDraft(order.id, { estimatedMinutes: e.target.value })}
                      placeholder="ETA (min)"
                      type="number"
                      min={0}
                      disabled={!trackingReady}
                      className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => void saveOrder(order.id)}
                      disabled={!trackingReady || savingId === order.id}
                      className="rounded-lg bg-gradient-to-r from-[#1f2a30] to-[#3a454d] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8f2e8] disabled:opacity-60"
                    >
                      {savingId === order.id ? "Saving..." : "Save"}
                    </button>
                  </div>

                  <textarea
                    value={draft.trackingNote}
                    onChange={(e) => updateDraft(order.id, { trackingNote: e.target.value })}
                    placeholder="Tracking note (optional)"
                    rows={2}
                    disabled={!trackingReady}
                    className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm"
                  />

                  {order.delivered_at && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                      Delivered {formatWhen(order.delivered_at)}
                    </p>
                  )}

                  <div className="mt-2.5 rounded-lg border border-stone-200 bg-[#f3eadc]/70 p-2.5">
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-black/60">Items</p>
                    <ul className="space-y-1 text-sm text-black/75">
                      {(order.items || []).map((item, idx) => (
                        <li key={`${order.id}-${idx}`}>
                          {item.qty}x {item.name} - EUR {Number(item.price || 0).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
