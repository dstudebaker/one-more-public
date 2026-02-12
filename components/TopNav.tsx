"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Make Now" },
  { href: "/with", label: "All Recipes" }, // renamed
  { href: "/inventory", label: "Inventory" },
];

export function TopNav() {
  const path = usePathname() || "/";

  return (
    <div className="topNav">
      <div className="topNavInner">
        {tabs.map((t) => {
          const active = path === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={active ? "tab active" : "tab"}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
