import { canAccessPlatformArea } from "@/lib/platform-access";
import { requirePlatformAccess } from "@/lib/platform-access-server";
import { getRemnawaveNodesState } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { NodesTable } from "@/ui/vpn/nodes-table";
import { ButtonLink, CardList, CardListCard, EmptyState } from "@dub/ui";
import { Refresh2, TriangleWarning } from "@dub/ui/icons";

export default async function NodesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, nodesState] = await Promise.all([
    params,
    getRemnawaveNodesState(),
  ]);
  const membership = await requirePlatformAccess(slug, "remnawave");
  const canManage = canAccessPlatformArea({
    role: membership.role,
    workspacePreferences: membership.workspacePreferences,
    area: "remnawave",
    minimum: "manage",
  });
  return (
    <PageContent
      title="Nodes"
      titleInfo={{ title: "Manage nodes connected to Remnawave." }}
    >
      <PageWidthWrapper className="pb-10">
        {nodesState.error ? (
          <CardList>
            <CardListCard
              hoverStateEnabled={false}
              innerClassName="flex min-h-96 items-center justify-center p-8"
            >
              <EmptyState
                icon={TriangleWarning}
                title="Remnawave is unavailable"
                description={nodesState.error}
              >
                <ButtonLink
                  href={`/${slug}/operations/nodes`}
                  variant="primary"
                >
                  <Refresh2 className="size-4" />
                  Try again
                </ButtonLink>
              </EmptyState>
            </CardListCard>
          </CardList>
        ) : (
          <NodesTable
            slug={slug}
            nodes={nodesState.data}
            canManage={canManage}
          />
        )}
      </PageWidthWrapper>
    </PageContent>
  );
}
