import { getGrowthLeads } from "@/lib/growth/leads";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import { Badge, CardList, EmptyState, Input } from "@dub/ui";
import { Crosshairs3 } from "@dub/ui/icons";
import { createGrowthLead, updateGrowthLead } from "./actions";

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
        <VpnStats
          className="mb-6"
          items={[
            { label: "Leads", value: leads.length, detail: "CRM contacts" },
            {
              label: "Qualified",
              value: qualified,
              detail: "Ready for conversion",
            },
            { label: "Won", value: won, detail: "Converted contacts" },
            {
              label: "Revenue",
              value: `$${revenue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
              detail: "Attributed sales",
            },
          ]}
        />
        <section className="mb-6">
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Add lead
            </h2>
            <p className="text-content-subtle text-sm">
              Create a contact manually when attribution is unavailable
            </p>
          </div>
          <CardList>
            <CardList.Card innerClassName="p-0" hoverStateEnabled={false}>
              <form
                action={createGrowthLead}
                className="grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-4"
              >
                <input type="hidden" name="slug" value={slug} />
                <label className="grid gap-1 text-xs text-neutral-500">
                  Name
                  <Input className="h-9" name="name" placeholder="Alex Smith" />
                </label>
                <label className="grid gap-1 text-xs text-neutral-500">
                  Email
                  <Input
                    className="h-9"
                    type="email"
                    name="email"
                    placeholder="alex@example.com"
                    required
                  />
                </label>
                <label className="grid gap-1 text-xs text-neutral-500">
                  Country
                  <Input
                    className="h-9"
                    name="country"
                    maxLength={2}
                    placeholder="US"
                  />
                </label>
                <label className="grid gap-1 text-xs text-neutral-500">
                  Owner
                  <Input
                    className="h-9"
                    name="owner"
                    placeholder="Sales team"
                  />
                </label>
                <label className="grid gap-1 text-xs text-neutral-500">
                  Stage
                  <FormCombobox
                    name="status"
                    defaultValue="new"
                    className="h-9"
                    options={[
                      { value: "new", label: "New" },
                      { value: "contacted", label: "Contacted" },
                      { value: "qualified", label: "Qualified" },
                      { value: "won", label: "Won" },
                      { value: "lost", label: "Lost" },
                    ]}
                  />
                </label>
                <label className="grid gap-1 text-xs text-neutral-500 md:col-span-2 lg:col-span-3">
                  Note
                  <Input
                    className="h-9"
                    name="note"
                    placeholder="Interested in annual business plan"
                  />
                </label>
                <div className="lg:col-span-4">
                  <OperationSubmit>Add lead</OperationSubmit>
                </div>
              </form>
            </CardList.Card>
          </CardList>
        </section>
        <section>
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Lead pipeline
            </h2>
            <p className="text-content-subtle text-sm">
              {leads.length} contacts from campaigns and manual entry
            </p>
          </div>
          <CardList variant="compact">
            {leads.map((lead) => (
              <CardList.Card
                key={lead.id}
                innerClassName="space-y-4 p-5"
                hoverStateEnabled={false}
              >
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
                    <FormCombobox
                      name="status"
                      defaultValue={lead.meta.status}
                      className="h-9"
                      options={[
                        { value: "new", label: "New" },
                        { value: "contacted", label: "Contacted" },
                        { value: "qualified", label: "Qualified" },
                        { value: "won", label: "Won" },
                        { value: "lost", label: "Lost" },
                      ]}
                    />
                  </label>
                  <label className="grid gap-1 text-xs text-neutral-500">
                    Owner
                    <Input
                      className="h-9"
                      name="owner"
                      defaultValue={lead.meta.owner}
                    />
                  </label>
                  <label className="grid gap-1 text-xs text-neutral-500">
                    Note
                    <Input
                      className="h-9"
                      name="note"
                      defaultValue={lead.meta.note}
                    />
                  </label>
                  <OperationSubmit>Save</OperationSubmit>
                </form>
              </CardList.Card>
            ))}
          </CardList>
          {!leads.length && (
            <div className="py-12">
              <EmptyState
                icon={Crosshairs3}
                title="No leads yet"
                description="Add one above or start an attributed campaign."
              />
            </div>
          )}
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
