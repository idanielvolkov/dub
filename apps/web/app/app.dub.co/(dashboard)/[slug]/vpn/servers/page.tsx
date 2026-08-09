import { getRemnawaveNodes } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnPanel } from "@/ui/vpn/vpn-ui";
import { StatusBadge } from "@dub/ui";

export default async function ServersPage() {
  const nodes = await getRemnawaveNodes();

  return (
    <PageContent
      title="VPN servers"
      titleInfo={{ title: "Live Remnawave node availability and load." }}
    >
      <PageWidthWrapper className="pb-10">
        <div className="grid gap-4 md:grid-cols-2">
          {nodes.map((node) => (
            <VpnPanel
              key={node.uuid}
              className="hover:drop-shadow-card-hover transition-[filter]"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-content-emphasis font-semibold">
                      {node.name}
                    </p>
                    <p className="text-content-subtle mt-1 font-mono text-xs">
                      {node.address}:{node.port}
                    </p>
                  </div>
                  <StatusBadge
                    variant={node.isConnected ? "success" : "pending"}
                  >
                    {node.isConnected ? "Online" : "Connecting"}
                  </StatusBadge>
                </div>
              </div>
              <div className="border-border-subtle grid grid-cols-2 divide-x border-t">
                <div className="p-4">
                  <p className="text-content-subtle text-xs">Users online</p>
                  <p className="text-content-emphasis mt-1 text-lg font-semibold">
                    {node.usersOnline}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-content-subtle text-xs">Country</p>
                  <p className="text-content-emphasis mt-1 text-lg font-semibold">
                    {node.countryCode || "—"}
                  </p>
                </div>
              </div>
            </VpnPanel>
          ))}
        </div>
      </PageWidthWrapper>
    </PageContent>
  );
}
