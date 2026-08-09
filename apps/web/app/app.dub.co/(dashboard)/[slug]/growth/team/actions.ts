"use server";

import { hashToken } from "@/lib/auth/hash-token";
import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@dub/email";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

const text = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();

async function ownerContext(slug: string) {
  const session = await getSession();
  if (!session?.user.id) throw new Error("Unauthorized");
  const workspace = await prisma.project.findFirst({
    where: {
      slug,
      users: { some: { userId: session.user.id, role: "owner" } },
    },
    select: { id: true, name: true, slug: true },
  });
  if (!workspace) throw new Error("Only workspace owners can manage the team");
  return { session, workspace };
}

export async function inviteGrowthMember(formData: FormData) {
  const slug = text(formData, "slug");
  const email = text(formData, "email").toLowerCase();
  const role = text(formData, "role") === "viewer" ? "viewer" : "member";
  const { session, workspace } = await ownerContext(slug);
  if (!/^\S+@\S+\.\S+$/.test(email))
    throw new Error("Enter a valid email address");

  const exists = await prisma.projectUsers.findFirst({
    where: { projectId: workspace.id, user: { email } },
  });
  if (exists) throw new Error("This person is already a workspace member");

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  await prisma.$transaction([
    prisma.projectInvite.upsert({
      where: { email_projectId: { email, projectId: workspace.id } },
      create: { email, role, expires, projectId: workspace.id },
      update: { role, expires },
    }),
    prisma.verificationToken.create({
      data: {
        identifier: email,
        token: await hashToken(token, { secret: true }),
        expires,
      },
    }),
  ]);

  const params = new URLSearchParams({
    callbackUrl: `${process.env.NEXTAUTH_URL}/${slug}/invite`,
    email,
    token,
  });
  const inviteUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback/email?${params}`;
  await sendEmail({
    to: email,
    subject: `Invitation to ${workspace.name} Growth Workspace`,
    text: `${session.user.name || session.user.email} invited you to the ${workspace.name} Growth Workspace as ${role}. Open this secure link within 14 days: ${inviteUrl}`,
    replyTo: "noreply",
  });
  revalidatePath(`/${slug}/growth/team`);
}

export async function changeGrowthMemberRole(formData: FormData) {
  const slug = text(formData, "slug");
  const { workspace } = await ownerContext(slug);
  const role = text(formData, "role") === "viewer" ? "viewer" : "member";
  await prisma.projectUsers.update({
    where: {
      userId_projectId: {
        userId: text(formData, "userId"),
        projectId: workspace.id,
      },
      role: { not: "owner" },
    },
    data: { role },
  });
  revalidatePath(`/${slug}/growth/team`);
}

export async function removeGrowthMember(formData: FormData) {
  const slug = text(formData, "slug");
  const { workspace } = await ownerContext(slug);
  await prisma.projectUsers.delete({
    where: {
      userId_projectId: {
        userId: text(formData, "userId"),
        projectId: workspace.id,
      },
      role: { not: "owner" },
    },
  });
  revalidatePath(`/${slug}/growth/team`);
}

export async function revokeGrowthInvite(formData: FormData) {
  const slug = text(formData, "slug");
  const { workspace } = await ownerContext(slug);
  await prisma.projectInvite.delete({
    where: {
      email_projectId: {
        email: text(formData, "email"),
        projectId: workspace.id,
      },
    },
  });
  revalidatePath(`/${slug}/growth/team`);
}
