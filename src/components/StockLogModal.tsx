"use client";
import { useState } from "react";

type Props = {
  product: any;
  productType: "beverage" | "dryGood";
  onSave: () => void;
  onCancel: () => void;
};

export default function StockLogModal({ product, productType, onSave, onCancel }: Props) {
  const [variantLabel, setVariantLabel] = useState("");
  const [txType,  setTxType]  = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState("");
  const [price,    setPrice]    = useState("");
  const [notes,    setNotes]    = useState("");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const variantKey = productType === "beverage" ? "size" : "weight";

  function handleVariantChange(label: string) {
    setVariantLabel(label);
    const v = product.variants?.find((vt: any) => vt.size === label || vt.weight === label);
    if (v) setPrice(txType === "IN" ? String(v.buyPrice) : String(v.sellPrice));
  }

  function handleTxTypeChange(t: "IN" | "OUT") {
    setTxType(t);
    if (variantLabel) {
      const v = product.variants?.find((vt: any) => vt.size === variantLabel || vt.weight === variantLabel);
      if (v) setPrice(t === "IN" ? String(v.buyPrice) : String(v.sellPrice));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!variantLabel) return setError("Please select a variant.");
    if (!quantity || Number(quantity) <= 0) return setError("Enter a valid quantity.");
    if (!price || Number(price) <= 0) return setError("Enter a valid price.");

    setSaving(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productType,
        productId: product._id,
        variantLabel,
        transactionType: txType,
        quantity: Number(quantity),
        pricePerUnit: Number(price),
        notes,
      }),
    });
    setSaving(false);
    if (res.ok) onSave();
    else {
      const d = await res.json();
      setError(d.error || "Failed to save.");
    }
  }

  const selectedVariant = product.variants?.find(
    (vt: any) => vt.size === variantLabel || vt.weight === variantLabel
  );
  const total = quantity && price ? Number(quantity) * Number(price) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Product pill */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
        style={{ background: "var(--surface2)", border: "1.5px solid var(--border)" }}
      >
        <span className="text-lg">{productType === "beverage" ? "🧃" : "🌾"}</span>
        <span className="font-medium text-sm" style={{ color: "var(--ink)" }}>{product.name}</span>
        {product.category && (
          <span className="badge badge-cat ml-auto">{product.category}</span>
        )}
      </div>

      {/* IN / OUT toggle */}
      <div
        className="grid grid-cols-2 rounded-xl p-1 gap-1"
        style={{ background: "var(--surface2)", border: "1.5px solid var(--border)" }}
      >
        <button
          type="button"
          onClick={() => handleTxTypeChange("IN")}
          className="py-2 rounded-lg text-sm font-semibold transition-all"
          style={txType === "IN"
            ? { background: "var(--accent2)", color: "#fff", boxShadow: "0 2px 6px rgba(45,106,79,0.3)" }
            : { color: "var(--ink3)" }
          }
        >
          ↓ Stock IN
        </button>
        <button
          type="button"
          onClick={() => handleTxTypeChange("OUT")}
          className="py-2 rounded-lg text-sm font-semibold transition-all"
          style={txType === "OUT"
            ? { background: "var(--danger)", color: "#fff", boxShadow: "0 2px 6px rgba(192,57,43,0.3)" }
            : { color: "var(--ink3)" }
          }
        >
          ↑ Stock OUT
        </button>
      </div>

      {/* Variant selector */}
      <div>
        <label className="label">{productType === "beverage" ? "Size" : "Weight"}</label>
        <select
          value={variantLabel}
          onChange={(e) => handleVariantChange(e.target.value)}
          className="input"
        >
          <option value="">Select variant…</option>
          {product.variants?.map((v: any, i: number) => (
            <option key={i} value={v[variantKey]}>
              {v[variantKey]} — Stock: {v.stock || 0} units
            </option>
          ))}
        </select>
      </div>

      {/* Variant info strip */}
      {selectedVariant && (
        <div
          className="flex items-center gap-4 px-3.5 py-2 rounded-lg text-xs"
          style={{ background: "var(--accent-bg)", color: "var(--ink2)" }}
        >
          <span>Buy: <strong>PKR {selectedVariant.buyPrice}</strong></span>
          <span>Sell: <strong>PKR {selectedVariant.sellPrice}</strong></span>
          <span className="ml-auto">
            In stock: <strong>{selectedVariant.stock || 0}</strong>
          </span>
        </div>
      )}

      {/* Qty & Price */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input"
            placeholder="0"
            min="1"
          />
        </div>
        <div>
          <label className="label">
            Price/unit — <span style={{ color: "var(--ink3)" }}>{txType === "IN" ? "buy" : "sell"}</span>
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input"
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      {/* Total */}
      {total > 0 && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{ background: "var(--surface2)", border: "1.5px solid var(--border)" }}
        >
          <span className="text-sm font-medium" style={{ color: "var(--ink2)" }}>Total Amount</span>
          <span className="mono font-semibold text-base" style={{ color: "var(--accent)" }}>
            PKR {total.toLocaleString()}
          </span>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="label">Notes <span style={{ color: "var(--ink3)", fontWeight: 400 }}>(optional)</span></label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input"
          placeholder="Supplier, invoice #, reason…"
        />
      </div>

      {error && (
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
          style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
        >
          ⚠ {error}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
        <button type="button" onClick={onCancel} className="btn btn-secondary justify-center">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary justify-center"
        >
          {saving ? "Saving…" : `Log ${txType}`}
        </button>
      </div>
    </form>
  );
}