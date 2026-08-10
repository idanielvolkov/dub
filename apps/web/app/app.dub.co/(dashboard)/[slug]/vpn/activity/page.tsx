import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { ActivityTable } from "@/ui/vpn/activity-table";

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, session] = await Promise.all([params, getSession()]);
  const workspace = await prisma.project.findFirstOrThrow({
    where: { slug, users: { some: { userId: session?.user.id } } },
    select: { id: true },
  });
  const activity = await prisma.activityLog.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return (
    <PageContent
      title="Activity"
      titleInfo={{ title: "Review changes made across this workspace." }}
    >
      <PageWidthWrapper className="pb-10">
        <ActivityTable
          activity={activity.map((item) => ({
            ...item,
            description: item.description || "",
            createdAt: item.createdAt.toISOString(),
          }))}
        />
      </PageWidthWrapper>
    </PageContent>
  );
}
