import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { vpnOrdersFromStore } from "@/lib/vpn/orders";
import { supportTicketsFromStore } from "@/lib/vpn/support";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { UserAvatar } from "@/ui/users/user-avatar";
import {
  Badge,
  ButtonLink,
  CardList,
  CardListCard,
  EmptyState,
  MetricCards,
} from "@dub/ui";
import { LifeRing, Receipt2 } from "@dub/ui/icons";
import { notFound } from "next/navigation";

const money = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const date = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

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
          {orders.length ? (
            <CardList variant="compact">
              {orders.map((order) => (
                <CardListCard
                  key={order.id}
                  innerClassName="flex flex-wrap items-center gap-3 px-5 py-4"
                  hoverStateEnabled={false}
                >
                  <div className="min-w-48 flex-1">
                    <p className="text-content-emphasis text-sm font-medium">
                      {order.planName}
                    </p>
                    <p className="text-content-subtle text-xs">
                      {order.subscriberUsername || "Awaiting subscriber"} ·{" "}
                      {date(order.createdAt)}
                    </p>
                  </div>
                  <p className="w-24 text-sm font-medium">
                    {money(order.amount)}
                  </p>
                  <Badge
                    variant={order.paymentStatus === "paid" ? "green" : "gray"}
                  >
                    {order.paymentStatus}
                  </Badge>
                  <Badge
                    variant={
                      order.fulfillmentStatus === "fulfilled"
                        ? "blue"
                        : "orange"
                    }
                  >
                    {order.fulfillmentStatus}
                  </Badge>
                </CardListCard>
              ))}
            </CardList>
          ) : (
            <EmptyState
              icon={Receipt2}
              title="No orders"
              description="This customer does not have an order yet."
            />
          )}
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
          {tickets.length ? (
            <CardList variant="compact">
              {tickets.map((ticket) => (
                <CardListCard
                  key={ticket.id}
                  innerClassName="flex flex-wrap items-center gap-3 px-5 py-4"
                  hoverStateEnabled={false}
                >
                  <div className="min-w-48 flex-1">
                    <p className="text-content-emphasis text-sm font-medium">
                      {ticket.subject}
                    </p>
                    <p className="text-content-subtle text-xs">
                      {ticket.note || "No internal note"} ·{" "}
                      {date(ticket.updatedAt)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      ticket.priority === "urgent" || ticket.priority === "high"
                        ? "red"
                        : "gray"
                    }
                  >
                    {ticket.priority}
                  </Badge>
                  <Badge
                    variant={ticket.status === "resolved" ? "green" : "orange"}
                  >
                    {ticket.status.replace("_", " ")}
                  </Badge>
                </CardListCard>
              ))}
            </CardList>
          ) : (
            <EmptyState
              icon={LifeRing}
              title="No support history"
              description="This customer has not contacted support."
            />
          )}
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
