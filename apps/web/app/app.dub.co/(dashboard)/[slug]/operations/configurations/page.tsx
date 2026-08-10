import {
  getRemnawaveConfigProfiles,
  getRemnawaveSquads,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import {
  ConfigurationsTables,
  CreateSquadButton,
} from "@/ui/vpn/configurations-tables";

export default async function ConfigurationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, profiles, squads] = await Promise.all([
    params,
    getRemnawaveConfigProfiles(),
    getRemnawaveSquads(),
  ]);
  const inboundIds = profiles.configProfiles.flatMap((profile) =>
    profile.inbounds
      .map((inbound) => (inbound as { uuid?: string }).uuid)
      .filter((uuid): uuid is string => Boolean(uuid)),
  );
  return (
    <PageContent
      title="Configurations"
      titleInfo={{ title: "Manage config profiles and internal squads." }}
      controls={<CreateSquadButton slug={slug} inboundIds={inboundIds} />}
    >
      <PageWidthWrapper className="space-y-8 pb-10">
        <ConfigurationsTables
          slug={slug}
          profiles={profiles.configProfiles}
          squads={squads.internalSquads}
        />
      </PageWidthWrapper>
    </PageContent>
  );
}
