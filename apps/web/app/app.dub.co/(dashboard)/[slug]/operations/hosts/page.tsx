import { getRemnawaveHostsState } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { HostsTable } from "@/ui/vpn/hosts-table";
import { RemnawaveUnavailable } from "@/ui/vpn/remnawave-unavailable";

export default async function HostsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, hostsState] = await Promise.all([
    params,
    getRemnawaveHostsState(),
  ]);
  return (
    <PageContent
      title="Hosts"
      titleInfo={{ title: "Manage subscription hosts." }}
    >
      <PageWidthWrapper className="pb-10">
        {hostsState.error ? (
          <RemnawaveUnavailable detail={hostsState.error} />
        ) : (
          <HostsTable slug={slug} hosts={hostsState.data} />
        )}
      </PageWidthWrapper>
    </PageContent>
  );
}
