import { getSession } from "@/lib/auth/utils";
import { canAccessPlatformArea } from "@/lib/platform-access";
import { prisma } from "@/lib/prisma";
import { vpnPlansFromStore } from "@/lib/remnawave/plans";
import { vpnOrdersFromStore } from "@/lib/vpn/orders";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { CreateOrderButton, OrdersTable } from "@/ui/vpn/orders-table";
import { MetricCards } from "@dub/ui";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  const workspace = session?.user.id
    ? await prisma.project.findFirst({
        where: { slug, users: { some: { userId: session.user.id } } },
        select: {
          store: true,
          users: {
            where: { userId: session.user.id },
            select: { role: true, workspacePreferences: true },
            take: 1,
          },
        },
      })
    : null;
  const membership = workspace?.users[0];
  const canEdit = membership
    ? canAccessPlatformArea({
        role: membership.role,
        workspacePreferences: membership.workspacePreferences,
        area: "workspace",
        minimum: "manage",
      })
    : false;
  const canProvision = membership
    ? canAccessPlatformArea({
        role: membership.role,
        workspacePreferences: membership.workspacePreferences,
        area: "remnawave",
        minimum: "manage",
      })
    : false;
  const orders = vpnOrdersFromStore(workspace?.store);
  const plans = vpnPlansFromStore(workspace?.store).filter(
    (plan) => !plan.archived,
  );
  const paid = orders.filter((order) => order.paymentStatus === "paid");
  const revenue = paid.reduce((sum, order) => sum + order.amount, 0);

  return (
    <PageContent
      title="Orders"
      titleInfo={{ title: "Track sales, payments, and fulfillment." }}
      controls={
        canEdit ? <CreateOrderButton slug={slug} plans={plans} /> : undefined
      }
    >
      <PageWidthWrapper className="space-y-6 pb-10">
        <MetricCards
          items={[
            { label: "Orders", value: orders.length, detail: "All sales" },
            {
              label: "Paid",
              value: paid.length,
              detail: "Confirmed payments",
            },
            {
              label: "Provisioned",
              value: orders.filter(
                (order) => order.fulfillmentStatus === "fulfilled",
              ).length,
              detail: "VPN access issued",
            },
            {
              label: "Revenue",
              value: `$${revenue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
              detail: "Marked as paid",
            },
          ]}
        />
        <OrdersTable
          slug={slug}
          orders={orders}
          plans={plans}
          canEdit={canEdit}
          canProvision={canEdit && canProvision}
        />
      </PageWidthWrapper>
    </PageContent>
  );
}
