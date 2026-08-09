import "server-only";

import { prisma } from "@/lib/prisma";

export type VpnOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  amount: number;
  currency: "USD";
  paymentStatus: "pending" | "paid" | "refunded" | "canceled";
  fulfillmentStatus: "pending" | "fulfilled";
  subscriberUsername: string;
  subscriberUuid?: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export function vpnOrdersFromStore(store: unknown): VpnOrder[] {
  if (!store || typeof store !== "object" || Array.isArray(store)) return [];
  const value = (store as { vpnOrders?: unknown }).vpnOrders;
  return Array.isArray(value) ? (value as VpnOrder[]) : [];
}

export async function getVpnOrders(slug: string) {
  const workspace = await prisma.project.findUniqueOrThrow({
    where: { slug },
    select: { store: true },
  });
  return vpnOrdersFromStore(workspace.store);
}
