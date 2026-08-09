import { getGrowthWorkspace } from "@/lib/growth/get-growth-workspace";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { Badge } from "@dub/ui";

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { campaigns } = await getGrowthWorkspace(slug);
  return (
    <PageContent
      title="Campaigns"
      titleInfo={{ title: "Acquisition campaigns and channel links." }}
    >
      <PageWidthWrapper className="pb-10">
        <VpnPanel>
          <VpnPanelHeader
            title="All campaigns"
            description={`${campaigns.length} active campaigns`}
          />
          <div className="divide-border-subtle divide-y">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_120px_90px_90px_90px] lg:items-center"
              >
                <div className="min-w-0">
                  <p className="text-content-emphasis truncate text-sm font-medium">
                    {campaign.title ||
                      campaign.utm_campaign ||
                      "Untitled campaign"}
                  </p>
                  <p className="text-content-subtle mt-0.5 truncate text-xs">
                    {campaign.shortLink} → {campaign.url}
                  </p>
                </div>
                <Badge variant="gray">
                  {campaign.utm_campaign || "Direct"}
                </Badge>
                <span className="text-sm">{campaign.clicks} clicks</span>
                <span className="text-sm">{campaign.leads} leads</span>
                <span className="text-sm">{campaign.sales} sales</span>
              </div>
            ))}
            {!campaigns.length && (
              <div className="text-content-subtle p-10 text-center text-sm">
                No campaigns yet.
              </div>
            )}
          </div>
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
