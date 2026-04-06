"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";
import StockLogModal from "@/components/StockLogModal";

export default function BeveragesPage() {
  const [products,    setProducts]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editing,     setEditing]     = useState<any>(null);
  const [stockTarget, setStockTarget] = useState<any>(null);
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [search,      setSearch]      = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/products?type=beverage");
    setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Remove this product? It will be hidden from the list.")) return;
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  const filtered = products.filter((p) =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (showForm || editing) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => { setShowForm(false); setEditing(null); }}
              className="btn btn-ghost p-2"
            >
              ← Back
            </button>
            <h1 className="font-serif text-2xl sm:text-3xl" style={{ color: "var(--ink)" }}>
              {editing ? "Edit Beverage" : "Add Beverage"}
            </h1>
          </div>
          <div className="card p-5 sm:p-7">
            <ProductForm
              type="beverage"
              initial={editing}
              onSave={() => { setShowForm(false); setEditing(null); load(); }}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 fade-up">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl" style={{ color: "var(--ink)" }}>
              Beverages
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--ink3)" }}>
              {products.length} products · drinks, bottles, cans
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            + Add Beverage
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4 fade-up fade-up-1">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: "var(--ink3)" }}
          >
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
            placeholder="Search by name, brand or category…"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--border2)", borderTopColor: "var(--accent)" }}
            />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="card py-16 text-center fade-up">
            <p className="text-4xl mb-3">🧃</p>
            <p className="font-semibold mb-1" style={{ color: "var(--ink)" }}>
              {search ? "No results found" : "No beverages yet"}
            </p>
            <p className="text-sm" style={{ color: "var(--ink3)" }}>
              {search ? "Try a different search term" : "Click \"Add Beverage\" to get started"}
            </p>
          </div>
        )}

        {/* Product list */}
        <div className="space-y-2 fade-up fade-up-2">
          {filtered.map((p) => {
            const expanded = expandedId === p._id;
            const lowStock = p.variants?.some((v: any) => (v.stock || 0) <= 5);

            return (
              <div
                key={p._id}
                className="card overflow-hidden transition-all"
                style={{ boxShadow: expanded ? "var(--shadow)" : "var(--shadow-sm)" }}
              >
                {/* Row */}
                <div
                  className="flex items-center gap-3 px-4 sm:px-5 py-4 cursor-pointer hover:bg-stone-50 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : p._id)}
                >
                  {/* Expand indicator */}
                  <span
                    className="text-xs transition-transform duration-200"
                    style={{ color: "var(--ink3)", transform: expanded ? "rotate(90deg)" : "rotate(0)" }}
                  >
                    ▶
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold" style={{ color: "var(--ink)" }}>{p.name}</span>
                      {p.brand && (
                        <span className="text-sm" style={{ color: "var(--ink3)" }}>{p.brand}</span>
                      )}
                      {p.category && <span className="badge badge-cat">{p.category}</span>}
                      {lowStock && <span className="badge badge-low">⚠ Low stock</span>}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
                      {p.variants?.length || 0} size{p.variants?.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setStockTarget(p)}
                      className="btn btn-success text-xs py-1.5"
                    >
                      Log Stock
                    </button>
                    <button
                      onClick={() => setEditing(p)}
                      className="btn btn-ghost text-xs py-1.5 hidden sm:flex"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="btn btn-danger text-xs py-1.5 hidden sm:flex"
                    >
                      Remove
                    </button>
                    {/* Mobile: more menu (simplified) */}
                    <button
                      onClick={() => setEditing(p)}
                      className="btn btn-ghost text-xs py-1.5 sm:hidden"
                      title="Edit"
                    >
                      ✏
                    </button>
                  </div>
                </div>

                {/* Expanded variants */}
                {expanded && (
                  <div style={{ borderTop: "1.5px solid var(--border)", background: "var(--surface2)" }}>
                    {/* Desktop table header */}
                    <div
                      className="hidden sm:grid gap-3 px-5 py-2 text-xs font-semibold uppercase tracking-wide"
                      style={{
                        gridTemplateColumns: "2fr 1fr 1fr 1fr",
                        color: "var(--ink3)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <span>Size</span>
                      <span>Buy Price</span>
                      <span>Sell Price</span>
                      <span>Stock</span>
                    </div>

                    {p.variants?.map((v: any, i: number) => (
                      <div
                        key={i}
                        className="flex flex-col sm:grid gap-1 sm:gap-3 px-5 py-3 text-sm"
                        style={{
                          gridTemplateColumns: "2fr 1fr 1fr 1fr",
                          borderBottom: i < p.variants.length - 1 ? "1px solid var(--border)" : "none",
                        }}
                      >
                        <span className="font-semibold" style={{ color: "var(--accent)" }}>
                          {v.size}
                        </span>
                        <span className="flex sm:block gap-1">
                          <span className="sm:hidden text-xs" style={{ color: "var(--ink3)" }}>Buy:</span>
                          <span className="mono" style={{ color: "var(--ink2)" }}>PKR {v.buyPrice?.toLocaleString()}</span>
                        </span>
                        <span className="flex sm:block gap-1">
                          <span className="sm:hidden text-xs" style={{ color: "var(--ink3)" }}>Sell:</span>
                          <span className="mono" style={{ color: "var(--ink2)" }}>PKR {v.sellPrice?.toLocaleString()}</span>
                        </span>
                        <span className="flex sm:block gap-1">
                          <span className="sm:hidden text-xs" style={{ color: "var(--ink3)" }}>Stock:</span>
                          <span
                            className="mono font-medium"
                            style={{ color: (v.stock || 0) <= 5 ? "var(--danger)" : "var(--accent2)" }}
                          >
                            {v.stock || 0} units
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Stock log modal */}
      {stockTarget && (
        <div
          className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          style={{ background: "rgba(26,23,20,0.5)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && setStockTarget(null)}
        >
          <div
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--surface)", boxShadow: "var(--shadow-lg)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl" style={{ color: "var(--ink)" }}>
                Log Stock
              </h2>
              <button
                onClick={() => setStockTarget(null)}
                className="btn btn-ghost p-1.5 rounded-lg"
                style={{ color: "var(--ink3)" }}
              >
                ✕
              </button>
            </div>
            <StockLogModal
              product={stockTarget}
              productType="beverage"
              onSave={() => { setStockTarget(null); load(); }}
              onCancel={() => setStockTarget(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}