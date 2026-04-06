"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const links = [
  { href: "/dashboard",    label: "Dashboard",    icon: "⊞" },
  { href: "/beverages",    label: "Beverages",    icon: "🧃" },
  { href: "/dry-goods",    label: "Dry Goods",    icon: "🌾" },
  { href: "/transactions", label: "Transactions", icon: "📋" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        style={{
          background: "var(--surface)",
          borderBottom: "1.5px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}
        className="sticky top-0 z-40"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ background: "var(--accent)" }}
              >
                RT
              </div>
              <span
                className="font-serif text-lg hidden sm:block"
                style={{ color: "var(--ink)" }}
              >
                Roshan Traders
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map((l) => {
                const active = pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: active ? "var(--accent-bg)" : "transparent",
                      color:      active ? "var(--accent)"    : "var(--ink2)",
                      fontWeight: active ? 600                : 500,
                    }}
                  >
                    <span className="text-base leading-none">{l.icon}</span>
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="btn btn-secondary hidden md:flex text-sm"
              >
                Sign out
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden btn btn-ghost p-2"
                aria-label="Menu"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  {open ? (
                    <path d="M4 4l12 12M4 16L16 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  ) : (
                    <>
                      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div
            style={{ borderTop: "1.5px solid var(--border)", background: "var(--surface)" }}
            className="md:hidden px-4 pb-4 pt-2"
          >
            {links.map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-1"
                  style={{
                    background: active ? "var(--accent-bg)" : "transparent",
                    color:      active ? "var(--accent)"    : "var(--ink2)",
                  }}
                >
                  <span className="text-lg">{l.icon}</span>
                  {l.label}
                </Link>
              );
            })}
            <hr className="divider my-3" />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full btn btn-secondary justify-center"
            >
              Sign out
            </button>
          </div>
        )}
      </header>
    </>
  );
}