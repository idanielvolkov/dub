"use server";

import { createId } from "@/lib/api/create-id";
import { getSession } from "@/lib/auth/utils";
import { GrowthLeadMeta, leadMetaFromStore } from "@/lib/growth/leads";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const text = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();

async function editorWorkspace(slug: string) {
  const session = await getSession();
  const workspace = session?.user.id
    ? await prisma.project.findFirst({
        where: {
          slug,
          users: {
            some: {
              userId: session.user.id,
              role: { in: ["owner", "member"] },
            },
          },
        },
        select: { id: true },
      })
    : null;
  if (!workspace) throw new Error("Growth editor access required");
  return workspace;
}

function meta(formData: FormData): GrowthLeadMeta {
  const requested = text(formData, "status");
  const status = ["new", "contacted", "qualified", "won", "lost"].includes(
    requested,
  )
    ? (requested as GrowthLeadMeta["status"])
    : "new";
  return {
    status,
    owner: text(formData, "owner").slice(0, 80),
    note: text(formData, "note").slice(0, 500),
  };
}

async function saveMeta(
  projectId: string,
  leadId: string,
  value: GrowthLeadMeta,
) {
  await prisma.$transaction(async (tx) => {
    const workspace = await tx.project.findUniqueOrThrow({
      where: { id: projectId },
      select: { store: true },
    });
    const store = (
      workspace.store &&
      typeof workspace.store === "object" &&
      !Array.isArray(workspace.store)
        ? workspace.store
        : {}
    ) as Record<string, Prisma.JsonValue>;
    const growthLeadMeta = { ...leadMetaFromStore(store), [leadId]: value };
    await tx.project.update({
      where: { id: projectId },
      data: { store: { ...store, growthLeadMeta } as Prisma.InputJsonValue },
    });
  });
}

export async function createGrowthLead(formData: FormData) {
  const slug = text(formData, "slug");
  const workspace = await editorWorkspace(slug);
  const email = text(formData, "email").toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email))
    throw new Error("Enter a valid email address");
  const lead = await prisma.customer.create({
    data: {
      id: createId({ prefix: "cus_" }),
      projectId: workspace.id,
      email,
      name: text(formData, "name").slice(0, 100) || null,
      country: text(formData, "country").toUpperCase().slice(0, 2) || null,
    },
  });
  await saveMeta(workspace.id, lead.id, meta(formData));
  revalidatePath(`/${slug}/growth/leads`);
}

export async function updateGrowthLead(formData: FormData) {
  const slug = text(formData, "slug");
  const workspace = await editorWorkspace(slug);
  const id = text(formData, "id");
  const exists = await prisma.customer.findFirst({
    where: { id, projectId: workspace.id },
    select: { id: true },
  });
  if (!exists) throw new Error("Lead not found");
  await saveMeta(workspace.id, id, meta(formData));
  revalidatePath(`/${slug}/growth/leads`);
}
