"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import OrdersAdminBoard from "@/components/OrdersAdminBoard";
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
  updated_at: string | null;
};

export default function AdminPage() {
  const { language } = useLanguage();
  const isFr = language === "fr";
  const { user, isAuthenticated } = useSupabaseUser();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [trackingReady, setTrackingReady] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAdminOrders() {
      if (!isAuthenticated) {
        setOrders([]);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const token = (await supabaseBrowser.auth.getSession()).data.session?.access_token;
      const response = await fetch("/api/orders?limit=100", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });

      const data = (await response.json()) as {
        orders?: OrderRecord[];
        trackingReady?: boolean;
        message?: string;
        detail?: string;
      };

      if (!response.ok) {
        setOrders([]);
        setTrackingReady(false);
        setError(data.detail ? `${data.message || "Unable to load admin orders."} (${data.detail})` : data.message || "Unable to load admin orders.");
        setLoading(false);
        return;
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setTrackingReady(data.trackingReady !== false);
      setLoading(false);
    }

    void loadAdminOrders();
  }, [isAuthenticated, user?.email]);

  return (
    <>
      <Navbar />
      <main className="site-shell pt-28 pb-7">
        <section className="surface-panel section-graphics fade-up bg-gradient-to-b from-white to-[#ece3d5] p-3.5 sm:p-4.5">
          <div className="flex flex-wrap items-start justify-between gap-2.5">
            <div>
              <p className="eyebrow">Admin</p>
              <h1 className="brand-font text-[1.86rem] leading-tight text-black sm:text-[2.2rem]">
                {isFr ? "Centre des operations" : "Order Operations Center"}
              </h1>
              <p className="section-copy mt-1.5">
                {isFr ? "Suivez les commandes, assignez la livraison, mettez a jour l'ETA et finalisez le cycle de livraison." : "Track order progress, assign delivery, update ETA, and complete delivery lifecycle."}
              </p>
            </div>
            <a
              href="/admin"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#2d4364] via-[#3a5883] to-[#a98a59] px-4 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#f9f3e8] shadow-[0_12px_20px_-16px_rgba(31,48,74,0.6)] transition-all hover:-translate-y-0.5"
            >
              {isFr ? "Rafraichir" : "Reload Board"}
            </a>
          </div>
        </section>

        {!isAuthenticated ? (
          <section className="surface-panel mt-3.5 p-4">
            <p className="text-sm text-black/70">
              {isFr ? "Veuillez " : "Please "}<Link href="/login" className="font-semibold text-[#2e476b] underline">{isFr ? "vous connecter" : "login"}</Link>{isFr ? " avec un compte admin pour acceder a cette page." : " with an admin account to access this page."}
            </p>
          </section>
        ) : loading ? (
          <section className="surface-panel mt-3.5 p-4">
            <p className="text-sm text-black/70">{isFr ? "Verification de l'acces admin et chargement..." : "Checking admin access and loading orders..."}</p>
          </section>
        ) : error ? (
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
