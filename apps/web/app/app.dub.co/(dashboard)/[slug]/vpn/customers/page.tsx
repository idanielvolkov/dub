import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { vpnOrdersFromStore } from "@/lib/vpn/orders";
import { supportTicketsFromStore } from "@/lib/vpn/support";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { UserAvatar } from "@/ui/users/user-avatar";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import { Badge, ButtonLink, CardList, CardListCard, EmptyState } from "@dub/ui";
import { Users } from "@dub/ui/icons";

type Customer = {
  email: string;
  name: string;
  orders: number;
  revenue: number;
  hasAccess: boolean;
  openTickets: number;
  updatedAt: string;
};

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
  const customers = new Map<string, Customer>();
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
        <VpnStats
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
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              All customers
            </h2>
            <p className="text-content-subtle text-sm">
              A unified view across sales and support
            </p>
          </div>
          {rows.length ? (
            <CardList variant="compact">
              {rows.map((customer) => (
                <CardListCard
                  key={customer.email}
                  innerClassName="flex flex-wrap items-center gap-3 px-5 py-4"
                  hoverStateEnabled={false}
                >
                  <UserAvatar
                    user={{
                      id: customer.email,
                      name: customer.name,
                      email: customer.email,
                      image: null,
                      role: customer.hasAccess ? "member" : "viewer",
                    }}
                    className="size-8 border-none"
                  />
                  <div className="min-w-48 flex-1">
                    <p className="text-content-emphasis truncate text-sm font-medium">
                      {customer.name || customer.email}
                    </p>
                    <p className="text-content-subtle truncate text-xs">
                      {customer.email}
                    </p>
                  </div>
                  <div className="w-24">
                    <p className="text-sm font-medium">{customer.orders}</p>
                    <p className="text-content-subtle text-xs">orders</p>
                  </div>
                  <div className="w-28">
                    <p className="text-sm font-medium">
                      {money(customer.revenue)}
                    </p>
                    <p className="text-content-subtle text-xs">revenue</p>
                  </div>
                  {customer.openTickets > 0 ? (
                    <Badge variant="orange">{customer.openTickets} open</Badge>
                  ) : (
                    <Badge variant={customer.hasAccess ? "green" : "gray"}>
                      {customer.hasAccess ? "Active" : "No access"}
                    </Badge>
                  )}
                  <ButtonLink
                    href={`/${slug}/vpn/customers/${encodeURIComponent(customer.email)}`}
                    variant="secondary"
                    className="h-8 px-3 text-xs"
                  >
                    View
                  </ButtonLink>
                </CardListCard>
              ))}
            </CardList>
          ) : (
            <div className="py-16">
              <EmptyState
                icon={Users}
                title="No customers yet"
                description="Customers appear after their first order or support request."
              />
            </div>
          )}
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
