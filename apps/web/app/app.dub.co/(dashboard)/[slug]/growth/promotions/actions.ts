"use server";

import { getSession } from "@/lib/auth";
import { GrowthPromotion, promotionsFromStore } from "@/lib/growth/promotions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const text = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();

async function workspaceId(slug: string) {
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
  if (!workspace) throw new Error("Unauthorized workspace access");
  return workspace.id;
}

function values(
  formData: FormData,
): Omit<GrowthPromotion, "id" | "redemptions"> {
  const discountType =
    text(formData, "discountType") === "fixed" ? "fixed" : "percentage";
  const rawValue = Math.max(0, Number(formData.get("discountValue")) || 0);
  return {
    code: text(formData, "code")
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "")
      .slice(0, 32),
    description: text(formData, "description").slice(0, 140),
    audience: text(formData, "audience").slice(0, 80),
    discountType,
    discountValue:
      discountType === "percentage" ? Math.min(100, rawValue) : rawValue,
    active: formData.get("active") === "on",
    startsAt: text(formData, "startsAt") || null,
    endsAt: text(formData, "endsAt") || null,
    maxRedemptions: Math.max(0, Number(formData.get("maxRedemptions")) || 0),
  };
}

async function mutatePromotions(
  projectId: string,
  mutate: (items: GrowthPromotion[]) => GrowthPromotion[],
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
    const growthPromotions = mutate(promotionsFromStore(store));
    await tx.project.update({
      where: { id: projectId },
      data: { store: { ...store, growthPromotions } as Prisma.InputJsonValue },
    });
  });
}

export async function createPromotion(formData: FormData) {
  const slug = text(formData, "slug");
  const projectId = await workspaceId(slug);
  const promotion = values(formData);
  if (promotion.code.length < 3)
    throw new Error("Promo code must contain at least 3 characters");
  await mutatePromotions(projectId, (items) => {
    if (items.some((item) => item.code === promotion.code))
      throw new Error("Promo code already exists");
    return [
      { id: crypto.randomUUID(), redemptions: 0, ...promotion },
      ...items,
    ];
  });
  revalidatePath(`/${slug}/growth/promotions`);
}

export async function updatePromotion(formData: FormData) {
  const slug = text(formData, "slug");
  const projectId = await workspaceId(slug);
  const id = text(formData, "id");
  const promotion = values(formData);
  await mutatePromotions(projectId, (items) =>
    items.map((item) => (item.id === id ? { ...item, ...promotion } : item)),
  );
  revalidatePath(`/${slug}/growth/promotions`);
}

export async function deletePromotion(formData: FormData) {
  const slug = text(formData, "slug");
  const projectId = await workspaceId(slug);
  const id = text(formData, "id");
  await mutatePromotions(projectId, (items) =>
    items.filter((item) => item.id !== id),
  );
  revalidatePath(`/${slug}/growth/promotions`);
}
