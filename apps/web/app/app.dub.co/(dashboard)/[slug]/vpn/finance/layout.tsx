import { requirePlatformAccess } from "@/lib/platform-access-server";
import { ReactNode } from "react";

export default async function FinanceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requirePlatformAccess(slug, "finance");
  return children;
}
