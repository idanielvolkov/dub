import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  canAccessPlatformArea,
  getPlatformAccess,
  PlatformAccessLevel,
  PlatformArea,
} from "./platform-access";

export async function requirePlatformAccess(
  slug: string,
  area: PlatformArea,
  minimum: Exclude<PlatformAccessLevel, "none"> = "view",
) {
  const session = await getSession();
  if (!session?.user.id) redirect("/login");

  const membership = await prisma.projectUsers.findFirst({
    where: { project: { slug }, userId: session.user.id },
    select: { role: true, workspacePreferences: true },
  });

  if (!membership) redirect("/login");
  if (
    !canAccessPlatformArea({
      role: membership.role,
      workspacePreferences: membership.workspacePreferences,
      area,
      minimum,
    })
  ) {
    const access = getPlatformAccess(
      membership.role,
      membership.workspacePreferences,
    );
    const destination =
      access.workspace !== "none"
        ? `/${slug}/vpn`
        : access.support !== "none"
          ? `/${slug}/vpn/support`
          : access.finance !== "none"
            ? `/${slug}/vpn/finance`
            : access.remnawave !== "none"
              ? `/${slug}/operations`
              : access.marketing !== "none"
                ? `/${slug}/growth`
                : "/account/settings";
    redirect(destination);
  }

  return membership;
}

export async function authorizePlatformAction(
  slug: string,
  area: PlatformArea,
  minimum: Exclude<PlatformAccessLevel, "none"> = "manage",
) {
  const session = await getSession();
  if (!session?.user.id) throw new Error("Authentication required");

  const membership = await prisma.projectUsers.findFirst({
    where: { project: { slug }, userId: session.user.id },
    select: {
      role: true,
      workspacePreferences: true,
      projectId: true,
    },
  });
  if (
    !membership ||
    !canAccessPlatformArea({
      role: membership.role,
      workspacePreferences: membership.workspacePreferences,
      area,
      minimum,
    })
  ) {
    throw new Error(`You do not have ${minimum} access to ${area}`);
  }

  return {
    projectId: membership.projectId,
    userId: session.user.id,
    role: membership.role,
  };
}
