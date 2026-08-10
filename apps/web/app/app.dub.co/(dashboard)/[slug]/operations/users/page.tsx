import { canAccessPlatformArea } from "@/lib/platform-access";
import { requirePlatformAccess } from "@/lib/platform-access-server";
import { getRemnawaveUsersState } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import {
  AddSubscriberButton,
  SubscribersTable,
} from "@/ui/vpn/subscribers-table";
import { ButtonLink, CardList, CardListCard, EmptyState } from "@dub/ui";
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
      controls={canManage ? <AddSubscriberButton slug={slug} /> : undefined}
    >
      <PageWidthWrapper className="pb-10">
        {usersState.error ? (
          <CardList>
            <CardListCard
              hoverStateEnabled={false}
              innerClassName="flex min-h-96 items-center justify-center p-8"
            >
              <EmptyState
                icon={TriangleWarning}
                title="Remnawave is unavailable"
                description={usersState.error}
              >
                <ButtonLink
                  href={`/${slug}/operations/users`}
                  variant="primary"
                >
                  <Refresh2 className="size-4" />
                  Try again
                </ButtonLink>
              </EmptyState>
            </CardListCard>
          </CardList>
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
