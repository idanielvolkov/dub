import { getGrowthWorkspace } from "@/lib/growth/get-growth-workspace";
import { CreateCampaignButton } from "@/ui/growth/create-campaign-button";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { DubCard, DubCardList } from "@/ui/vpn/server-card-list";
import { Badge, EmptyState, Input, Label } from "@dub/ui";
import { Megaphone } from "@dub/ui/icons";
import { archiveGrowthCampaign, updateGrowthCampaign } from "./actions";

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
        title: "Acquisition campaigns, ownership and live attribution.",
      }}
      controls={
        <CreateCampaignButton
          slug={slug}
          domains={workspace.domains.map((item) => item.slug)}
        />
      }
    >
      <PageWidthWrapper className="pb-10">
        <section>
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              All campaigns
            </h2>
            <p className="text-content-subtle text-sm">
              {campaigns.length} active records
            </p>
          </div>
          <DubCardList variant="compact">
            {campaigns.map((campaign) => (
              <DubCard
                key={campaign.id}
                innerClassName="space-y-4 p-5"
                hoverStateEnabled={false}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <a
                      href={`https://${campaign.shortLink}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-content-emphasis text-sm font-medium underline underline-offset-4"
                    >
                      {campaign.shortLink}
                    </a>
                    <p className="text-content-subtle mt-1 truncate text-xs">
                      {campaign.url}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="gray">{campaign.meta.status}</Badge>
                    <Badge variant="gray">{campaign.clicks} clicks</Badge>
                    <Badge variant="gray">{campaign.leads} leads</Badge>
                    <Badge variant="gray">{campaign.sales} sales</Badge>
                  </div>
                </div>
                <form
                  action={updateGrowthCampaign}
                  className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
                >
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="id" value={campaign.id} />
                  <div className="grid gap-1.5 lg:col-span-2">
                    <Label htmlFor={`campaign-${campaign.id}-name`}>Name</Label>
                    <Input
                      id={`campaign-${campaign.id}-name`}
                      className="h-9"
                      name="title"
                      defaultValue={campaign.title || ""}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`campaign-${campaign.id}-utm`}>
                      UTM campaign
                    </Label>
                    <Input
                      id={`campaign-${campaign.id}-utm`}
                      className="h-9"
                      name="campaign"
                      defaultValue={campaign.utm_campaign || ""}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`campaign-${campaign.id}-owner`}>
                      Owner
                    </Label>
                    <Input
                      id={`campaign-${campaign.id}-owner`}
                      className="h-9"
                      name="owner"
                      defaultValue={campaign.meta.owner}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`campaign-${campaign.id}-budget`}>
                      Budget
                    </Label>
                    <Input
                      id={`campaign-${campaign.id}-budget`}
                      className="h-9"
                      type="number"
                      name="budget"
                      min={0}
                      defaultValue={campaign.meta.budget}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`campaign-${campaign.id}-status`}>
                      Status
                    </Label>
                    <FormCombobox
                      id={`campaign-${campaign.id}-status`}
                      name="status"
                      defaultValue={campaign.meta.status}
                      className="h-9"
                      options={[
                        { value: "draft", label: "Draft" },
                        { value: "active", label: "Active" },
                        { value: "paused", label: "Paused" },
                        { value: "completed", label: "Completed" },
                      ]}
                    />
                  </div>
                  <div className="flex items-end lg:col-span-2">
                    <OperationSubmit>Save campaign</OperationSubmit>
                  </div>
                </form>
                <form
                  action={archiveGrowthCampaign}
                  className="flex justify-end"
                >
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="id" value={campaign.id} />
                  <OperationSubmit
                    destructive
                    confirmMessage="Archive this campaign? The short link will be removed from the workspace list."
                  >
                    Archive
                  </OperationSubmit>
                </form>
              </DubCard>
            ))}
          </DubCardList>
          {!campaigns.length && (
            <div className="py-12">
              <EmptyState icon={Megaphone} title="No campaigns yet" />
            </div>
          )}
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
