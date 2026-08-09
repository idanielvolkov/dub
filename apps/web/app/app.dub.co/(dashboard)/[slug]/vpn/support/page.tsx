import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { vpnOrdersFromStore } from "@/lib/vpn/orders";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import { Badge, ButtonLink, CardList, CardListCard, EmptyState } from "@dub/ui";
import { LifeRing } from "@dub/ui/icons";

export default async function SupportPage({
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
  const awaiting = orders.filter(
    (order) => order.fulfillmentStatus !== "fulfilled",
  );
  const unpaid = orders.filter((order) => order.paymentStatus !== "paid");

  return (
    <PageContent
      title="Support"
      titleInfo={{ title: "Resolve customer access and payment issues." }}
      controls={
        <ButtonLink
          href={`/${slug}/vpn/orders`}
          variant="primary"
          className="h-9 px-3 text-sm"
        >
          View all orders
        </ButtonLink>
      }
    >
      <PageWidthWrapper className="pb-10">
        <VpnStats
          items={[
            {
              label: "Open requests",
              value: awaiting.length + unpaid.length,
              detail: "Requires attention",
            },
            {
              label: "Access requests",
              value: awaiting.length,
              detail: "Awaiting fulfillment",
            },
            {
              label: "Payment issues",
              value: unpaid.length,
              detail: "Awaiting payment",
            },
            {
              label: "Resolved",
              value: orders.filter(
                (order) => order.fulfillmentStatus === "fulfilled",
              ).length,
              detail: "Access delivered",
            },
          ]}
        />
        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Support queue
            </h2>
            <p className="text-content-subtle text-sm">
              Orders that require a team response
            </p>
          </div>
          {awaiting.length || unpaid.length ? (
            <CardList variant="compact">
              {orders
                .filter(
                  (order) =>
                    order.fulfillmentStatus !== "fulfilled" ||
                    order.paymentStatus !== "paid",
                )
                .map((order) => (
                  <CardListCard key={order.id} hoverStateEnabled={false}>
                    <div className="grid gap-3 text-sm sm:grid-cols-[1fr_160px_140px] sm:items-center">
                      <div className="min-w-0">
                        <p className="text-content-emphasis truncate font-medium">
                          {order.customerName}
                        </p>
                        <p className="text-content-subtle truncate text-xs">
                          {order.customerEmail}
                        </p>
                      </div>
                      <span className="truncate">{order.planName}</span>
                      <Badge variant="orange">
                        {order.paymentStatus !== "paid"
                          ? "Payment pending"
                          : "Access pending"}
                      </Badge>
                    </div>
                  </CardListCard>
                ))}
            </CardList>
          ) : (
            <div className="py-16">
              <EmptyState
                icon={LifeRing}
                title="Inbox zero"
                description="There are no customer issues requiring attention."
              />
            </div>
          )}
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
