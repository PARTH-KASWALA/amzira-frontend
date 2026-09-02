"use client";

import { usePathname } from "next/navigation";
import { SellerGuard } from "@/components/seller/seller-guard";
import { SellerShell } from "@/components/seller/seller-shell";

export function SellerArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/seller/login") return children;
  return (
    <SellerGuard>
      <SellerShell>{children}</SellerShell>
    </SellerGuard>
  );
}
