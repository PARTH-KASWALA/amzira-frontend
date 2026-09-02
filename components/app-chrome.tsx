"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSellerArea = pathname.startsWith("/seller");

  return (
    <>
      <a
        href="#main"
        className="focus-ring sr-only rounded-md bg-white px-4 py-3 text-charcoal focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
      >
        Skip to content
      </a>
      {isSellerArea ? null : <SiteHeader />}
      <main id="main">{children}</main>
      {isSellerArea ? null : <SiteFooter />}
    </>
  );
}
