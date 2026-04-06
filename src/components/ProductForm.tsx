"use client";
import { useState } from "react";

type Variant = {
  size?: string;
  weight?: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  _key?: string;
};

type ProductFormProps = {
  type: "beverage" | "dryGood";
  initial?: any;
  onSave: () => void;
  onCancel: () => void;
};

const BEVERAGE_CATEGORIES = ["Water", "Juice", "Soda", "Energy Drink", "Milk", "Tea", "Coffee", "Other"];
const DRY_CATEGORIES      = ["Daal", "Rice", "Spices", "Flour", "Sugar", "Salt", "Oil", "Other"];

export default function ProductForm({ type, initial, onSave, onCancel }: ProductFormProps) {
  const [name,     setName]     = useState(initial?.name     || "");
  const [brand,    setBrand]    = useState(initial?.brand    || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [notes,    setNotes]    = useState(initial?.notes    || "");
  const [variants, setVariants] = useState<Variant[]>(initial?.variants || []);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const isBev       = type === "beverage";
  const categories  = isBev ? BEVERAGE_CATEGORIES : DRY_CATEGORIES;
  const variantKey  = isBev ? "size" : "weight";
  const variantPlaceholder = isBev ? "e.g. 250ml, 500ml, 1L" : "e.g. 1kg, 5kg, 500g";

  function addVariant() {
    setVariants([...variants, { [variantKey]: "", buyPrice: 0, sellPrice: 0, stock: 0 }]);
  }

  function updateVariant(i: number, field: string, value: string | number) {
    const updated = [...variants];
    (updated[i] as any)[field] = value;
    setVariants(updated);
  }

  function removeVariant(i: number) {
    setVariants(variants.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Name is required.");
    if (variants.length === 0) return setError("Add at least one variant.");

    setSaving(true);
    const method = initial ? "PATCH" : "POST";
    const body = {
      type,
      ...(initial ? { id: initial._id } : {}),
      name: name.trim(),
      category,
      notes,
      variants: variants.map((v) => ({
        ...v,
        _key: v._key || Math.random().toString(36).slice(2),
        buyPrice:  Number(v.buyPrice),
        sellPrice: Number(v.sellPrice),
        stock:     Number(v.stock),
      })),
      ...(isBev ? { brand } : {}),
    };

    const res = await fetch("/api/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);

    if (res.ok) onSave();
    else {
      const d = await res.json();
      setError(d.error || "Failed to save.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Basic info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={isBev ? "" : "sm:col-span-2"}>
          <label className="label">{isBev ? "Beverage Name" : "Product Name"} *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder={isBev ? "e.g. Pepsi" : "e.g. Basmati Rice"}
          />
        </div>

        {isBev && (
          <div>
            <label className="label">Brand</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="input"
              placeholder="e.g. PepsiCo"
            />
          </div>
        )}

        <div>
          <label className="label">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className={isBev ? "" : "sm:col-span-2"}>
          <label className="label">Notes</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input"
            placeholder="Optional notes"
          />
        </div>
      </div>

      <hr className="divider" />

      {/* Variants */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
              {isBev ? "Size Variants" : "Weight Variants"}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
              Set buy price, sell price and current stock per {isBev ? "size" : "weight"}
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="btn btn-success text-xs"
          >
            + Add
          </button>
        </div>

        {variants.length === 0 && (
          <div
            className="rounded-xl border-2 border-dashed py-8 text-center"
            style={{ borderColor: "var(--border2)" }}
          >
            <p className="text-sm" style={{ color: "var(--ink3)" }}>
              No variants yet — click <strong>+ Add</strong> to add one
            </p>
          </div>
        )}

        {/* Column headers — hidden on mobile */}
        {variants.length > 0 && (
          <div
            className="hidden sm:grid gap-2 mb-2 px-1"
            style={{
              gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
              color: "var(--ink3)",
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <span>{isBev ? "Size" : "Weight"}</span>
            <span>Buy (PKR)</span>
            <span>Sell (PKR)</span>
            <span>Stock</span>
            <span />
          </div>
        )}

        <div className="space-y-2">
          {variants.map((v, i) => (
            <div
              key={i}
              className="rounded-xl p-3"
              style={{ background: "var(--surface2)", border: "1.5px solid var(--border)" }}
            >
              {/* Mobile stacked / Desktop row */}
              <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-center">
                <div className="col-span-2 sm:col-span-1">
                  <label className="sm:hidden label" style={{ fontSize: "0.72rem" }}>{isBev ? "Size" : "Weight"}</label>
                  <input
                    value={isBev ? v.size || "" : v.weight || ""}
                    onChange={(e) => updateVariant(i, variantKey, e.target.value)}
                    placeholder={variantPlaceholder}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="sm:hidden label" style={{ fontSize: "0.72rem" }}>Buy (PKR)</label>
                  <input
                    type="number"
                    value={v.buyPrice || ""}
                    onChange={(e) => updateVariant(i, "buyPrice", e.target.value)}
                    placeholder="0"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="sm:hidden label" style={{ fontSize: "0.72rem" }}>Sell (PKR)</label>
                  <input
                    type="number"
                    value={v.sellPrice || ""}
                    onChange={(e) => updateVariant(i, "sellPrice", e.target.value)}
                    placeholder="0"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="sm:hidden label" style={{ fontSize: "0.72rem" }}>Stock</label>
                  <input
                    type="number"
                    value={v.stock || ""}
                    onChange={(e) => updateVariant(i, "stock", e.target.value)}
                    placeholder="0"
                    className="input text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="btn btn-danger py-1.5 px-2 self-end sm:self-auto"
                  title="Remove variant"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
          style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
        <button type="button" onClick={onCancel} className="btn btn-secondary justify-center">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary justify-center"
        >
          {saving ? "Saving…" : initial ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}