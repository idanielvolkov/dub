"use server";

import { getSession } from "@/lib/auth/utils";
import { canAccessPlatformArea } from "@/lib/platform-access";
import { prisma } from "@/lib/prisma";
import { SupportTicket, supportTicketsFromStore } from "@/lib/vpn/support";
import { recordWorkspaceActivity } from "@/lib/workspace/activity";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const text = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();

async function context(slug: string) {
  const session = await getSession();
  const workspace = session?.user.id
    ? await prisma.project.findFirst({
        where: {
          slug,
          users: { some: { userId: session.user.id } },
        },
        select: {
          id: true,
          users: {
            where: { userId: session.user.id },
            select: { role: true, workspacePreferences: true },
          },
        },
      })
    : null;
  const membership = workspace?.users[0];
  if (
    !workspace ||
    !session?.user.id ||
    !membership ||
    !canAccessPlatformArea({
      role: membership.role,
      workspacePreferences: membership.workspacePreferences,
      area: "support",
      minimum: "manage",
    })
  )
    throw new Error("Workspace editor access required");
  return { workspace, userId: session.user.id };
}

async function mutateTickets(
  projectId: string,
  mutate: (tickets: SupportTicket[]) => SupportTicket[],
) {
  await prisma.$transaction(async (tx) => {
    const project = await tx.project.findUniqueOrThrow({
      where: { id: projectId },
      select: { store: true },
    });
    const store = (
      project.store &&
      typeof project.store === "object" &&
      !Array.isArray(project.store)
        ? project.store
        : {}
    ) as Record<string, Prisma.JsonValue>;
    await tx.project.update({
      where: { id: projectId },
      data: {
        store: {
          ...store,
          supportTickets: mutate(supportTicketsFromStore(store)),
        } as Prisma.InputJsonValue,
      },
    });
  });
}

export async function createSupportTicket(formData: FormData) {
  const slug = text(formData, "slug");
  const { workspace, userId } = await context(slug);
  const email = text(formData, "customerEmail").toLowerCase();
  if (!email.includes("@")) throw new Error("Enter a valid customer email");
  const priority = (
    ["low", "normal", "high", "urgent"].includes(text(formData, "priority"))
      ? text(formData, "priority")
      : "normal"
  ) as SupportTicket["priority"];
  const ticket: SupportTicket = {
    id: crypto.randomUUID(),
    subject: text(formData, "subject").slice(0, 120),
    customerName: text(formData, "customerName").slice(0, 80),
    customerEmail: email.slice(0, 160),
    priority,
    status: "open",
    note: text(formData, "note").slice(0, 1000),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (!ticket.subject) throw new Error("Enter a ticket subject");
  await mutateTickets(workspace.id, (tickets) => [ticket, ...tickets]);
  await recordWorkspaceActivity({
    workspaceId: workspace.id,
    userId,
    action: "created",
    resourceType: "support_ticket",
    resourceId: ticket.id,
    description: `Created support ticket “${ticket.subject}”`,
  });
  revalidatePath(`/${slug}/vpn/support`);
  revalidatePath(`/${slug}/vpn/activity`);
}

export async function updateSupportTicket(formData: FormData) {
  const slug = text(formData, "slug");
  const { workspace, userId } = await context(slug);
  const id = text(formData, "id");
  const status = (
    ["open", "in_progress", "resolved"].includes(text(formData, "status"))
      ? text(formData, "status")
      : "open"
  ) as SupportTicket["status"];
  await mutateTickets(workspace.id, (tickets) =>
    tickets.map((ticket) =>
      ticket.id === id
        ? { ...ticket, status, updatedAt: new Date().toISOString() }
        : ticket,
    ),
  );
  await recordWorkspaceActivity({
    workspaceId: workspace.id,
    userId,
    action: "updated",
    resourceType: "support_ticket",
    resourceId: id,
    description: `Changed support ticket status to ${status.replace("_", " ")}`,
    changeSet: { status },
  });
  revalidatePath(`/${slug}/vpn/support`);
  revalidatePath(`/${slug}/vpn/activity`);
}
