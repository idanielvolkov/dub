import "server-only";

import { prisma } from "@/lib/prisma";

export async function getGrowthWorkspace(slug: string) {
  const workspace = await prisma.project.findUniqueOrThrow({
    where: { slug },
    select: { id: true, name: true },
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
      },
    }),
  ]);

  return { workspace, totals, campaigns };
}
