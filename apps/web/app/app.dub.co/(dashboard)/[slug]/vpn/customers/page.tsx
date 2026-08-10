import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { vpnOrdersFromStore } from "@/lib/vpn/orders";
import { supportTicketsFromStore } from "@/lib/vpn/support";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { CustomersTable, VpnCustomer } from "@/ui/vpn/customers-table";
import { ButtonLink, MetricCards } from "@dub/ui";

const money = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, session] = await Promise.all([params, getSession()]);
  const workspace = await prisma.project.findFirstOrThrow({
    where: { slug, users: { some: { userId: session?.user.id } } },
    select: { store: true },
  });
  const orders = vpnOrdersFromStore(workspace.store);
  const tickets = supportTicketsFromStore(workspace.store);
  const customers = new Map<string, VpnCustomer>();
  for (const order of orders) {
    const email = order.customerEmail.toLowerCase();
    const current = customers.get(email) || {
      email,
      name: order.customerName,
      orders: 0,
      revenue: 0,
      hasAccess: false,
      openTickets: 0,
      updatedAt: order.updatedAt,
    };
    current.name = order.customerName || current.name;
    current.orders += 1;
    current.revenue += order.paymentStatus === "paid" ? order.amount : 0;
    current.hasAccess ||= order.fulfillmentStatus === "fulfilled";
    if (new Date(order.updatedAt) > new Date(current.updatedAt))
      current.updatedAt = order.updatedAt;
    customers.set(email, current);
  }
  for (const ticket of tickets) {
    const email = ticket.customerEmail.toLowerCase();
    const current = customers.get(email) || {
      email,
      name: ticket.customerName,
      orders: 0,
      revenue: 0,
      hasAccess: false,
      openTickets: 0,
      updatedAt: ticket.updatedAt,
    };
    current.name = ticket.customerName || current.name;
    if (ticket.status !== "resolved") current.openTickets += 1;
    if (new Date(ticket.updatedAt) > new Date(current.updatedAt))
      current.updatedAt = ticket.updatedAt;
    customers.set(email, current);
  }
  const rows = [...customers.values()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <PageContent
      title="Customers"
      titleInfo={{
        title: "View customer purchases, access, and support history.",
      }}
      controls={
        <ButtonLink
          href={`/${slug}/vpn/orders`}
          variant="primary"
          className="h-9 px-3 text-sm"
        >
          Create order
        </ButtonLink>
      }
    >
      <PageWidthWrapper className="pb-10">
        <MetricCards
          items={[
            {
              label: "Customers",
              value: rows.length,
              detail: "Unique customer profiles",
            },
            {
              label: "With access",
              value: rows.filter((customer) => customer.hasAccess).length,
              detail: "VPN provisioned",
            },
            {
              label: "Revenue",
              value: money(
                rows.reduce((sum, customer) => sum + customer.revenue, 0),
              ),
              detail: "Confirmed payments",
            },
            {
              label: "Needs attention",
              value: rows.filter((customer) => customer.openTickets > 0).length,
              detail: "Open support requests",
            },
          ]}
        />
        <section className="mt-6">
          <CustomersTable slug={slug} customers={rows} />
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
