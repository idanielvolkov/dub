import { canAccessPlatformArea } from "@/lib/platform-access";
import { requirePlatformAccess } from "@/lib/platform-access-server";
import { getRemnawaveNodesState } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { SimpleEmptyState } from "@/ui/shared/simple-empty-state";
import { NodesTable } from "@/ui/vpn/nodes-table";
import { ButtonLink } from "@dub/ui";
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
          <SimpleEmptyState
            className="border-border-subtle min-h-96 rounded-xl border bg-white"
            graphic={
              <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <TriangleWarning className="size-6" />
              </div>
            }
            title="Remnawave is unavailable"
            description={nodesState.error}
            addButton={
              <ButtonLink
                href={`/${slug}/operations/nodes`}
                variant="primary"
              >
                <Refresh2 className="size-4" />
                Try again
              </ButtonLink>
            }
          />
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
