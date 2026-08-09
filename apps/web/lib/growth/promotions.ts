import "server-only";

import { prisma } from "@/lib/prisma";

export type GrowthPromotion = {
  id: string;
  code: string;
  description: string;
  audience: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  maxRedemptions: number;
  redemptions: number;
};

export function promotionsFromStore(store: unknown): GrowthPromotion[] {
  if (!store || typeof store !== "object" || Array.isArray(store)) return [];
  const promotions = (store as { growthPromotions?: unknown }).growthPromotions;
  return Array.isArray(promotions) ? (promotions as GrowthPromotion[]) : [];
}

export async function getGrowthPromotions(slug: string) {
  const workspace = await prisma.project.findUniqueOrThrow({
    where: { slug },
    select: { store: true },
  });
  return promotionsFromStore(workspace.store);
}
