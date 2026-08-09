import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function recordWorkspaceActivity({
  workspaceId,
  userId,
  action,
  resourceType,
  resourceId,
  description,
  changeSet,
}: {
  workspaceId: string;
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  description: string;
  changeSet?: Record<string, unknown>;
}) {
  await prisma.activityLog.create({
    data: {
      workspaceId,
      programId: workspaceId,
      userId: userId || null,
      action,
      resourceType,
      resourceId,
      description,
      changeSet: changeSet
        ? (changeSet as Prisma.InputJsonValue)
        : undefined,
    },
  });
}
