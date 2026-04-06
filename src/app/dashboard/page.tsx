import { getServerSession } from "next-auth";
import { authOptions } from "@/sanity/lib/auth";
import { redirect } from "next/navigation";
import { sanityClient } from "@/sanity/lib/client";
import Navbar from "@/components/Navbar";
import Link from "next/link";

async function getStats() {
  const [beverages, dryGoods, recentTx, totalIn, totalOut] = await Promise.all([
    sanityClient.fetch(`count(*[_type == "beverage" && isActive != false])`),
    sanityClient.fetch(`count(*[_type == "dryGood" && isActive != false])`),
    sanityClient.fetch(`*[_type == "stockTransaction"] | order(date desc) [0..5] {
      _id, transactionType, variantLabel, quantity, totalAmount, date, productType,
      "productName": select(
        productType == "beverage" => productRef->name,
        productType == "dryGood"  => dryGoodRef->name
      )
    }`),
    sanityClient.fetch(`*[_type == "stockTransaction" && transactionType == "IN"]{totalAmount}`),
    sanityClient.fetch(`*[_type == "stockTransaction" && transactionType == "OUT"]{totalAmount}`),
  ]);

  const sumIn  = (totalIn  as any[]).reduce((s, t) => s + (t.totalAmount || 0), 0);
  const sumOut = (totalOut as any[]).reduce((s, t) => s + (t.totalAmount || 0), 0);

  return { beverages, dryGoods, recentTx, sumIn, sumOut };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { beverages, dryGoods, recentTx, sumIn, sumOut } = await getStats();

  const today = new Date().toLocaleDateString("en-PK", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Page header */}
        <div className="mb-6 sm:mb-8 fade-up">
          <p className="text-xs font-mono tracking-widest uppercase mb-1" style={{ color: "var(--ink3)" }}>
            {today}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl" style={{ color: "var(--ink)" }}>
            Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink3)" }}>
            Welcome back, <span style={{ color: "var(--ink2)", fontWeight: 500 }}>{session.user?.name}</span>
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            label="Beverages"
            value={beverages}
            sub="products"
            href="/beverages"
            icon="🧃"
            accent="var(--accent)"
            accentBg="var(--accent-bg)"
            delay="fade-up-1"
          />
          <StatCard
            label="Dry Goods"
            value={dryGoods}
            sub="products"
            href="/dry-goods"
            icon="🌾"
            accent="var(--accent2)"
            accentBg="var(--accent2-bg)"
            delay="fade-up-2"
          />
          <StatCard
            label="Total Bought"
            value={`PKR ${(sumIn / 1000).toFixed(1)}k`}
            sub="stock in"
            href="/transactions?type=IN"
            icon="↓"
            accent="#1d4ed8"
            accentBg="#eff6ff"
            delay="fade-up-3"
          />
          <StatCard
            label="Total Sold"
            value={`PKR ${(sumOut / 1000).toFixed(1)}k`}
            sub="stock out"
            href="/transactions?type=OUT"
            icon="↑"
            accent="var(--accent2)"
            accentBg="var(--accent2-bg)"
            delay="fade-up-4"
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 fade-up fade-up-2">
          <Link href="/beverages" className="card p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-all group">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: "var(--accent-bg)" }}
            >
              🧃
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: "var(--ink)" }}>Manage Beverages</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>Add, edit sizes & prices</p>
            </div>
            <span style={{ color: "var(--accent)" }} className="group-hover:translate-x-1 transition-transform text-lg">→</span>
          </Link>

          <Link href="/dry-goods" className="card p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-all group">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: "var(--accent2-bg)" }}
            >
              🌾
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: "var(--ink)" }}>Manage Dry Goods</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>Daal, rice, spices & more</p>
            </div>
            <span style={{ color: "var(--accent2)" }} className="group-hover:translate-x-1 transition-transform text-lg">→</span>
          </Link>
        </div>

        {/* Recent transactions */}
        <div className="card fade-up fade-up-3">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-serif text-xl" style={{ color: "var(--ink)" }}>
              Recent Transactions
            </h2>
            <Link
              href="/transactions"
              className="text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              View all →
            </Link>
          </div>

          {recentTx.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm" style={{ color: "var(--ink3)" }}>No transactions yet.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentTx.map((tx: any, i: number) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between px-5 sm:px-6 py-3.5 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`badge shrink-0 ${tx.transactionType === "IN" ? "badge-in" : "badge-out"}`}
                    >
                      {tx.transactionType}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>
                        {tx.productName || "—"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--ink3)" }}>
                        {tx.variantLabel} · ×{tx.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="mono font-medium text-sm" style={{ color: "var(--ink)" }}>
                      PKR {tx.totalAmount?.toLocaleString()}
                    </p>
                    <p className="text-xs" style={{ color: "var(--ink3)" }}>
                      {new Date(tx.date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label, value, sub, href, icon, accent, accentBg, delay,
}: {
  label: string; value: any; sub: string;
  href: string; icon: string;
  accent: string; accentBg: string; delay: string;
}) {
  return (
    <Link
      href={href}
      className={`card p-4 sm:p-5 hover:shadow-md transition-all fade-up ${delay} group block`}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3"
        style={{ background: accentBg }}
      >
        {icon}
      </div>
      <p className="font-serif text-2xl sm:text-3xl font-normal" style={{ color: accent }}>
        {value}
      </p>
      <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--ink)" }}>{label}</p>
      <p className="text-xs" style={{ color: "var(--ink3)" }}>{sub}</p>
    </Link>
  );
}