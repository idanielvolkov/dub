import { getRemnawaveHosts } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { HostsTable } from "@/ui/vpn/hosts-table";

export default async function HostsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, hosts] = await Promise.all([params, getRemnawaveHosts()]);
  return (
    <PageContent
      title="Hosts"
      titleInfo={{ title: "Remnawave subscription hosts." }}
    >
      <PageWidthWrapper className="pb-10">
        <HostsTable slug={slug} hosts={hosts} />
      </PageWidthWrapper>
    </PageContent>
  );
}
