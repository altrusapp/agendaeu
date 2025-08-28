
"use client"

import Link from "next/link"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface BottomBarProps {
  navItems: {
    href: string;
    icon: LucideIcon;
    label: string;
  }[];
  pathname: string;
}

export function BottomBar({ navItems, pathname }: BottomBarProps) {
  return (
    <div className="md:hidden shrink-0 bg-background border-t z-50">
      <nav className="flex h-[72px] items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full text-muted-foreground transition-colors",
              pathname === item.href && "text-primary"
            )}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
