"use server";

import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { createRemnawaveUser } from "@/lib/remnawave/client";
import { VpnPlan, vpnPlansFromStore } from "@/lib/remnawave/plans";
import { VpnOrder, vpnOrdersFromStore } from "@/lib/vpn/orders";
import { recordWorkspaceActivity } from "@/lib/workspace/activity";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const text = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();

async function workspaceAccess(slug: string, ownerOnly = false) {
  const session = await getSession();
  const workspace = session?.user.id
    ? await prisma.project.findFirst({
        where: {
          slug,
          users: {
            some: {
              userId: session.user.id,
              role: ownerOnly ? "owner" : { in: ["owner", "member"] },
            },
          },
        },
        select: { id: true, store: true },
      })
    : null;
  if (!workspace) {
    throw new Error(
      ownerOnly
        ? "Workspace owner access required"
        : "Business editor access required",
    );
  }
  return { ...workspace, actorUserId: session!.user.id };
}

async function mutateOrders(
  projectId: string,
  mutate: (orders: VpnOrder[]) => VpnOrder[],
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
    const vpnOrders = mutate(vpnOrdersFromStore(store));
    await tx.project.update({
      where: { id: projectId },
      data: { store: { ...store, vpnOrders } as Prisma.InputJsonValue },
    });
  });
}

function findPlan(plans: VpnPlan[], planId: string, allowArchived = false) {
  const plan = plans.find(
    (item) => item.id === planId && (allowArchived || !item.archived),
  );
  if (!plan) throw new Error("Selected plan is unavailable");
  return plan;
}

export async function createVpnOrder(formData: FormData) {
  const slug = text(formData, "slug");
  const workspace = await workspaceAccess(slug);
  const customerEmail = text(formData, "customerEmail").toLowerCase();
  if (!customerEmail.includes("@")) throw new Error("Enter a valid email");
  const plan = findPlan(
    vpnPlansFromStore(workspace.store),
    text(formData, "planId"),
  );
  const now = new Date().toISOString();
  const order: VpnOrder = {
    id: crypto.randomUUID(),
    customerName: text(formData, "customerName").slice(0, 80),
    customerEmail: customerEmail.slice(0, 160),
    planId: plan.id,
    planName: plan.name,
    amount: plan.price,
    currency: "USD",
    paymentStatus: "pending",
    fulfillmentStatus: "pending",
    subscriberUsername: "",
    note: text(formData, "note").slice(0, 300),
    createdAt: now,
    updatedAt: now,
  };
  await mutateOrders(workspace.id, (orders) => [order, ...orders]);
  await recordWorkspaceActivity({
    workspaceId: workspace.id,
    userId: workspace.actorUserId,
    action: "created",
    resourceType: "vpn_order",
    resourceId: order.id,
    description: `Created order for ${order.customerEmail}`,
    changeSet: { planName: order.planName, amount: order.amount },
  });
  revalidatePath(`/${slug}/vpn/orders`);
  revalidatePath(`/${slug}/vpn/activity`);
}

export async function updateVpnOrder(formData: FormData) {
  const slug = text(formData, "slug");
  const workspace = await workspaceAccess(slug);
  const id = text(formData, "id");
  const requestedStatus = text(formData, "paymentStatus");
  const paymentStatus = (
    ["pending", "paid", "refunded", "canceled"].includes(requestedStatus)
      ? requestedStatus
      : "pending"
  ) as VpnOrder["paymentStatus"];
  await mutateOrders(workspace.id, (orders) =>
    orders.map((order) =>
      order.id === id
        ? {
            ...order,
            paymentStatus,
            note: text(formData, "note").slice(0, 300),
            updatedAt: new Date().toISOString(),
          }
        : order,
    ),
  );
  await recordWorkspaceActivity({
    workspaceId: workspace.id,
    userId: workspace.actorUserId,
    action: "updated",
    resourceType: "vpn_order",
    resourceId: id,
    description: `Changed order payment status to ${paymentStatus}`,
    changeSet: { paymentStatus },
  });
  revalidatePath(`/${slug}/vpn/orders`);
  revalidatePath(`/${slug}/vpn/activity`);
}

export async function fulfillVpnOrder(formData: FormData) {
  const slug = text(formData, "slug");
  const workspace = await workspaceAccess(slug, true);
  const id = text(formData, "id");
  const orders = vpnOrdersFromStore(workspace.store);
  const order = orders.find((item) => item.id === id);
  if (!order || order.fulfillmentStatus === "fulfilled") {
    throw new Error("Order is unavailable or already fulfilled");
  }
  if (order.paymentStatus !== "paid") {
    throw new Error("Mark the order as paid before provisioning access");
  }
  const plan = findPlan(vpnPlansFromStore(workspace.store), order.planId, true);
  const username = text(formData, "subscriberUsername")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .slice(0, 36);
  if (username.length < 3) throw new Error("Enter a username");

  const subscriber = await createRemnawaveUser({
    username,
    email: order.customerEmail,
    description: `Detz order ${order.id}`,
    expireAt: new Date(
      Date.now() + plan.durationDays * 24 * 60 * 60 * 1000,
    ).toISOString(),
    trafficLimitBytes: plan.trafficGb * 1024 ** 3,
    trafficLimitStrategy: plan.reset,
    hwidDeviceLimit: plan.devices,
  });

  await mutateOrders(workspace.id, (current) =>
    current.map((item) =>
      item.id === id
        ? {
            ...item,
            fulfillmentStatus: "fulfilled",
            subscriberUsername: username,
            subscriberUuid: subscriber.response.uuid,
            updatedAt: new Date().toISOString(),
          }
        : item,
    ),
  );
  await recordWorkspaceActivity({
    workspaceId: workspace.id,
    userId: workspace.actorUserId,
    action: "fulfilled",
    resourceType: "vpn_order",
    resourceId: id,
    description: `Provisioned VPN access for ${order.customerEmail}`,
    changeSet: {
      subscriberUsername: username,
      subscriberUuid: subscriber.response.uuid,
    },
  });
  revalidatePath(`/${slug}/vpn/orders`);
  revalidatePath(`/${slug}/vpn/activity`);
  revalidatePath(`/${slug}/operations/users`);
}
