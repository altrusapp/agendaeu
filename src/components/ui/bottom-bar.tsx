
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
    <div className="fixed bottom-0 w-full md:hidden shrink-0 bg-background border-t z-50 rounded-t-[45px]">
      <nav className="flex h-16 items-center justify-around pb-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
             <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full text-muted-foreground transition-colors group gap-1 pt-1",
                  isActive && "text-primary"
                )}
              >
                 <div className={cn("p-2 px-5 rounded-full transition-colors", isActive && "bg-primary/10")}>
                    <item.icon className="h-5 w-5 shrink-0" />
                 </div>
                <span className={cn("text-xs transition-all", isActive ? "font-semibold" : "font-normal")}>{item.label}</span>
              </Link>
          )
        })}
      </nav>
    </div>
  )
}
