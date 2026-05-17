"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Orders", href: "/orders" },
  { label: "New Order", href: "/orders/new" },
] as const

function NavLinks() {
  const pathname = usePathname()
  return (
    <>
      {navItems.map((item) => {
        const isActive =
          item.href === "/orders"
            ? pathname === "/orders"
            : pathname === item.href || pathname.startsWith(item.href + "/")
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-brand",
              isActive
                ? "bg-white/15 text-white"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden flex-col md:flex w-56 shrink-0 bg-brand h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-white/10">
          <span className="font-semibold text-white text-lg leading-none">Ascensor</span>
        </div>
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
          <NavLinks />
        </nav>
      </aside>

      {/* Content column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile/tablet top bar */}
        <header className="flex md:hidden items-center gap-4 h-14 px-4 bg-brand border-b border-white/10 shrink-0">
          <span className="font-semibold text-white text-base leading-none">Ascensor</span>
          <nav className="flex items-center gap-1">
            <NavLinks />
          </nav>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
