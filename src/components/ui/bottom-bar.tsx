
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
    <div className="fixed bottom-0 w-full md:hidden shrink-0 bg-muted/40 border-t z-50">
      <nav className="flex h-16 items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
             <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full text-muted-foreground transition-colors group",
                  isActive && "text-primary"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center gap-2 rounded-full transition-all duration-300 ease-in-out px-4 py-2",
                   isActive ? "bg-background font-semibold" : "bg-transparent",
                  "group-hover:bg-background"
                  )}>
                   <item.icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                   <span className={cn("text-sm", isActive ? "inline" : "hidden")}>{item.label}</span>
                </div>
              </Link>
          )
        })}
      </nav>
    </div>
  )
}
