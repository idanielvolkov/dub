import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { vpnPlansFromStore } from "@/lib/remnawave/plans";
import { vpnOrdersFromStore } from "@/lib/vpn/orders";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import {
  ButtonLink,
  CardList,
  CardListCard,
  EmptyState,
  StatusBadge,
} from "@dub/ui";
import { InvoiceDollar } from "@dub/ui/icons";

const money = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export default async function BusinessOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  const workspace = session?.user.id
    ? await prisma.project.findFirst({
        where: { slug, users: { some: { userId: session.user.id } } },
        select: { store: true },
      })
    : null;
  const plans = vpnPlansFromStore(workspace?.store);
  const orders = vpnOrdersFromStore(workspace?.store);
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
  const fulfilledOrders = orders.filter(
    (order) => order.fulfillmentStatus === "fulfilled",
  );
  const revenue = paidOrders.reduce((sum, order) => sum + order.amount, 0);
  const recentOrders = [...orders]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )
    .slice(0, 6);

  return (
    <PageContent
      title="Overview"
      titleInfo={{ title: "Plans, sales, payments, and order fulfillment." }}
      controls={
        <ButtonLink
          href={`/${slug}/vpn/orders`}
          variant="primary"
          className="h-9 px-3 text-sm"
        >
          View orders
        </ButtonLink>
      }
    >
      <PageWidthWrapper className="pb-10">
        <VpnStats
          items={[
            {
              label: "Revenue",
              value: money(revenue),
              detail: "Confirmed payments",
            },
            {
              label: "Orders",
              value: orders.length,
              detail: `${paidOrders.length} paid`,
            },
            {
              label: "Fulfilled",
              value: fulfilledOrders.length,
              detail: `${orders.length - fulfilledOrders.length} awaiting access`,
            },
            {
              label: "Active plans",
              value: plans.filter((plan) => !plan.archived).length,
              detail: "Available for sale",
            },
          ]}
        />

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-content-emphasis text-sm font-semibold">
                Recent orders
              </h2>
              <p className="text-content-subtle text-sm">
                Latest commercial activity in this workspace
              </p>
            </div>
            <ButtonLink
              href={`/${slug}/vpn/plans`}
              variant="secondary"
              className="h-9 px-3 text-sm"
            >
              Manage plans
            </ButtonLink>
          </div>
          {recentOrders.length ? (
            <CardList variant="compact">
              {recentOrders.map((order) => (
                <CardListCard key={order.id} hoverStateEnabled={false}>
                  <div className="grid min-h-10 gap-3 text-sm sm:grid-cols-[1fr_140px_120px_110px] sm:items-center">
                    <div className="min-w-0">
                      <p className="text-content-emphasis truncate font-medium">
                        {order.customerName}
                      </p>
                      <p className="text-content-subtle truncate text-xs">
                        {order.customerEmail}
                      </p>
                    </div>
                    <span className="text-content-default truncate">
                      {order.planName}
                    </span>
                    <span className="text-content-emphasis font-medium">
                      {money(order.amount)}
                    </span>
                    <StatusBadge
                      icon={null}
                      variant={
                        order.paymentStatus === "paid" ? "success" : "neutral"
                      }
                    >
                      {order.paymentStatus}
                    </StatusBadge>
                  </div>
                </CardListCard>
              ))}
            </CardList>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={InvoiceDollar}
                title="No orders yet"
                description="Create an order when a customer purchases a VPN plan."
              >
                <ButtonLink href={`/${slug}/vpn/orders`} variant="primary">
                  Create order
                </ButtonLink>
              </EmptyState>
            </div>
          )}
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
