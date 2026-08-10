import { canAccessPlatformArea } from "@/lib/platform-access";
import { requirePlatformAccess } from "@/lib/platform-access-server";
import { getRemnawaveUsersState } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { SimpleEmptyState } from "@/ui/shared/simple-empty-state";
import { SubscribersTable } from "@/ui/vpn/subscribers-table";
import { ButtonLink } from "@dub/ui";
import { Refresh2, TriangleWarning } from "@dub/ui/icons";

export default async function UsersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [usersState, membership] = await Promise.all([
    getRemnawaveUsersState(),
    requirePlatformAccess(slug, "remnawave"),
  ]);
  const canManage = canAccessPlatformArea({
    role: membership.role,
    workspacePreferences: membership.workspacePreferences,
    area: "remnawave",
    minimum: "manage",
  });

  return (
    <PageContent
      title="Users"
      titleInfo={{ title: "Manage users and VPN access." }}
    >
      <PageWidthWrapper className="pb-10">
        {usersState.error ? (
          <SimpleEmptyState
            className="border-border-subtle min-h-96 rounded-xl border bg-white"
            graphic={
              <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <TriangleWarning className="size-6" />
              </div>
            }
            title="Remnawave is unavailable"
            description={usersState.error}
            addButton={
              <ButtonLink
                href={`/${slug}/operations/users`}
                variant="primary"
              >
                <Refresh2 className="size-4" />
                Try again
              </ButtonLink>
            }
          />
        ) : (
          <SubscribersTable
            slug={slug}
            users={usersState.data.users}
            canManage={canManage}
          />
        )}
      </PageWidthWrapper>
    </PageContent>
  );
}
