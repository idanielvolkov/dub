import { getGrowthWorkspace } from "@/lib/growth/get-growth-workspace";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnMetricCard, VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import Link from "next/link";

export default async function GrowthPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { totals, campaigns } = await getGrowthWorkspace(slug);
  const revenue = Number(totals._sum.saleAmount || 0) / 100;

  return (
    <PageContent
      title="Growth Workspace"
      titleInfo={{
        title: "A dedicated workspace for your marketing and growth team.",
      }}
      controls={
        <Link
          href={`/${slug}/growth/campaigns`}
          className="bg-bg-inverted text-content-inverted rounded-lg px-3 py-2 text-sm font-medium"
        >
          View campaigns
        </Link>
      }
    >
      <PageWidthWrapper className="pb-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <VpnMetricCard
            label="Campaigns"
            value={totals._count.id}
            detail="Active acquisition links"
          />
          <VpnMetricCard
            label="Clicks"
            value={totals._sum.clicks || 0}
            detail="Campaign visits"
          />
          <VpnMetricCard
            label="Leads"
            value={totals._sum.leads || 0}
            detail="Attributed prospects"
          />
          <VpnMetricCard
            label="Revenue"
            value={`$${revenue.toLocaleString()}`}
            detail={`${totals._sum.sales || 0} attributed sales`}
          />
        </div>
        <VpnPanel className="mt-4">
          <VpnPanelHeader
            title="Recent campaigns"
            description="Latest activity across marketing channels"
          />
          <div className="divide-border-subtle divide-y">
            {campaigns.slice(0, 6).map((campaign) => (
              <div
                key={campaign.id}
                className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_repeat(3,100px)] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="text-content-emphasis truncate text-sm font-medium">
                    {campaign.title ||
                      campaign.utm_campaign ||
                      campaign.shortLink}
                  </p>
                  <p className="text-content-subtle mt-0.5 truncate text-xs">
                    {campaign.shortLink}
                  </p>
                </div>
                <span className="text-sm">{campaign.clicks} clicks</span>
                <span className="text-sm">{campaign.leads} leads</span>
                <span className="text-sm">{campaign.sales} sales</span>
              </div>
            ))}
            {!campaigns.length && (
              <div className="text-content-subtle p-10 text-center text-sm">
                Campaign data will appear here.
              </div>
            )}
          </div>
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
