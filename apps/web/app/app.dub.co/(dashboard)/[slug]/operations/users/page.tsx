import { getRemnawaveUsers } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { SubscribersTable } from "@/ui/vpn/subscribers-table";

export default async function UsersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { users } = await getRemnawaveUsers();

  return (
    <PageContent
      title="Users"
      titleInfo={{ title: "Create and manage VPN access in Remnawave." }}
    >
      <PageWidthWrapper className="pb-10">
        <SubscribersTable slug={slug} users={users} />
      </PageWidthWrapper>
    </PageContent>
  );
}
