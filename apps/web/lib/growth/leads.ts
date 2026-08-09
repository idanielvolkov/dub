import "server-only";

import { prisma } from "@/lib/prisma";

export type GrowthLeadMeta = {
  status: "new" | "contacted" | "qualified" | "won" | "lost";
  owner: string;
  note: string;
};

export type GrowthLeadMetaMap = Record<string, GrowthLeadMeta>;

export function leadMetaFromStore(store: unknown): GrowthLeadMetaMap {
  if (!store || typeof store !== "object" || Array.isArray(store)) return {};
  const value = (store as { growthLeadMeta?: unknown }).growthLeadMeta;
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as GrowthLeadMetaMap)
    : {};
}

export async function getGrowthLeads(slug: string) {
  const workspace = await prisma.project.findUniqueOrThrow({
    where: { slug },
    select: {
      store: true,
      customers: {
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          name: true,
          email: true,
          country: true,
          sales: true,
          saleAmount: true,
          createdAt: true,
          link: { select: { title: true, shortLink: true } },
        },
      },
    },
  });
  const metadata = leadMetaFromStore(workspace.store);
  return workspace.customers.map((lead) => ({
    ...lead,
    meta: metadata[lead.id] || {
      status: lead.sales > 0 ? "won" : "new",
      owner: "",
      note: "",
    },
  }));
}
