"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "首页" },
  { href: "/tasks", label: "任务" },
  { href: "/tasks/create", label: "创建任务" },
  { href: "/skills", label: "Skills" },
  { href: "/settings", label: "设置" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[#475569] bg-[#0F172A]/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 font-semibold text-lg text-[#F8FAFC]">
          AI Scraper
        </Link>
        <div className="flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                pathname === link.href
                  ? "text-[#22C55E]"
                  : "text-[#94A3B8] hover:text-[#F8FAFC]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
