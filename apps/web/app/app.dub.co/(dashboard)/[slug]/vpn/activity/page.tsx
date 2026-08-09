import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { UserAvatar } from "@/ui/users/user-avatar";
import { CardList, CardListCard, EmptyState } from "@dub/ui";
import { BookOpen } from "@dub/ui/icons";

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
        {activity.length ? (
          <CardList variant="compact">
            {activity.map((item) => (
              <CardListCard
                key={item.id}
                innerClassName="flex items-center gap-3 px-5 py-4"
                hoverStateEnabled={false}
              >
                <UserAvatar
                  user={
                    item.user || {
                      id: "system",
                      name: "System",
                      email: null,
                      image: null,
                    }
                  }
                  className="size-8 border-none"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-content-emphasis truncate text-sm font-medium">
                    {item.description || item.action}
                  </p>
                  <p className="text-content-subtle mt-0.5 text-xs">
                    {item.user?.name || item.user?.email || "System"} ·{" "}
                    {item.resourceType}
                  </p>
                </div>
                <time className="text-content-subtle whitespace-nowrap text-xs">
                  {item.createdAt.toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </CardListCard>
            ))}
          </CardList>
        ) : (
          <div className="py-16">
            <EmptyState
              icon={BookOpen}
              title="No activity yet"
              description="Workspace changes will appear here."
            />
          </div>
        )}
      </PageWidthWrapper>
    </PageContent>
  );
}
