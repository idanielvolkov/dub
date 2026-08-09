import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vpnPlansFromStore } from "@/lib/remnawave/plans";
import { vpnOrdersFromStore } from "@/lib/vpn/orders";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OrdersTable } from "@/ui/vpn/orders-table";
import { VpnStats } from "@/ui/vpn/vpn-ui";

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
            select: { role: true },
            take: 1,
          },
        },
      })
    : null;
  const role = workspace?.users[0]?.role;
  const orders = vpnOrdersFromStore(workspace?.store);
  const plans = vpnPlansFromStore(workspace?.store).filter(
    (plan) => !plan.archived,
  );
  const paid = orders.filter((order) => order.paymentStatus === "paid");
  const revenue = paid.reduce((sum, order) => sum + order.amount, 0);

  return (
    <PageContent
      title="Orders"
      titleInfo={{ title: "Track VPN sales, payments, and provisioning." }}
    >
      <PageWidthWrapper className="space-y-6 pb-10">
        <VpnStats
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
          canEdit={role === "owner" || role === "member"}
          isOwner={role === "owner"}
        />
      </PageWidthWrapper>
    </PageContent>
  );
}
