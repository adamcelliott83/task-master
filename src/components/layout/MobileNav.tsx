"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, CalendarDays, CalendarRange, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/dashboard/daily", label: "Daily", icon: Calendar },
  { href: "/dashboard/weekly", label: "Weekly", icon: CalendarDays },
  { href: "/dashboard/monthly", label: "Monthly", icon: CalendarRange },
  { href: "/dashboard/time-chunks", label: "Chunks", icon: Clock },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex md:hidden z-50">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors",
              isActive ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
