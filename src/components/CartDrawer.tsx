"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/hooks/useCart";

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

export default function CartDrawer() {
  const { items, setQty, clear, totalItems, totalAmount } = useCart();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [form, setForm] = useState<FormState>(initialForm);

  const canSubmit = useMemo(() => {
    return (
      items.length > 0 &&
      form.customerName.trim().length > 0 &&
      form.phone.trim().length > 0 &&
      form.address.trim().length > 0
    );
  }, [form, items.length]);

  async function submitOrder() {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.customerName,
            phone: form.phone,
            email: form.email,
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

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setStatusMessage(data.message || "Unable to submit your order. Please try again.");
        return;
      }

      setStatusMessage("Order submitted successfully. We will contact you shortly.");
      clear();
      setForm(initialForm);
    } catch {
      setStatusMessage("Unable to submit your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 right-4 z-[90] flex items-center justify-center gap-2 rounded-full bg-orange-600 px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_14px_34px_-12px_rgba(234,88,12,0.95)] hover:bg-orange-700 sm:left-auto sm:right-6 sm:w-auto"
      >
        <span>View Cart</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-extrabold text-orange-700">{totalItems}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[95] bg-black/45 p-3 sm:p-6" role="dialog" aria-modal="true">
          <div className="ml-auto flex h-full w-full max-w-xl flex-col rounded-2xl bg-white p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center justify-between border-b border-orange-100 pb-3">
              <h2 className="brand-font text-3xl text-black">Your Cart</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-orange-200 px-3 py-1 text-sm font-semibold text-black/70"
              >
                Close
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {items.length === 0 && (
                <p className="rounded-xl border border-orange-100 bg-orange-50/50 p-3 text-sm text-black/65">
                  Your cart is empty. Add some items to continue.
                </p>
              )}

              {items.map((entry) => (
                <div key={entry.item.id} className="rounded-xl border border-orange-100 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="brand-font text-2xl text-black">{entry.item.name}</p>
                      <p className="text-sm text-black/65">€{entry.item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQty(entry.item.id, entry.qty - 1)}
                        className="h-7 w-7 rounded-full border border-orange-200 text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-sm font-bold">{entry.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(entry.item.id, entry.qty + 1)}
                        className="h-7 w-7 rounded-full border border-orange-200 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-3">
                <p className="text-sm text-black/70">Total</p>
                <p className="text-xl font-extrabold text-orange-700">€{totalAmount.toFixed(2)}</p>
              </div>

              <div className="rounded-xl border border-orange-100 p-3">
                <h3 className="mb-3 text-base font-bold text-black">Your Details</h3>
                <div className="grid gap-2">
                  <input
                    value={form.customerName}
                    onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Full Name *"
                    className="rounded-lg border border-orange-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone Number *"
                    className="rounded-lg border border-orange-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Email (optional)"
                    className="rounded-lg border border-orange-200 px-3 py-2 text-sm"
                  />
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Delivery Address *"
                    rows={3}
                    className="rounded-lg border border-orange-200 px-3 py-2 text-sm"
                  />
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes (optional)"
                    rows={2}
                    className="rounded-lg border border-orange-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-orange-100 pt-3">
              {statusMessage && <p className="mb-2 text-sm text-black/70">{statusMessage}</p>}
              <button
                type="button"
                disabled={!canSubmit || submitting}
                onClick={submitOrder}
                className="w-full rounded-full bg-orange-600 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                {submitting ? "Submitting..." : "Submit Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
