"use client";

import { ErrorCodes } from "@/lib/api/error-codes";
import { canAccessPlatformArea } from "@/lib/platform-access";
import useWorkspace from "@/lib/swr/use-workspace";
import LayoutLoader from "@/ui/layout/layout-loader";
import { notFound, redirect, useParams, usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function WorkspaceAuth({ children }: { children: ReactNode }) {
  const { slug } = useParams();
  const pathname = usePathname();
  const workspace = useWorkspace();
  const { loading, error } = workspace;

  if (loading) {
    return <LayoutLoader />;
  }

  if (error) {
    if (error.status === ErrorCodes.not_found) {
      notFound();
    } else if (
      [ErrorCodes.invite_pending, ErrorCodes.invite_expired].includes(
        error.status,
      )
    ) {
      redirect(`/${slug}/invite`);
    }
  }

  const productPaths = ["vpn", "operations", "growth"];
  const isProductPath = productPaths.some((product) =>
    pathname.startsWith(`/${slug}/${product}`),
  );

  if (!isProductPath) {
    redirect(`/${slug}/vpn`);
  }

  const area = pathname.startsWith(`/${slug}/operations`)
    ? "remnawave"
    : pathname.startsWith(`/${slug}/growth`)
      ? "marketing"
      : "workspace";
  const allowed = canAccessPlatformArea({
    role: workspace.role || "member",
    workspacePreferences: workspace.users?.[0]?.workspacePreferences,
    area,
  });
  if (!allowed) {
    const firstAllowed = (
      ["workspace", "remnawave", "marketing"] as const
    ).find((candidate) =>
      canAccessPlatformArea({
        role: workspace.role || "member",
        workspacePreferences: workspace.users?.[0]?.workspacePreferences,
        area: candidate,
      }),
    );
    redirect(
      firstAllowed === "remnawave"
        ? `/${slug}/operations`
        : firstAllowed === "marketing"
          ? `/${slug}/growth`
          : `/${slug}/vpn`,
    );
  }

  return children;
}
