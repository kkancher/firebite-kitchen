"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useLanguage } from "@/lib/language";

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
};

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const statusClass: Record<OrderRecord["order_status"], string> = {
  new: "bg-amber-100 text-amber-800",
  preparing: "bg-blue-100 text-blue-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const { language, text } = useLanguage();
  const isFr = language === "fr";
  const { user, isAuthenticated } = useSupabaseUser();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMyOrders() {
      if (!isAuthenticated || !user?.email) {
        setOrders([]);
        setMessage("");
        return;
      }

      setLoading(true);
      setMessage("");

      const token = (await supabaseBrowser.auth.getSession()).data.session?.access_token;
      const response = await fetch(
        `/api/orders?limit=100&customerEmail=${encodeURIComponent(user.email.toLowerCase())}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        }
      );

      const data = (await response.json()) as {
        orders?: OrderRecord[];
        message?: string;
        detail?: string;
      };

      if (!response.ok) {
        setOrders([]);
        setMessage(data.detail ? `${data.message || "Unable to load orders."} (${data.detail})` : data.message || "Unable to load orders.");
        setLoading(false);
        return;
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setLoading(false);
    }

    void loadMyOrders();
  }, [isAuthenticated, user?.email]);

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
    [orders]
  );

  return (
    <>
      <Navbar />
      <main className="site-shell pt-28 pb-7">
        <section className="surface-panel section-graphics fade-up bg-gradient-to-b from-white to-[#ece3d5] p-3.5 sm:p-4.5">
          <div className="flex flex-wrap items-start justify-between gap-2.5">
            <div>
              <p className="eyebrow">Order Tracking</p>
              <h1 className="brand-font text-[1.86rem] leading-tight text-black sm:text-[2.2rem]">
                {isFr ? "Mes Commandes" : "My Orders"}
              </h1>
              <p className="section-copy mt-1.5">
                {isFr ? "Consultez votre historique et les mises a jour de livraison en direct." : "View your own order history and live delivery updates."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.location.reload();
              }}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#2d4364] via-[#3a5883] to-[#a98a59] px-4 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#f9f3e8] shadow-[0_12px_20px_-16px_rgba(31,48,74,0.6)] transition-all hover:-translate-y-0.5"
            >
              {isFr ? "Rafraichir" : "Reload"}
            </button>
          </div>
        </section>

        {!isAuthenticated ? (
          <section className="surface-panel mt-3.5 p-4">
            <p className="text-sm text-black/70">
              {isFr ? "Veuillez " : "Please "}<Link href="/login" className="font-semibold text-[#2e476b] underline">{text.nav.login.toLowerCase()}</Link>{isFr ? " ou " : " or "}<Link href="/register" className="font-semibold text-[#2e476b] underline">{text.nav.register.toLowerCase()}</Link>{isFr ? " pour voir vos commandes." : " to view your orders."}
            </p>
          </section>
        ) : loading ? (
          <section className="surface-panel mt-3.5 p-4">
            <p className="text-sm text-black/70">{isFr ? "Chargement de vos commandes..." : "Loading your orders..."}</p>
          </section>
        ) : message ? (
          <section className="surface-panel mt-3.5 p-4">
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {message}
            </p>
          </section>
        ) : orders.length === 0 ? (
          <section className="surface-panel mt-3.5 p-4">
            <p className="text-sm text-black/70">{isFr ? "Aucune commande trouvee pour votre compte." : "No orders found for your account yet."}</p>
          </section>
        ) : (
          <>
            <section className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <article className="surface-panel p-3.5">
                <p className="text-xs font-bold uppercase tracking-wide text-black/60">My Orders</p>
                <p className="brand-font mt-1 text-[1.7rem] leading-none text-[#355076]">{orders.length}</p>
              </article>
              <article className="surface-panel p-3.5">
                <p className="text-xs font-bold uppercase tracking-wide text-black/60">Total Spent</p>
                <div className="mt-1.5 flex items-end gap-1.5">
                  <span className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-[#8b7350]/85">EUR</span>
                  <span className="brand-font bg-gradient-to-r from-[#355076] to-[#8b7350] bg-clip-text text-[1.86rem] leading-none text-transparent [font-variant-numeric:tabular-nums]">
                    {totalSpent.toFixed(2)}
                  </span>
                </div>
              </article>
            </section>

            <section className="surface-panel section-graphics mt-3.5 p-3.5 sm:p-4.5">
              <div className="space-y-3">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-xl border border-[#d8c8ae] bg-gradient-to-b from-white to-[#ece3d5]/55 p-3.5 shadow-[0_10px_20px_-16px_rgba(30,47,73,0.22)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[1.02rem] font-semibold leading-tight tracking-tight text-black sm:text-[1.12rem]">
                          {order.order_id}
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/55">
                          Placed {formatWhen(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${statusClass[order.order_status]}`}>
                          {order.order_status.replaceAll("_", " ")}
                        </span>
                        <div className="mt-1.5 flex items-end gap-1.5 justify-end">
                          <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#8b7350]/85">
                            {order.currency}
                          </span>
                          <span className="text-[1.22rem] font-black leading-none text-[#355076] [font-variant-numeric:tabular-nums]">
                            {Number(order.total_amount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 grid grid-cols-1 gap-2 text-sm text-black/75 sm:grid-cols-2">
                      <p><span className="font-bold text-black">Customer:</span> {order.customer_name}</p>
                      <p><span className="font-bold text-black">Phone:</span> {order.customer_phone}</p>
                      <p><span className="font-bold text-black">Address:</span> {order.customer_address}</p>
                      <p>
                        <span className="font-bold text-black">ETA:</span>{" "}
                        {order.estimated_minutes !== null ? `${order.estimated_minutes} min` : "Not assigned"}
                      </p>
                    </div>

                    {order.tracking_note && (
                      <p className="mt-2 rounded-lg border border-[#d8c8ae] bg-[#f2ece2]/75 px-2.5 py-2 text-sm text-black/75">
                        <span className="font-bold text-black">Update:</span> {order.tracking_note}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
