import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vpnPlansFromStore } from "@/lib/remnawave/plans";
import { vpnOrdersFromStore } from "@/lib/vpn/orders";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnMetricCard, VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { Badge } from "@dub/ui";
import { createVpnOrder, fulfillVpnOrder, updateVpnOrder } from "./actions";

const inputClass =
  "h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-neutral-400";

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
  const canEdit = role === "owner" || role === "member";
  const isOwner = role === "owner";
  const orders = vpnOrdersFromStore(workspace?.store);
  const plans = vpnPlansFromStore(workspace?.store).filter(
    (plan) => !plan.archived,
  );
  const paid = orders.filter((order) => order.paymentStatus === "paid");
  const fulfilled = orders.filter(
    (order) => order.fulfillmentStatus === "fulfilled",
  ).length;
  const revenue = paid.reduce((sum, order) => sum + order.amount, 0);

  return (
    <PageContent
      title="Orders"
      titleInfo={{ title: "Track VPN sales, payments, and provisioning." }}
    >
      <PageWidthWrapper className="space-y-4 pb-10">
        <div className="grid gap-4 md:grid-cols-4">
          <VpnMetricCard
            label="Orders"
            value={orders.length}
            detail="All sales"
          />
          <VpnMetricCard
            label="Paid"
            value={paid.length}
            detail="Confirmed payments"
          />
          <VpnMetricCard
            label="Provisioned"
            value={fulfilled}
            detail="VPN access issued"
          />
          <VpnMetricCard
            label="Revenue"
            value={`$${revenue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
            detail="Marked as paid"
          />
        </div>

        {canEdit && (
          <VpnPanel>
            <VpnPanelHeader
              title="Create order"
              description="Record a sale before payment or provisioning"
            />
            <form
              action={createVpnOrder}
              className="grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-4"
            >
              <input type="hidden" name="slug" value={slug} />
              <label className="grid gap-1 text-xs text-neutral-500">
                Customer name
                <input
                  className={inputClass}
                  name="customerName"
                  placeholder="Alex Smith"
                />
              </label>
              <label className="grid gap-1 text-xs text-neutral-500">
                Email
                <input
                  className={inputClass}
                  type="email"
                  name="customerEmail"
                  required
                />
              </label>
              <label className="grid gap-1 text-xs text-neutral-500">
                Plan
                <select className={inputClass} name="planId" required>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} · ${plan.price}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs text-neutral-500">
                Note
                <input
                  className={inputClass}
                  name="note"
                  placeholder="Payment reference"
                />
              </label>
              <div className="lg:col-span-4">
                <OperationSubmit>Create order</OperationSubmit>
              </div>
            </form>
          </VpnPanel>
        )}

        <VpnPanel>
          <VpnPanelHeader
            title="Order ledger"
            description={`${orders.length} orders in this workspace`}
          />
          <div className="divide-border-subtle divide-y">
            {orders.map((order) => (
              <div key={order.id} className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-content-emphasis text-sm font-medium">
                      {order.customerName || order.customerEmail}
                    </p>
                    <p className="text-content-subtle mt-1 text-xs">
                      {order.customerEmail} · {order.planName} · ${order.amount}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        order.paymentStatus === "paid" ? "green" : "gray"
                      }
                    >
                      {order.paymentStatus}
                    </Badge>
                    <Badge
                      variant={
                        order.fulfillmentStatus === "fulfilled"
                          ? "green"
                          : "gray"
                      }
                    >
                      {order.fulfillmentStatus}
                    </Badge>
                  </div>
                </div>

                {canEdit && (
                  <form
                    action={updateVpnOrder}
                    className="grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-end"
                  >
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="id" value={order.id} />
                    <label className="grid gap-1 text-xs text-neutral-500">
                      Payment status
                      <select
                        className={inputClass}
                        name="paymentStatus"
                        defaultValue={order.paymentStatus}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </label>
                    <label className="grid gap-1 text-xs text-neutral-500">
                      Note
                      <input
                        className={inputClass}
                        name="note"
                        defaultValue={order.note}
                      />
                    </label>
                    <OperationSubmit>Save</OperationSubmit>
                  </form>
                )}

                {isOwner && order.fulfillmentStatus === "pending" && (
                  <form
                    action={fulfillVpnOrder}
                    className="border-border-subtle flex flex-wrap items-end gap-3 border-t pt-4"
                  >
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="id" value={order.id} />
                    <label className="grid min-w-64 flex-1 gap-1 text-xs text-neutral-500">
                      Subscriber username
                      <input
                        className={inputClass}
                        name="subscriberUsername"
                        placeholder="customer-name"
                        minLength={3}
                        required
                      />
                    </label>
                    <OperationSubmit confirmMessage="Create this subscriber in Remnawave using the purchased plan limits?">
                      Provision access
                    </OperationSubmit>
                  </form>
                )}
                {order.fulfillmentStatus === "fulfilled" && (
                  <p className="text-content-subtle text-xs">
                    Remnawave subscriber: {order.subscriberUsername}
                  </p>
                )}
              </div>
            ))}
            {!orders.length && (
              <div className="text-content-subtle p-10 text-center text-sm">
                No orders yet. Create the first sale above.
              </div>
            )}
          </div>
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
