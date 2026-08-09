import "server-only";

import { prisma } from "@/lib/prisma";

export type GrowthCampaignMeta = {
  status: "draft" | "active" | "paused" | "completed";
  budget: number;
  owner: string;
};

export function parseGrowthCampaignMeta(
  comments: string | null,
): GrowthCampaignMeta {
  if (!comments?.startsWith("GROWTH:"))
    return { status: "active", budget: 0, owner: "" };
  try {
    return JSON.parse(comments.slice(7)) as GrowthCampaignMeta;
  } catch {
    return { status: "active", budget: 0, owner: "" };
  }
}

export async function getGrowthWorkspace(slug: string) {
  const workspace = await prisma.project.findUniqueOrThrow({
    where: { slug },
    select: {
      id: true,
      name: true,
      domains: {
        where: { archived: false, verified: true },
        select: { slug: true },
        orderBy: [{ primary: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  const [totals, campaigns] = await Promise.all([
    prisma.link.aggregate({
      where: { projectId: workspace.id, archived: false },
      _count: { id: true },
      _sum: { clicks: true, leads: true, sales: true, saleAmount: true },
    }),
    prisma.link.findMany({
      where: { projectId: workspace.id, archived: false },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        url: true,
        shortLink: true,
        clicks: true,
        leads: true,
        sales: true,
        saleAmount: true,
        utm_campaign: true,
        createdAt: true,
        comments: true,
      },
    }),
  ]);

  return {
    workspace,
    totals,
    campaigns: campaigns.map((campaign) => ({
      ...campaign,
      meta: parseGrowthCampaignMeta(campaign.comments),
    })),
  };
}
