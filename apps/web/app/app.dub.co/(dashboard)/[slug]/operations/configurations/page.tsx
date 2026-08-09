import {
  getRemnawaveConfigProfiles,
  getRemnawaveSquads,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { Badge } from "@dub/ui";

export default async function ConfigurationsPage() {
  const [profiles, squads] = await Promise.all([
    getRemnawaveConfigProfiles(),
    getRemnawaveSquads(),
  ]);

  return (
    <PageContent
      title="Profiles & squads"
      titleInfo={{
        title: "Xray configuration profiles and internal access squads.",
      }}
    >
      <PageWidthWrapper className="grid gap-4 pb-10 lg:grid-cols-2">
        <VpnPanel>
          <VpnPanelHeader
            title="Configuration profiles"
            description={`${profiles.total} profiles`}
          />
          <div className="divide-border-subtle divide-y">
            {profiles.configProfiles.map((profile) => (
              <div key={profile.uuid} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-content-emphasis text-sm font-medium">
                    {profile.name}
                  </p>
                  <Badge variant="gray">
                    {profile.inbounds.length} inbounds
                  </Badge>
                </div>
                <p className="text-content-subtle mt-1 font-mono text-xs">
                  {profile.uuid}
                </p>
              </div>
            ))}
          </div>
        </VpnPanel>
        <VpnPanel>
          <VpnPanelHeader
            title="Internal squads"
            description={`${squads.total} access groups`}
          />
          <div className="divide-border-subtle divide-y">
            {squads.internalSquads.map((squad) => (
              <div key={squad.uuid} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-content-emphasis text-sm font-medium">
                    {squad.name}
                  </p>
                  <Badge variant="gray">{squad.inbounds.length} inbounds</Badge>
                </div>
                <p className="text-content-subtle mt-1 text-xs">
                  {squad.info || squad.uuid}
                </p>
              </div>
            ))}
          </div>
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
