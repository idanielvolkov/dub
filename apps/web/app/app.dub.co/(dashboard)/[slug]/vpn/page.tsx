import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { vpnPlansFromStore } from "@/lib/remnawave/plans";
import { vpnOrdersFromStore } from "@/lib/vpn/orders";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { TransactionsTable } from "@/ui/vpn/finance-tables";
import { ButtonLink, MetricCards } from "@dub/ui";

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
      titleInfo={{ title: "Track revenue, orders, and plan performance." }}
      controls={
        <>
          <ButtonLink
            href={`/${slug}/vpn/plans`}
            variant="secondary"
            className="h-9 px-3 text-sm"
          >
            Manage plans
          </ButtonLink>
          <ButtonLink
            href={`/${slug}/vpn/orders`}
            variant="primary"
            className="h-9 px-3 text-sm"
          >
            View orders
          </ButtonLink>
        </>
      }
    >
      <PageWidthWrapper className="pb-10">
        <MetricCards
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
          <TransactionsTable orders={recentOrders} />
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
