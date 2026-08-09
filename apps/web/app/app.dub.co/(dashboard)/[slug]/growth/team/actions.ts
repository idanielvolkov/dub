"use server";

import { hashToken } from "@/lib/auth/hash-token";
import { getSession } from "@/lib/auth/utils";
import {
  PLATFORM_ACCESS_TEMPLATES,
  PLATFORM_AREAS,
  PlatformAccessLevel,
  PlatformAccessTemplate,
} from "@/lib/platform-access";
import { prisma } from "@/lib/prisma";
import { recordWorkspaceActivity } from "@/lib/workspace/activity";
import { sendEmail } from "@dub/email";
import { Prisma, WorkspaceRole } from "@prisma/client";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

const text = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();

const teamRole = (value: string): Exclude<WorkspaceRole, "owner"> =>
  value === "viewer" || value === "billing" ? value : "member";

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
  const role = teamRole(text(formData, "role"));
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
    subject: `Invitation to ${workspace.name}`,
    text: `${session.user.name || session.user.email} invited you to ${workspace.name} as ${role}. Open this secure link within 14 days: ${inviteUrl}`,
    replyTo: "noreply",
  });
  await recordWorkspaceActivity({
    workspaceId: workspace.id,
    userId: session.user.id,
    action: "invited",
    resourceType: "workspace_member",
    resourceId: email,
    description: `Invited ${email} to the workspace`,
    changeSet: { role },
  });
  revalidatePath(`/${slug}/growth/team`);
  revalidatePath(`/${slug}/vpn/activity`);
}

export async function changeGrowthMemberRole(formData: FormData) {
  const slug = text(formData, "slug");
  const { workspace, session } = await ownerContext(slug);
  const role = teamRole(text(formData, "role"));
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
  await recordWorkspaceActivity({
    workspaceId: workspace.id,
    userId: session.user.id,
    action: "updated",
    resourceType: "workspace_member",
    resourceId: text(formData, "userId"),
    description: `Changed a team member role to ${role}`,
    changeSet: { role },
  });
  revalidatePath(`/${slug}/growth/team`);
  revalidatePath(`/${slug}/vpn/activity`);
}

export async function changeMemberAccess(formData: FormData) {
  const slug = text(formData, "slug");
  const { workspace, session } = await ownerContext(slug);
  const userId = text(formData, "userId");
  const current = await prisma.projectUsers.findUniqueOrThrow({
    where: { userId_projectId: { userId, projectId: workspace.id } },
    select: { role: true, workspacePreferences: true },
  });
  if (current.role === "owner") return;

  const allowedLevels = new Set<PlatformAccessLevel>([
    "none",
    "view",
    "manage",
  ]);
  const requestedTemplate = text(formData, "accessTemplate");
  const accessTemplate: PlatformAccessTemplate =
    requestedTemplate in PLATFORM_ACCESS_TEMPLATES
      ? (requestedTemplate as PlatformAccessTemplate)
      : "custom";
  const templateAccess = PLATFORM_ACCESS_TEMPLATES[accessTemplate];
  const platformAccess =
    templateAccess ||
    Object.fromEntries(
      PLATFORM_AREAS.map((area) => {
        const value = text(formData, area) as PlatformAccessLevel;
        return [area, allowedLevels.has(value) ? value : "none"];
      }),
    );
  const preferences =
    current.workspacePreferences &&
    typeof current.workspacePreferences === "object" &&
    !Array.isArray(current.workspacePreferences)
      ? current.workspacePreferences
      : {};

  await prisma.projectUsers.update({
    where: { userId_projectId: { userId, projectId: workspace.id } },
    data: {
      workspacePreferences: {
        ...(preferences as Record<string, Prisma.JsonValue>),
        platformAccess,
        accessTemplate,
        jobTitle: text(formData, "jobTitle") || null,
      },
    },
  });
  await recordWorkspaceActivity({
    workspaceId: workspace.id,
    userId: session.user.id,
    action: "updated",
    resourceType: "workspace_access",
    resourceId: userId,
    description: `Updated team access for ${text(formData, "jobTitle") || "a workspace member"}`,
    changeSet: {
      platformAccess,
      accessTemplate,
      jobTitle: text(formData, "jobTitle") || null,
    },
  });
  revalidatePath(`/${slug}/growth/team`);
  revalidatePath(`/${slug}/vpn/activity`);
}

export async function removeGrowthMember(formData: FormData) {
  const slug = text(formData, "slug");
  const { workspace, session } = await ownerContext(slug);
  const userId = text(formData, "userId");
  await prisma.projectUsers.delete({
    where: {
      userId_projectId: {
        userId,
        projectId: workspace.id,
      },
      role: { not: "owner" },
    },
  });
  await recordWorkspaceActivity({
    workspaceId: workspace.id,
    userId: session.user.id,
    action: "removed",
    resourceType: "workspace_member",
    resourceId: userId,
    description: "Removed a team member from the workspace",
  });
  revalidatePath(`/${slug}/growth/team`);
  revalidatePath(`/${slug}/vpn/activity`);
}

export async function revokeGrowthInvite(formData: FormData) {
  const slug = text(formData, "slug");
  const { workspace, session } = await ownerContext(slug);
  const email = text(formData, "email");
  await prisma.projectInvite.delete({
    where: {
      email_projectId: {
        email,
        projectId: workspace.id,
      },
    },
  });
  await recordWorkspaceActivity({
    workspaceId: workspace.id,
    userId: session.user.id,
    action: "revoked",
    resourceType: "workspace_invite",
    resourceId: email,
    description: `Revoked the invitation for ${email}`,
  });
  revalidatePath(`/${slug}/growth/team`);
  revalidatePath(`/${slug}/vpn/activity`);
}
