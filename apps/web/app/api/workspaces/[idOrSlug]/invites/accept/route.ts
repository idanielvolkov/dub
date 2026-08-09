import { DubApiError } from "@/lib/api/errors";
import { withSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const POST = withSession(async ({ session, params }) => {
  const { idOrSlug: slug } = params;
  const invite = await prisma.projectInvite.findFirst({
    where: { email: session.user.email, project: { slug } },
    include: { project: { select: { id: true, slug: true } } },
  });

  if (!invite) {
    throw new DubApiError({ code: "not_found", message: "Invite not found." });
  }
  if (invite.expires < new Date()) {
    throw new DubApiError({ code: "invite_expired", message: "Invite expired." });
  }

  await prisma.$transaction(async (tx) => {
    await tx.projectUsers.upsert({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: invite.project.id,
        },
      },
      create: {
        userId: session.user.id,
        projectId: invite.project.id,
        role: invite.role,
        notificationPreference: { create: {} },
      },
      update: { role: invite.role },
    });
    await tx.projectInvite.delete({
      where: {
        email_projectId: {
          email: session.user.email,
          projectId: invite.project.id,
        },
      },
    });
    if (!session.user.defaultWorkspace) {
      await tx.user.update({
        where: { id: session.user.id },
        data: { defaultWorkspace: invite.project.slug },
      });
    }
  });

  return NextResponse.json({ message: "Invite accepted." });
});
