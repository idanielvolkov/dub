import { getGrowthWorkspace } from "@/lib/growth/get-growth-workspace";
import { CampaignsTable } from "@/ui/growth/campaigns-table";
import { CreateCampaignButton } from "@/ui/growth/create-campaign-button";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { campaigns, workspace } = await getGrowthWorkspace(slug);
  return (
    <PageContent
      title="Campaigns"
      titleInfo={{
        title: "Manage campaigns and attribution.",
      }}
      controls={
        <CreateCampaignButton
          slug={slug}
          domains={workspace.domains.map((item) => item.slug)}
        />
      }
    >
      <PageWidthWrapper className="pb-10">
        <CampaignsTable
          slug={slug}
          campaigns={campaigns.map((campaign) => ({
            id: campaign.id,
            title: campaign.title,
            url: campaign.url,
            shortLink: campaign.shortLink,
            clicks: campaign.clicks,
            leads: campaign.leads,
            sales: campaign.sales,
            campaign: campaign.utm_campaign,
            createdAt: campaign.createdAt.toISOString(),
            meta: campaign.meta,
          }))}
        />
      </PageWidthWrapper>
    </PageContent>
  );
}
