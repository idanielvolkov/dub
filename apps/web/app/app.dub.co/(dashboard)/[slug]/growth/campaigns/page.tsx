import { getGrowthWorkspace } from "@/lib/growth/get-growth-workspace";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { Badge, EmptyState, Input } from "@dub/ui";
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
        <VpnPanel className="mb-4">
          <VpnPanelHeader
            title="Create campaign"
            description="A trackable campaign link with UTM attribution"
          />
          {domain ? (
            <form
              action={createGrowthCampaign}
              className="grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-4"
            >
              <input type="hidden" name="slug" value={slug} />
              <label className="grid gap-1 text-xs text-neutral-500 md:col-span-2">
                Campaign name
                <Input
                  className="h-9"
                  name="title"
                  placeholder="Summer VPN launch"
                  required
                />
              </label>
              <label className="grid gap-1 text-xs text-neutral-500 md:col-span-2">
                Destination URL
                <Input
                  className="h-9"
                  type="url"
                  name="url"
                  placeholder="https://detz.fun/pricing"
                  required
                />
              </label>
              <label className="grid gap-1 text-xs text-neutral-500">
                Short domain
                <FormCombobox
                  name="domain"
                  defaultValue={domain}
                  className="h-9"
                  options={workspace.domains.map((item) => ({
                    value: item.slug,
                    label: item.slug,
                  }))}
                />
              </label>
              <label className="grid gap-1 text-xs text-neutral-500">
                Short path
                <Input
                  className="h-9"
                  name="key"
                  placeholder="summer"
                  pattern="[A-Za-z0-9/_-]+"
                  required
                />
              </label>
              <label className="grid gap-1 text-xs text-neutral-500">
                UTM campaign
                <Input
                  className="h-9"
                  name="campaign"
                  placeholder="summer-2026"
                />
              </label>
              <label className="grid gap-1 text-xs text-neutral-500">
                Owner
                <Input
                  className="h-9"
                  name="owner"
                  placeholder="Marketing team"
                />
              </label>
              <label className="grid gap-1 text-xs text-neutral-500">
                Source
                <Input className="h-9" name="source" placeholder="telegram" />
              </label>
              <label className="grid gap-1 text-xs text-neutral-500">
                Medium
                <Input className="h-9" name="medium" placeholder="social" />
              </label>
              <label className="grid gap-1 text-xs text-neutral-500">
                Budget
                <Input
                  className="h-9"
                  type="number"
                  name="budget"
                  min={0}
                  step="1"
                  placeholder="0"
                />
              </label>
              <label className="grid gap-1 text-xs text-neutral-500">
                Status
                <FormCombobox
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
              </label>
              <div className="lg:col-span-4">
                <OperationSubmit>Create campaign</OperationSubmit>
              </div>
            </form>
          ) : (
            <p className="p-5 text-sm text-neutral-500">
              Add and verify a short domain before creating campaigns.
            </p>
          )}
        </VpnPanel>
        <VpnPanel>
          <VpnPanelHeader
            title="All campaigns"
            description={`${campaigns.length} active records`}
          />
          <div className="divide-border-subtle divide-y">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="space-y-4 p-5">
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
                  <label className="grid gap-1 text-xs text-neutral-500 lg:col-span-2">
                    Name
                    <Input
                      className="h-9"
                      name="title"
                      defaultValue={campaign.title || ""}
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-xs text-neutral-500">
                    UTM campaign
                    <Input
                      className="h-9"
                      name="campaign"
                      defaultValue={campaign.utm_campaign || ""}
                    />
                  </label>
                  <label className="grid gap-1 text-xs text-neutral-500">
                    Owner
                    <Input
                      className="h-9"
                      name="owner"
                      defaultValue={campaign.meta.owner}
                    />
                  </label>
                  <label className="grid gap-1 text-xs text-neutral-500">
                    Budget
                    <Input
                      className="h-9"
                      type="number"
                      name="budget"
                      min={0}
                      defaultValue={campaign.meta.budget}
                    />
                  </label>
                  <label className="grid gap-1 text-xs text-neutral-500">
                    Status
                    <FormCombobox
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
                  </label>
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
              </div>
            ))}
            {!campaigns.length && (
              <div className="p-10">
                <EmptyState icon={Megaphone} title="No campaigns yet" />
              </div>
            )}
          </div>
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
