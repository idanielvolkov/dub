import { getGrowthWorkspace } from "@/lib/growth/get-growth-workspace";
import { DubCard, DubCardList } from "@/ui/vpn/server-card-list";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { Badge, EmptyState, Input, Label } from "@dub/ui";
import { Megaphone } from "@dub/ui/icons";
import {
  archiveGrowthCampaign,
  createGrowthCampaign,
  updateGrowthCampaign,
} from "./actions";

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { campaigns, workspace } = await getGrowthWorkspace(slug);
  const domain = workspace.domains[0]?.slug;
  return (
    <PageContent
      title="Campaigns"
      titleInfo={{
        title: "Acquisition campaigns, ownership and live attribution.",
      }}
    >
      <PageWidthWrapper className="pb-10">
        <section className="mb-6">
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Create campaign
            </h2>
            <p className="text-content-subtle text-sm">
              A trackable campaign link with UTM attribution
            </p>
          </div>
          <DubCardList>
            <DubCard innerClassName="p-0" hoverStateEnabled={false}>
              {domain ? (
                <form
                  action={createGrowthCampaign}
                  className="grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-4"
                >
                  <input type="hidden" name="slug" value={slug} />
                  <div className="grid gap-1.5 md:col-span-2">
                    <Label htmlFor="new-campaign-name">Campaign name</Label>
                    <Input
                      id="new-campaign-name"
                      className="h-9"
                      name="title"
                      placeholder="Summer VPN launch"
                      required
                    />
                  </div>
                  <div className="grid gap-1.5 md:col-span-2">
                    <Label htmlFor="new-campaign-url">Destination URL</Label>
                    <Input
                      id="new-campaign-url"
                      className="h-9"
                      type="url"
                      name="url"
                      placeholder="https://detz.fun/pricing"
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="new-campaign-domain">Short domain</Label>
                    <FormCombobox
                      id="new-campaign-domain"
                      name="domain"
                      defaultValue={domain}
                      className="h-9"
                      options={workspace.domains.map((item) => ({
                        value: item.slug,
                        label: item.slug,
                      }))}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="new-campaign-path">Short path</Label>
                    <Input
                      id="new-campaign-path"
                      className="h-9"
                      name="key"
                      placeholder="summer"
                      pattern="[A-Za-z0-9/_-]+"
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="new-campaign-utm">UTM campaign</Label>
                    <Input
                      id="new-campaign-utm"
                      className="h-9"
                      name="campaign"
                      placeholder="summer-2026"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="new-campaign-owner">Owner</Label>
                    <Input
                      id="new-campaign-owner"
                      className="h-9"
                      name="owner"
                      placeholder="Marketing team"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="new-campaign-source">Source</Label>
                    <Input
                      id="new-campaign-source"
                      className="h-9"
                      name="source"
                      placeholder="telegram"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="new-campaign-medium">Medium</Label>
                    <Input id="new-campaign-medium" className="h-9" name="medium" placeholder="social" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="new-campaign-budget">Budget</Label>
                    <Input
                      id="new-campaign-budget"
                      className="h-9"
                      type="number"
                      name="budget"
                      min={0}
                      step="1"
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="new-campaign-status">Status</Label>
                    <FormCombobox
                      id="new-campaign-status"
                      name="status"
                      defaultValue="draft"
                      className="h-9"
                      options={[
                        { value: "draft", label: "Draft" },
                        { value: "active", label: "Active" },
                        { value: "paused", label: "Paused" },
                        { value: "completed", label: "Completed" },
                      ]}
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <OperationSubmit>Create campaign</OperationSubmit>
                  </div>
                </form>
              ) : (
                <p className="p-5 text-sm text-neutral-500">
                  Add and verify a short domain before creating campaigns.
                </p>
              )}
            </DubCard>
          </DubCardList>
        </section>
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
                    <Label htmlFor={`campaign-${campaign.id}-utm`}>UTM campaign</Label>
                    <Input
                      id={`campaign-${campaign.id}-utm`}
                      className="h-9"
                      name="campaign"
                      defaultValue={campaign.utm_campaign || ""}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`campaign-${campaign.id}-owner`}>Owner</Label>
                    <Input
                      id={`campaign-${campaign.id}-owner`}
                      className="h-9"
                      name="owner"
                      defaultValue={campaign.meta.owner}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`campaign-${campaign.id}-budget`}>Budget</Label>
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
                    <Label htmlFor={`campaign-${campaign.id}-status`}>Status</Label>
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
