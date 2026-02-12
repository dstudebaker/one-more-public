"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Make Now" },
  { href: "/one", label: "One Away" },
  { href: "/two", label: "Two Away" },
  { href: "/with", label: "Recipes With" },   // 👈 add this
  { href: "/unlock", label: "Unlock" },
  { href: "/bar", label: "My Bar" },
];

export function TopNav() {
  const path = usePathname();
  return (
    <div className="tabs" role="tablist" aria-label="Sections">
      {tabs.map((t) => {
        const active = path === t.href;
        return (
          <Link key={t.href} href={t.href} className={"tab" + (active ? " active" : "")}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
