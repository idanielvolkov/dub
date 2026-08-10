import { getSession } from "@/lib/auth/utils";
import { canAccessPlatformArea } from "@/lib/platform-access";
import { prisma } from "@/lib/prisma";
import { financeExpensesFromStore } from "@/lib/vpn/finance";
import { vpnOrdersFromStore } from "@/lib/vpn/orders";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { AnalyticsDateRangePicker } from "@/ui/vpn/analytics-date-range-picker";
import { DubAnalyticsDashboard } from "@/ui/vpn/dub-analytics-dashboard";
import {
  CreateExpenseButton,
  ExpensesTable,
  TransactionsTable,
} from "@/ui/vpn/finance-tables";

export default async function FinancePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, session] = await Promise.all([params, getSession()]);
  const workspace = await prisma.project.findFirstOrThrow({
    where: { slug, users: { some: { userId: session?.user.id } } },
    select: {
      store: true,
      users: {
        where: { userId: session?.user.id },
        select: { role: true, workspacePreferences: true },
      },
    },
  });
  const orders = vpnOrdersFromStore(workspace.store);
  const expenses = financeExpensesFromStore(workspace.store);
  const membership = workspace.users[0];
  const canManage = membership
    ? canAccessPlatformArea({
        role: membership.role,
        workspacePreferences: membership.workspacePreferences,
        area: "finance",
        minimum: "manage",
      })
    : false;
  const paid = orders.filter((order) => order.paymentStatus === "paid");
  const pending = orders.filter((order) => order.paymentStatus !== "paid");
  const revenue = paid.reduce((sum, order) => sum + order.amount, 0);
  const costs = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <PageContent
      title="Finance"
      titleInfo={{ title: "Track revenue, expenses, and net income." }}
      controls={
        <>
          <AnalyticsDateRangePicker />
          {canManage && <CreateExpenseButton slug={slug} />}
        </>
      }
    >
      <PageWidthWrapper className="pb-10">
        <DubAnalyticsDashboard
          points={[...orders]
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            )
            .map((order) => ({
              date: order.createdAt,
              requests: order.paymentStatus === "paid" ? order.amount : 0,
              devices: 0,
              cost: order.paymentStatus === "paid" ? order.amount : 0,
            }))}
          totals={{
            requests: revenue,
            devices: costs,
            cost: revenue - costs,
          }}
          metricLabels={{
            requests: "Revenue",
            devices: "Expenses",
            cost: "Net income",
          }}
          breakdownLabels={{
            platforms: "Paid orders",
            applications: "Outstanding",
            providers: "Expenses",
          }}
          secondaryTitle="Operating expenses"
          platforms={paid.map((order) => ({
            label: order.customerName,
            value: order.amount,
            detail: order.planName,
          }))}
          applications={pending.map((order) => ({
            label: order.customerName,
            value: order.amount,
            detail: order.paymentStatus,
          }))}
          providers={expenses.map((expense) => ({
            label: expense.description,
            value: expense.amount,
            detail: expense.category,
          }))}
        />
        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Expenses
            </h2>
            <p className="text-content-subtle text-sm">
              Operating costs recorded by your finance team
            </p>
          </div>
          <ExpensesTable
            slug={slug}
            expenses={expenses}
            canManage={canManage}
          />
        </section>
        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Transactions
            </h2>
            <p className="text-content-subtle text-sm">
              Latest customer payments and balances
            </p>
          </div>
          <TransactionsTable orders={[...orders].reverse().slice(0, 50)} />
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
