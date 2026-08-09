import { getRemnawaveHosts } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { StatusBadge } from "@dub/ui";

export default async function HostsPage() {
  const hosts = await getRemnawaveHosts();

  return (
    <PageContent
      title="Hosts"
      titleInfo={{ title: "Remnawave subscription hosts." }}
    >
      <PageWidthWrapper className="pb-10">
        <VpnPanel>
          <VpnPanelHeader
            title="Subscription hosts"
            description={`${hosts.length} configured hosts`}
          />
          <div className="divide-border-subtle divide-y">
            {hosts.map((host) => (
              <div
                key={host.uuid}
                className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_1fr_120px] sm:items-center"
              >
                <div>
                  <p className="text-content-emphasis text-sm font-medium">
                    {host.remark}
                  </p>
                  <p className="text-content-subtle mt-0.5 font-mono text-xs">
                    {host.uuid}
                  </p>
                </div>
                <p className="text-content-default truncate font-mono text-xs">
                  {host.address}
                  {host.port ? `:${host.port}` : ""}
                </p>
                <StatusBadge variant={host.isDisabled ? "warning" : "success"}>
                  {host.isDisabled ? "Disabled" : "Active"}
                </StatusBadge>
              </div>
            ))}
          </div>
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
