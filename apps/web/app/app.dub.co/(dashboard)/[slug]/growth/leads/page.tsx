import { getGrowthLeads } from "@/lib/growth/leads";
import { CreateLeadButton } from "@/ui/growth/create-lead-button";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import {
  Badge,
  CardList,
  CardListCard,
  EmptyState,
  FormCombobox,
  Input,
  Label,
  MetricCards,
} from "@dub/ui";
import { Crosshairs3 } from "@dub/ui/icons";
import { updateGrowthLead } from "./actions";

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
        title: "Manage contacts and the sales pipeline.",
      }}
      controls={<CreateLeadButton slug={slug} />}
    >
      <PageWidthWrapper className="pb-10">
        <MetricCards
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
              <CardListCard
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
                  <div className="grid gap-1.5">
                    <Label htmlFor={`lead-${lead.id}-stage`}>Stage</Label>
                    <FormCombobox
                      id={`lead-${lead.id}-stage`}
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
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`lead-${lead.id}-owner`}>Owner</Label>
                    <Input
                      id={`lead-${lead.id}-owner`}
                      className="h-9"
                      name="owner"
                      defaultValue={lead.meta.owner}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`lead-${lead.id}-note`}>Note</Label>
                    <Input
                      id={`lead-${lead.id}-note`}
                      className="h-9"
                      name="note"
                      defaultValue={lead.meta.note}
                    />
                  </div>
                  <OperationSubmit>Save</OperationSubmit>
                </form>
              </CardListCard>
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
