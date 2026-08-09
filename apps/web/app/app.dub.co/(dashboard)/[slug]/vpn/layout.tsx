import { requirePlatformAccess } from "@/lib/platform-access-server";
import { ReactNode } from "react";

export default async function WorkspaceAreaLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requirePlatformAccess(slug, "workspace");
  return children;
}
