
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
    <div className="fixed bottom-0 w-full md:hidden shrink-0 bg-background border-t z-50">
      <nav className="flex h-[72px] items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
             <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full text-muted-foreground transition-colors group",
                  isActive && "text-primary font-semibold"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center p-2 px-6 rounded-full transition-all duration-300 ease-in-out",
                  isActive ? "bg-muted" : "bg-transparent",
                  "group-hover:bg-muted"
                  )}>
                   <item.icon className="h-6 w-6 shrink-0" strokeWidth={isActive ? 2.25 : 2} />
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
          )
        })}
      </nav>
    </div>
  )
}
