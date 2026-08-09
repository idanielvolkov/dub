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
  const usersState = await getRemnawaveUsersState();

  return (
    <PageContent
      title="Users"
      titleInfo={{ title: "Create and manage VPN access in Remnawave." }}
    >
      <PageWidthWrapper className="pb-10">
        {usersState.error ? (
          <RemnawaveUnavailable detail={usersState.error} />
        ) : (
          <SubscribersTable slug={slug} users={usersState.data.users} />
        )}
      </PageWidthWrapper>
    </PageContent>
  );
}
