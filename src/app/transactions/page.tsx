"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filterType,   setFilterType]   = useState("");
  const [filterProd,   setFilterProd]   = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType) params.set("type",        filterType);
    if (filterProd) params.set("productType", filterProd);
    const res = await fetch(`/api/transactions?${params.toString()}`);
    setTransactions(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [filterType, filterProd]);

  const totalIn  = transactions.filter((t) => t.transactionType === "IN") .reduce((s, t) => s + (t.totalAmount || 0), 0);
  const totalOut = transactions.filter((t) => t.transactionType === "OUT").reduce((s, t) => s + (t.totalAmount || 0), 0);
  const profit   = totalOut - totalIn;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="mb-6 fade-up">
          <h1 className="font-serif text-3xl sm:text-4xl" style={{ color: "var(--ink)" }}>
            Transactions
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--ink3)" }}>
            Full stock in / out history
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 fade-up fade-up-1">
          <SummaryCard
            label="Total Purchased"
            value={`PKR ${totalIn.toLocaleString()}`}
            sub={`${transactions.filter((t) => t.transactionType === "IN").length} transactions`}
            icon="↓"
            color="#1d4ed8"
            bg="#eff6ff"
          />
          <SummaryCard
            label="Total Sold"
            value={`PKR ${totalOut.toLocaleString()}`}
            sub={`${transactions.filter((t) => t.transactionType === "OUT").length} transactions`}
            icon="↑"
            color="var(--accent2)"
            bg="var(--accent2-bg)"
          />
          <SummaryCard
            label="Gross Margin"
            value={`PKR ${Math.abs(profit).toLocaleString()}`}
            sub={profit >= 0 ? "profit" : "deficit"}
            icon={profit >= 0 ? "✓" : "!"}
            color={profit >= 0 ? "var(--accent2)" : "var(--danger)"}
            bg={profit >= 0 ? "var(--accent2-bg)" : "var(--danger-bg)"}
          />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-4 fade-up fade-up-2">
          {/* Type filter */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--border)" }}>
            {["", "IN", "OUT"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className="px-3.5 py-1.5 text-sm font-medium transition-colors"
                style={{
                  background: filterType === t ? "var(--accent-bg)" : "var(--surface)",
                  color:      filterType === t ? "var(--accent)"    : "var(--ink2)",
                  borderRight: t !== "OUT" ? "1.5px solid var(--border)" : "none",
                }}
              >
                {t === "" ? "All" : t === "IN" ? "↓ IN" : "↑ OUT"}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--border)" }}>
            {[
              { value: "",          label: "All types" },
              { value: "beverage",  label: "🧃 Beverages" },
              { value: "dryGood",   label: "🌾 Dry Goods" },
            ].map((opt, i, arr) => (
              <button
                key={opt.value}
                onClick={() => setFilterProd(opt.value)}
                className="px-3.5 py-1.5 text-sm font-medium transition-colors"
                style={{
                  background: filterProd === opt.value ? "var(--accent-bg)" : "var(--surface)",
                  color:      filterProd === opt.value ? "var(--accent)"    : "var(--ink2)",
                  borderRight: i < arr.length - 1 ? "1.5px solid var(--border)" : "none",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {(filterType || filterProd) && (
            <button
              onClick={() => { setFilterType(""); setFilterProd(""); }}
              className="btn btn-ghost text-sm"
              style={{ color: "var(--danger)" }}
            >
              ✕ Clear
            </button>
          )}

          <span
            className="ml-auto text-sm self-center"
            style={{ color: "var(--ink3)" }}
          >
            {transactions.length} record{transactions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="card overflow-hidden fade-up fade-up-3">

          {/* Desktop header */}
          <div
            className="hidden sm:grid px-5 py-3 text-xs font-semibold uppercase tracking-wide"
            style={{
              gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr",
              color: "var(--ink3)",
              borderBottom: "1.5px solid var(--border)",
              background: "var(--surface2)",
            }}
          >
            <span>Product</span>
            <span>Variant</span>
            <span>Type</span>
            <span>Qty × Price</span>
            <span className="text-right">Total</span>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "var(--border2)", borderTopColor: "var(--accent)" }}
              />
            </div>
          )}

          {!loading && transactions.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="font-semibold mb-1" style={{ color: "var(--ink)" }}>No transactions found</p>
              <p className="text-sm" style={{ color: "var(--ink3)" }}>
                {filterType || filterProd ? "Try clearing the filters" : "Log some stock to see history"}
              </p>
            </div>
          )}

          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {transactions.map((tx) => (
              <div
                key={tx._id}
                className="px-4 sm:px-5 py-3.5 hover:bg-stone-50 transition-colors"
              >
                {/* Desktop row */}
                <div
                  className="hidden sm:grid gap-3 items-center text-sm"
                  style={{ gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr" }}
                >
                  <div>
                    <p className="font-medium" style={{ color: "var(--ink)" }}>
                      {tx.productName || "—"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
                      {tx.productType === "beverage" ? "Beverage" : "Dry Good"} ·{" "}
                      {new Date(tx.date).toLocaleDateString("en-PK", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="mono text-xs" style={{ color: "var(--ink2)" }}>{tx.variantLabel}</span>
                  <span>
                    <span className={`badge ${tx.transactionType === "IN" ? "badge-in" : "badge-out"}`}>
                      {tx.transactionType === "IN" ? "↓ IN" : "↑ OUT"}
                    </span>
                  </span>
                  <span className="mono text-xs" style={{ color: "var(--ink2)" }}>
                    {tx.quantity} × {tx.pricePerUnit?.toLocaleString()}
                  </span>
                  <span className="mono font-semibold text-right" style={{ color: "var(--accent)" }}>
                    PKR {tx.totalAmount?.toLocaleString()}
                  </span>
                </div>

                {/* Mobile row */}
                <div className="sm:hidden flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge ${tx.transactionType === "IN" ? "badge-in" : "badge-out"}`}>
                        {tx.transactionType}
                      </span>
                      <span className="font-medium text-sm truncate" style={{ color: "var(--ink)" }}>
                        {tx.productName}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
                      {tx.variantLabel} · ×{tx.quantity} ·{" "}
                      {new Date(tx.date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className="mono font-semibold text-sm shrink-0" style={{ color: "var(--accent)" }}>
                    PKR {tx.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  label, value, sub, icon, color, bg,
}: {
  label: string; value: string; sub: string;
  icon: string; color: string; bg: string;
}) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--ink3)" }}>
            {label}
          </p>
          <p className="font-serif text-2xl" style={{ color }}>
            {value}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>{sub}</p>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
          style={{ background: bg, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}