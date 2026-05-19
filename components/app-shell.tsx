"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutList, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Orders", href: "/orders", icon: LayoutList },
  { label: "New Order", href: "/orders/new", icon: Plus },
] as const

function SidebarNavItem({ label, href, icon: Icon }: (typeof navItems)[number]) {
  const pathname = usePathname()
  const isActive =
    href === "/orders"
      ? pathname === "/orders"
      : pathname === href || pathname.startsWith(href + "/")
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-brand",
        isActive
          ? "bg-white/15 text-white"
          : "text-white/75 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  )
}

function SidebarNavLinks() {
  return (
    <>
      {navItems.map((item) => (
        <SidebarNavItem key={item.href} {...item} />
      ))}
    </>
  )
}

function BottomTabItem({ label, href, icon: Icon }: (typeof navItems)[number]) {
  const pathname = usePathname()
  const isActive =
    href === "/orders"
      ? pathname === "/orders"
      : pathname === href || pathname.startsWith(href + "/")
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        isActive ? "text-white" : "text-white/60 hover:text-white"
      )}
    >
      <Icon className={cn("size-5", isActive && "stroke-[2.5]")} />
      {label}
    </Link>
  )
}

function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 flex md:hidden bg-brand border-t border-white/10">
      {navItems.map((item) => (
        <BottomTabItem key={item.href} {...item} />
      ))}
    </nav>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden flex-col md:flex w-56 shrink-0 bg-brand h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-white/10">
          {/* Replace with <img src="/logo-white.svg" alt="Ascensor" className="h-7" /> once asset is available */}
          <span className="font-semibold text-white text-lg leading-none">Ascensor</span>
        </div>
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
          <SidebarNavLinks />
        </nav>
      </aside>

      {/* Content column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar — logo only */}
        <header className="flex md:hidden items-center h-14 px-4 bg-brand border-b border-white/10 shrink-0">
          {/* Replace with <img src="/logo-white.svg" alt="Ascensor" className="h-7" /> once asset is available */}
          <span className="font-semibold text-white text-base leading-none">Ascensor</span>
        </header>

        {/* Add bottom padding on mobile so content clears the tab bar */}
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
      </div>

      <BottomTabBar />
    </div>
  )
}
