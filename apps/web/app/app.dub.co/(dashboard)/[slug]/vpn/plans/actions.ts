"use server";

import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { createRemnawaveUser } from "@/lib/remnawave/client";
import {
  VpnPlan,
  VpnPlanReset,
  vpnPlansFromStore,
} from "@/lib/remnawave/plans";
import { recordWorkspaceActivity } from "@/lib/workspace/activity";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const text = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();

async function ownerWorkspace(slug: string) {
  const session = await getSession();
  const workspace = session?.user.id
    ? await prisma.project.findFirst({
        where: {
          slug,
          users: { some: { userId: session.user.id, role: "owner" } },
        },
        select: { id: true },
      })
    : null;
  if (!workspace) throw new Error("Workspace owner access required");
  return { projectId: workspace.id, userId: session!.user.id };
}

function planValues(formData: FormData) {
  const reset = text(formData, "reset");
  return {
    name: text(formData, "name").slice(0, 50),
    description: text(formData, "description").slice(0, 240),
    price: Number(text(formData, "price")),
    durationDays: Number(text(formData, "durationDays")),
    trafficGb: Number(text(formData, "trafficGb")),
    devices: Number(text(formData, "devices")),
    reset: (["NO_RESET", "DAY", "WEEK", "MONTH"].includes(reset)
      ? reset
      : "MONTH") as VpnPlanReset,
    featured: formData.get("featured") === "on",
  };
}

function validatePlan(values: ReturnType<typeof planValues>) {
  if (values.name.length < 2) throw new Error("Plan name is too short");
  if (!Number.isFinite(values.price) || values.price < 0)
    throw new Error("Enter a valid price");
  if (!Number.isInteger(values.durationDays) || values.durationDays < 1)
    throw new Error("Enter a valid duration");
  if (!Number.isFinite(values.trafficGb) || values.trafficGb < 1)
    throw new Error("Enter a valid traffic limit");
  if (!Number.isInteger(values.devices) || values.devices < 1)
    throw new Error("Enter a valid device limit");
}

async function mutatePlans(
  projectId: string,
  mutate: (plans: VpnPlan[]) => VpnPlan[],
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
    const vpnPlans = mutate(vpnPlansFromStore(store));
    await tx.project.update({
      where: { id: projectId },
      data: { store: { ...store, vpnPlans } as Prisma.InputJsonValue },
    });
  });
}

export async function createVpnPlan(formData: FormData) {
  const slug = text(formData, "slug");
  const { projectId, userId } = await ownerWorkspace(slug);
  const values = planValues(formData);
  validatePlan(values);
  const plan: VpnPlan = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    archived: false,
    ...values,
  };
  await mutatePlans(projectId, (plans) => [
    ...plans.map((plan) =>
      values.featured ? { ...plan, featured: false } : plan,
    ),
    plan,
  ]);
  await recordWorkspaceActivity({
    workspaceId: projectId,
    userId,
    action: "created",
    resourceType: "vpn_plan",
    resourceId: plan.id,
    description: `Created ${plan.name} plan`,
    changeSet: {
      price: plan.price,
      durationDays: plan.durationDays,
      trafficGb: plan.trafficGb,
      devices: plan.devices,
    },
  });
  revalidatePath(`/${slug}/vpn/plans`);
  revalidatePath(`/${slug}/vpn/activity`);
}

export async function updateVpnPlan(formData: FormData) {
  const slug = text(formData, "slug");
  const { projectId, userId } = await ownerWorkspace(slug);
  const id = text(formData, "id");
  const values = planValues(formData);
  validatePlan(values);
  await mutatePlans(projectId, (plans) =>
    plans.map((plan) => {
      if (plan.id === id) return { ...plan, ...values };
      return values.featured ? { ...plan, featured: false } : plan;
    }),
  );
  await recordWorkspaceActivity({
    workspaceId: projectId,
    userId,
    action: "updated",
    resourceType: "vpn_plan",
    resourceId: id,
    description: `Updated ${values.name} plan`,
    changeSet: values,
  });
  revalidatePath(`/${slug}/vpn/plans`);
  revalidatePath(`/${slug}/vpn/activity`);
}

export async function setVpnPlanArchived(formData: FormData) {
  const slug = text(formData, "slug");
  const { projectId, userId } = await ownerWorkspace(slug);
  const id = text(formData, "id");
  const archived = text(formData, "archived") === "true";
  await mutatePlans(projectId, (plans) =>
    plans.map((plan) =>
      plan.id === id
        ? { ...plan, archived, featured: archived ? false : plan.featured }
        : plan,
    ),
  );
  await recordWorkspaceActivity({
    workspaceId: projectId,
    userId,
    action: archived ? "archived" : "restored",
    resourceType: "vpn_plan",
    resourceId: id,
    description: `${archived ? "Archived" : "Restored"} a VPN plan`,
    changeSet: { archived },
  });
  revalidatePath(`/${slug}/vpn/plans`);
  revalidatePath(`/${slug}/vpn/activity`);
}

export async function provisionPlan(formData: FormData) {
  const slug = text(formData, "slug");
  const { projectId, userId } = await ownerWorkspace(slug);
  const username = text(formData, "username")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .slice(0, 36);
  if (username.length < 3)
    throw new Error("Enter at least 3 characters for the username");

  const workspace = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { store: true },
  });
  const plan = vpnPlansFromStore(workspace.store).find(
    (item) => item.id === text(formData, "planId") && !item.archived,
  );
  if (!plan) throw new Error("This plan is unavailable");

  const subscriber = await createRemnawaveUser({
    username,
    expireAt: new Date(
      Date.now() + plan.durationDays * 24 * 60 * 60 * 1000,
    ).toISOString(),
    trafficLimitBytes: plan.trafficGb * 1024 ** 3,
    trafficLimitStrategy: plan.reset,
    hwidDeviceLimit: plan.devices,
  });
  await recordWorkspaceActivity({
    workspaceId: projectId,
    userId,
    action: "provisioned",
    resourceType: "vpn_plan",
    resourceId: plan.id,
    description: `Provisioned ${plan.name} access for ${username}`,
    changeSet: { username, subscriberUuid: subscriber.response.uuid },
  });
  redirect(`/${slug}/operations/users`);
}
