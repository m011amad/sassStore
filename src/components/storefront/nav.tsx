import Link from "next/link";
import { CartSheet } from "./cart-sheet";
import { NavSearch } from "./nav-search";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { Suspense } from "react";
import { ShoppingBag } from "lucide-react";

interface StorefrontNavProps {
  storeName: string;
  logoUrl?: string;
  tagline?: string;
  tenantId: string;
}

export function StorefrontNav({
  storeName,
  logoUrl,
  tagline,
  tenantId,
}: StorefrontNavProps) {
  return (
    <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo + tagline */}
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={storeName}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <ShoppingBag className="size-5 text-primary" />
          )}
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">
              {storeName}
            </span>
            {tagline && (
              <span className="hidden text-[11px] text-muted-foreground sm:block">
                {tagline}
              </span>
            )}
          </div>
        </Link>

        {/* Search */}
        <div className="flex flex-1 justify-center">
          <Suspense>
            <NavSearch />
          </Suspense>
        </div>

        {/* Theme toggle + Cart */}
        <ThemeToggle />
        <CartSheet tenantId={tenantId} />
      </div>
    </nav>
  );
}
