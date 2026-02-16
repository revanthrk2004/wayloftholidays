"use client";

import { usePathname } from "next/navigation";

export default function RouteGate({
  children,
  showOnHomeOnly = false,
  hideOnStudio = true,
}: {
  children: React.ReactNode;
  showOnHomeOnly?: boolean;
  hideOnStudio?: boolean;
}) {
  const pathname = usePathname();

  const isStudio = pathname?.startsWith("/studio");
  const isHome = pathname === "/";

  if (hideOnStudio && isStudio) return null;
  if (showOnHomeOnly && !isHome) return null;

  return <>{children}</>;
}
