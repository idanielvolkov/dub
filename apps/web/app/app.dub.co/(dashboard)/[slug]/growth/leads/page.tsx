import { getGrowthLeads } from "@/lib/growth/leads";
import { CreateLeadButton } from "@/ui/growth/create-lead-button";
import { LeadsTable } from "@/ui/growth/leads-table";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { MetricCards } from "@dub/ui";

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
        <LeadsTable
          slug={slug}
          leads={leads.map((lead) => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            country: lead.country,
            sales: lead.sales,
            revenue: Number(lead.saleAmount) / 100,
            source: lead.link
              ? lead.link.title || lead.link.shortLink
              : "Manual",
            createdAt: lead.createdAt.toISOString(),
            meta: lead.meta,
          }))}
        />
      </PageWidthWrapper>
    </PageContent>
  );
}
