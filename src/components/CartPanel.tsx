"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useLanguage } from "@/lib/language";

type FormState = {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

const initialForm: FormState = {
  customerName: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

export default function CartPanel() {
  const { language } = useLanguage();
  const isFr = language === "fr";
  const { items, setQty, clear, totalItems, totalAmount } = useCart();
  const { user, isAuthenticated } = useSupabaseUser();
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "idle">("idle");
  const [form, setForm] = useState<FormState>(initialForm);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const renderItems = mounted ? items : [];
  const renderTotalItems = mounted ? totalItems : 0;
  const renderTotalAmount = mounted ? totalAmount : 0;

  const canSubmit = useMemo(
    () =>
      isAuthenticated &&
      items.length > 0 &&
      form.customerName.trim().length > 0 &&
      form.phone.trim().length > 0 &&
      form.address.trim().length > 0,
    [form, isAuthenticated, items.length]
  );

  async function submitOrder() {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setStatusMessage("");
    setStatusType("idle");

    try {
      const token = (await supabaseBrowser.auth.getSession()).data.session?.access_token;
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          customer: {
            name: form.customerName,
            phone: form.phone,
            email: user?.email || form.email,
            address: form.address,
            notes: form.notes,
          },
          items: items.map((entry) => ({
            id: entry.item.id,
            name: entry.item.name,
            price: entry.item.price,
            qty: entry.qty,
          })),
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        detail?: string;
        notifications?: {
          email?: { configured?: boolean; sent?: boolean; error?: string };
          whatsapp?: { configured?: boolean; sent?: boolean; error?: string };
        };
      };
      if (!response.ok) {
        setStatusType("error");
        setStatusMessage(
          data.detail ? `${data.message || "Order failed."} (${data.detail})` : data.message || "Unable to submit your order. Please try again."
        );
        return;
      }

      const emailStatus = data.notifications?.email;
      const whatsappStatus = data.notifications?.whatsapp;
      const notificationNotes: string[] = [];

      if (emailStatus) {
        if (emailStatus.sent) {
          notificationNotes.push("Email confirmation sent.");
        } else if (emailStatus.error) {
          notificationNotes.push(`Email: ${emailStatus.error}`);
        }
      }

      if (whatsappStatus) {
        if (whatsappStatus.sent) {
          notificationNotes.push("WhatsApp confirmation sent.");
        } else if (whatsappStatus.error) {
          notificationNotes.push(`WhatsApp: ${whatsappStatus.error}`);
        }
      }

      const baseMessage = data.message || "Order submitted successfully.";
      setStatusType("success");
      setStatusMessage(
        notificationNotes.length > 0
          ? `${baseMessage} ${notificationNotes.join(" ")}`
          : `${baseMessage} We will contact you shortly.`
      );
      clear();
      setForm(initialForm);
    } catch {
      setStatusType("error");
      setStatusMessage("Unable to submit your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <aside className="surface-panel lux-card-hover h-fit p-3 sm:p-3.5 lg:sticky lg:top-28">
      <div className="mb-2.5 border-b border-[#dac8ad]/70 pb-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="brand-font text-[1.72rem] leading-tight text-black">{isFr ? "Votre Panier" : "Your Cart"}</h2>
            <p className="mt-1 text-[0.82rem] text-black/60">{renderTotalItems} {isFr ? "article(s)" : "item(s)"}</p>
          </div>
          {renderItems.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="rounded-full border border-[#d7c5aa] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-black/65 transition hover:bg-[#ece3d3]"
            >
              {isFr ? "Vider" : "Clear"}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {renderItems.length === 0 && (
          <p className="rounded-lg border border-[#dac8ad]/70 bg-[#f2ece2]/80 p-2.5 text-sm text-black/65">
            {isFr ? "Votre panier est vide. Ajoutez des plats depuis le menu." : "Your cart is empty. Add items from the menu."}
          </p>
        )}

        {renderItems.map((entry) => (
          <div key={entry.item.id} className="rounded-lg border border-[#dac8ad]/70 p-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="brand-font text-[1.25rem] leading-tight text-black">{entry.item.name}</p>
                <p className="text-[0.88rem] text-black/65">€{entry.item.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty(entry.item.id, entry.qty - 1)}
                  className="h-7 w-7 rounded-full border border-[#d3c2a8] text-sm font-bold leading-none"
                >
                  -
                </button>
                <span className="w-5 text-center text-sm font-bold leading-none">{entry.qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(entry.item.id, entry.qty + 1)}
                  className="h-7 w-7 rounded-full border border-[#d3c2a8] text-sm font-bold leading-none"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="rounded-lg border border-[#dac8ad]/70 bg-[#ece3d5]/85 p-2.5">
          <p className="text-sm text-black/70">Total</p>
          <p className="text-xl font-extrabold text-[#7e6a48]">€{renderTotalAmount.toFixed(2)}</p>
        </div>

        <div className="rounded-lg border border-[#dac8ad]/70 p-2.5">
          <h3 className="mb-3 text-[1rem] font-bold text-black">{isFr ? "Vos informations" : "Your Details"}</h3>

          {!isAuthenticated && (
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {isFr ? "Veuillez " : "Please "}<Link href="/login" className="font-semibold underline">{isFr ? "vous connecter" : "login"}</Link>{isFr ? " ou " : " or "}<Link href="/register" className="font-semibold underline">{isFr ? "vous inscrire" : "register"}</Link>{isFr ? " avant de passer commande." : " before placing an order."}
            </p>
          )}

          <div className="grid gap-2">
            <input
              value={form.customerName}
              onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
              placeholder={isFr ? "Nom complet *" : "Full Name *"}
              autoComplete="name"
              className="rounded-lg border border-[#d3c2a8] px-3 py-2 text-[0.86rem]"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder={isFr ? "Numero de telephone *" : "Phone Number *"}
              autoComplete="tel"
              className="rounded-lg border border-[#d3c2a8] px-3 py-2 text-[0.86rem]"
            />
            <input
              value={user?.email || form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder={isFr ? "Email" : "Email"}
              autoComplete="email"
              disabled={Boolean(user?.email)}
              className="rounded-lg border border-[#d3c2a8] px-3 py-2 text-[0.86rem]"
            />
            <textarea
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              placeholder={isFr ? "Adresse de livraison *" : "Delivery Address *"}
              autoComplete="street-address"
              rows={3}
              className="rounded-lg border border-[#d3c2a8] px-3 py-2 text-[0.86rem]"
            />
            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder={isFr ? "Notes (optionnel)" : "Notes (optional)"}
              rows={2}
              className="rounded-lg border border-[#d3c2a8] px-3 py-2 text-[0.86rem]"
            />
          </div>
        </div>

        {statusMessage && (
          <p
            className={`rounded-lg border px-2.5 py-2 text-sm ${
              statusType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {statusMessage}
          </p>
        )}
        <button
          type="button"
          disabled={!canSubmit || submitting}
          onClick={submitOrder}
          className="w-full rounded-full bg-gradient-to-r from-[#2d4364] via-[#3a5883] to-[#a98a59] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#fff8ef] shadow-[0_14px_22px_-16px_rgba(31,48,74,0.6)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:from-stone-300 disabled:to-stone-300"
        >
          {submitting ? (isFr ? "Envoi..." : "Submitting...") : isFr ? "Valider la commande" : "Submit Order"}
        </button>
      </div>
    </aside>
  );
}
