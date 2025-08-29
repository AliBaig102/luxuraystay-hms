"use client";

import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface Tab {
  label: string;
  href: string;
}

interface TabsProps {
  tabs: Tab[];
  basePath: string;
}

export function Tabs({ tabs }: TabsProps) {
  const location = useLocation();

  return (
    <div className="border-b">
      <nav className="flex overflow-x-auto px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                "inline-flex min-w-fit items-center border-b-2 px-4 py-3 text-sm font-medium",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
