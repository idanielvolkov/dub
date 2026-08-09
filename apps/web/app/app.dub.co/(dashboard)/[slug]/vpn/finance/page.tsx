import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { vpnOrdersFromStore } from "@/lib/vpn/orders";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import { Badge, CardList, CardListCard, EmptyState } from "@dub/ui";
import { MoneyBills2 } from "@dub/ui/icons";

const money = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export default async function FinancePage({
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
  const paid = orders.filter((order) => order.paymentStatus === "paid");
  const pending = orders.filter((order) => order.paymentStatus !== "paid");
  const revenue = paid.reduce((sum, order) => sum + order.amount, 0);
  const average = paid.length ? revenue / paid.length : 0;

  return (
    <PageContent
      title="Finance"
      titleInfo={{
        title: "Track revenue, payments, and outstanding balances.",
      }}
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
              label: "Paid orders",
              value: paid.length,
              detail: `${orders.length} total orders`,
            },
            {
              label: "Outstanding",
              value: pending.length,
              detail: "Awaiting payment",
            },
            {
              label: "Average order",
              value: money(average),
              detail: "Across paid orders",
            },
          ]}
        />
        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Transactions
            </h2>
            <p className="text-content-subtle text-sm">
              Latest customer payments and balances
            </p>
          </div>
          {orders.length ? (
            <CardList variant="compact">
              {[...orders]
                .reverse()
                .slice(0, 50)
                .map((order) => (
                  <CardListCard key={order.id} hoverStateEnabled={false}>
                    <div className="grid gap-3 text-sm sm:grid-cols-[1fr_160px_120px_100px] sm:items-center">
                      <div className="min-w-0">
                        <p className="text-content-emphasis truncate font-medium">
                          {order.customerName}
                        </p>
                        <p className="text-content-subtle truncate text-xs">
                          {order.customerEmail}
                        </p>
                      </div>
                      <span className="truncate">{order.planName}</span>
                      <span className="font-medium">{money(order.amount)}</span>
                      <Badge
                        variant={
                          order.paymentStatus === "paid" ? "green" : "gray"
                        }
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </CardListCard>
                ))}
            </CardList>
          ) : (
            <div className="py-16">
              <EmptyState
                icon={MoneyBills2}
                title="No transactions yet"
                description="Paid and pending orders will appear here."
              />
            </div>
          )}
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
