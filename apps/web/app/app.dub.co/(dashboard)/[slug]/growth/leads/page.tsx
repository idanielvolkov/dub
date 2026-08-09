import { getGrowthLeads } from "@/lib/growth/leads";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnMetricCard, VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { Badge } from "@dub/ui";
import { createGrowthLead, updateGrowthLead } from "./actions";

const inputClass =
  "h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-neutral-400";

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const leads = await getGrowthLeads(slug);
  const won = leads.filter((lead) => lead.meta.status === "won").length;
  const qualified = leads.filter(
    (lead) => lead.meta.status === "qualified",
  ).length;
  const revenue =
    leads.reduce((sum, lead) => sum + Number(lead.saleAmount), 0) / 100;
  return (
    <PageContent
      title="Leads"
      titleInfo={{
        title: "Attributed prospects and the marketing sales pipeline.",
      }}
    >
      <PageWidthWrapper className="pb-10">
        <div className="mb-4 grid gap-4 md:grid-cols-4">
          <VpnMetricCard
            label="Leads"
            value={leads.length}
            detail="CRM contacts"
          />
          <VpnMetricCard
            label="Qualified"
            value={qualified}
            detail="Ready for conversion"
          />
          <VpnMetricCard label="Won" value={won} detail="Converted contacts" />
          <VpnMetricCard
            label="Revenue"
            value={`$${revenue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
            detail="Attributed sales"
          />
        </div>
        <VpnPanel className="mb-4">
          <VpnPanelHeader
            title="Add lead"
            description="Create a contact manually when attribution is unavailable"
          />
          <form
            action={createGrowthLead}
            className="grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-4"
          >
            <input type="hidden" name="slug" value={slug} />
            <label className="grid gap-1 text-xs text-neutral-500">
              Name
              <input
                className={inputClass}
                name="name"
                placeholder="Alex Smith"
              />
            </label>
            <label className="grid gap-1 text-xs text-neutral-500">
              Email
              <input
                className={inputClass}
                type="email"
                name="email"
                placeholder="alex@example.com"
                required
              />
            </label>
            <label className="grid gap-1 text-xs text-neutral-500">
              Country
              <input
                className={inputClass}
                name="country"
                maxLength={2}
                placeholder="US"
              />
            </label>
            <label className="grid gap-1 text-xs text-neutral-500">
              Owner
              <input
                className={inputClass}
                name="owner"
                placeholder="Sales team"
              />
            </label>
            <label className="grid gap-1 text-xs text-neutral-500">
              Stage
              <select className={inputClass} name="status" defaultValue="new">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs text-neutral-500 md:col-span-2 lg:col-span-3">
              Note
              <input
                className={inputClass}
                name="note"
                placeholder="Interested in annual business plan"
              />
            </label>
            <div className="lg:col-span-4">
              <OperationSubmit>Add lead</OperationSubmit>
            </div>
          </form>
        </VpnPanel>
        <VpnPanel>
          <VpnPanelHeader
            title="Lead pipeline"
            description={`${leads.length} contacts from campaigns and manual entry`}
          />
          <div className="divide-border-subtle divide-y">
            {leads.map((lead) => (
              <div key={lead.id} className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-content-emphasis text-sm font-medium">
                      {lead.name || lead.email || "Anonymous lead"}
                    </p>
                    <p className="text-content-subtle mt-1 text-xs">
                      {lead.email || "No email"}
                      {lead.country ? ` · ${lead.country}` : ""}
                      {lead.link
                        ? ` · ${lead.link.title || lead.link.shortLink}`
                        : " · Manual"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="gray">{lead.meta.status}</Badge>
                    {lead.sales > 0 && (
                      <Badge variant="green">{lead.sales} sales</Badge>
                    )}
                  </div>
                </div>
                <form
                  action={updateGrowthLead}
                  className="grid gap-3 md:grid-cols-[160px_1fr_2fr_auto] md:items-end"
                >
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="id" value={lead.id} />
                  <label className="grid gap-1 text-xs text-neutral-500">
                    Stage
                    <select
                      className={inputClass}
                      name="status"
                      defaultValue={lead.meta.status}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs text-neutral-500">
                    Owner
                    <input
                      className={inputClass}
                      name="owner"
                      defaultValue={lead.meta.owner}
                    />
                  </label>
                  <label className="grid gap-1 text-xs text-neutral-500">
                    Note
                    <input
                      className={inputClass}
                      name="note"
                      defaultValue={lead.meta.note}
                    />
                  </label>
                  <OperationSubmit>Save</OperationSubmit>
                </form>
              </div>
            ))}
            {!leads.length && (
              <div className="text-content-subtle p-10 text-center text-sm">
                No leads yet. Add one above or start an attributed campaign.
              </div>
            )}
          </div>
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
