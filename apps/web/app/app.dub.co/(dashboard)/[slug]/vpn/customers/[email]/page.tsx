import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { vpnOrdersFromStore } from "@/lib/vpn/orders";
import { supportTicketsFromStore } from "@/lib/vpn/support";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { UserAvatar } from "@/ui/users/user-avatar";
import {
  CustomerOrdersTable,
  CustomerSupportTable,
} from "@/ui/vpn/customer-history-tables";
import { ButtonLink, MetricCards } from "@dub/ui";
import { notFound } from "next/navigation";

const money = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ slug: string; email: string }>;
}) {
  const [{ slug, email: encodedEmail }, session] = await Promise.all([
    params,
    getSession(),
  ]);
  const email = decodeURIComponent(encodedEmail).toLowerCase();
  const workspace = await prisma.project.findFirstOrThrow({
    where: { slug, users: { some: { userId: session?.user.id } } },
    select: { store: true },
  });
  const orders = vpnOrdersFromStore(workspace.store)
    .filter((order) => order.customerEmail.toLowerCase() === email)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  const tickets = supportTicketsFromStore(workspace.store)
    .filter((ticket) => ticket.customerEmail.toLowerCase() === email)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  if (!orders.length && !tickets.length) notFound();

  const name =
    orders.find((order) => order.customerName)?.customerName ||
    tickets.find((ticket) => ticket.customerName)?.customerName ||
    email;
  const revenue = orders.reduce(
    (sum, order) => sum + (order.paymentStatus === "paid" ? order.amount : 0),
    0,
  );
  const activeAccess = orders.filter(
    (order) => order.fulfillmentStatus === "fulfilled",
  ).length;
  const openTickets = tickets.filter(
    (ticket) => ticket.status !== "resolved",
  ).length;

  return (
    <PageContent
      title={name}
      titleInfo={{ title: "Customer purchases, access, and support history." }}
      controls={
        <div className="flex items-center gap-2">
          <ButtonLink
            href={`/${slug}/vpn/customers`}
            variant="secondary"
            className="h-9 px-3 text-sm"
          >
            All customers
          </ButtonLink>
          <ButtonLink
            href={`/${slug}/vpn/support`}
            variant="primary"
            className="h-9 px-3 text-sm"
          >
            Open Support
          </ButtonLink>
        </div>
      }
    >
      <PageWidthWrapper className="pb-10">
        <div className="mb-5 flex items-center gap-3">
          <UserAvatar
            user={{
              id: email,
              name,
              email,
              image: null,
              role: activeAccess ? "member" : "viewer",
            }}
            className="size-10 border-none"
          />
          <div className="min-w-0">
            <p className="text-content-emphasis truncate text-sm font-medium">
              {name}
            </p>
            <p className="text-content-subtle truncate text-sm">{email}</p>
          </div>
        </div>

        <MetricCards
          items={[
            { label: "Revenue", value: money(revenue), detail: "Paid orders" },
            { label: "Orders", value: orders.length, detail: "All purchases" },
            {
              label: "VPN access",
              value: activeAccess,
              detail: activeAccess ? "Provisioned" : "Not provisioned",
            },
            {
              label: "Support",
              value: openTickets,
              detail: openTickets ? "Needs attention" : "No open tickets",
            },
          ]}
        />

        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Order history
            </h2>
            <p className="text-content-subtle text-sm">
              Payments and VPN provisioning
            </p>
          </div>
          <CustomerOrdersTable orders={orders} />
        </section>

        <section className="mt-8">
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Support history
            </h2>
            <p className="text-content-subtle text-sm">
              Requests and internal notes
            </p>
          </div>
          <CustomerSupportTable tickets={tickets} />
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
