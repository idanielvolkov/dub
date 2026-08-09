import { canAccessPlatformArea } from "@/lib/platform-access";
import { requirePlatformAccess } from "@/lib/platform-access-server";
import { getRemnawaveUsersState } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { RemnawaveUnavailable } from "@/ui/vpn/remnawave-unavailable";
import { SubscribersTable } from "@/ui/vpn/subscribers-table";

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
          <RemnawaveUnavailable detail={usersState.error} />
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
