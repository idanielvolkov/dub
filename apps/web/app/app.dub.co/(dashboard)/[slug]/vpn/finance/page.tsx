import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { financeExpensesFromStore } from "@/lib/vpn/finance";
import { vpnOrdersFromStore } from "@/lib/vpn/orders";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import { Badge, CardList, CardListCard, EmptyState, Input } from "@dub/ui";
import { MoneyBills2 } from "@dub/ui/icons";
import { createFinanceExpense, deleteFinanceExpense } from "./actions";

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
    select: {
      store: true,
      users: { where: { userId: session?.user.id }, select: { role: true } },
    },
  });
  const orders = vpnOrdersFromStore(workspace.store);
  const expenses = financeExpensesFromStore(workspace.store);
  const canManage = ["owner", "billing"].includes(
    workspace.users[0]?.role || "viewer",
  );
  const paid = orders.filter((order) => order.paymentStatus === "paid");
  const pending = orders.filter((order) => order.paymentStatus !== "paid");
  const revenue = paid.reduce((sum, order) => sum + order.amount, 0);
  const costs = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <PageContent
      title="Finance"
      titleInfo={{ title: "Track revenue, expenses, and net income." }}
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
              label: "Expenses",
              value: money(costs),
              detail: `${expenses.length} recorded costs`,
            },
            {
              label: "Net income",
              value: money(revenue - costs),
              detail: "Revenue after expenses",
            },
            {
              label: "Outstanding",
              value: pending.length,
              detail: "Payments awaiting confirmation",
            },
          ]}
        />
        {canManage && (
          <section className="mt-6">
            <div className="mb-3">
              <h2 className="text-content-emphasis text-sm font-semibold">
                Record expense
              </h2>
              <p className="text-content-subtle text-sm">
                Track infrastructure and operating costs
              </p>
            </div>
            <CardList>
              <CardListCard innerClassName="p-5" hoverStateEnabled={false}>
                <form
                  action={createFinanceExpense}
                  className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_150px_180px_150px_auto] lg:items-end"
                >
                  <input type="hidden" name="slug" value={slug} />
                  <Input
                    name="description"
                    placeholder="Expense description"
                    required
                    className="h-9"
                  />
                  <Input
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Amount, USD"
                    required
                    className="h-9"
                  />
                  <FormCombobox
                    name="category"
                    defaultValue="infrastructure"
                    className="h-9"
                    options={[
                      { value: "infrastructure", label: "Infrastructure" },
                      { value: "marketing", label: "Marketing" },
                      { value: "software", label: "Software" },
                      { value: "payroll", label: "Payroll" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                  <Input
                    name="incurredAt"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="h-9"
                  />
                  <OperationSubmit>Add expense</OperationSubmit>
                </form>
              </CardListCard>
            </CardList>
          </section>
        )}
        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Expenses
            </h2>
            <p className="text-content-subtle text-sm">
              Operating costs recorded by your finance team
            </p>
          </div>
          {expenses.length ? (
            <CardList variant="compact">
              {expenses.map((expense) => (
                <CardListCard key={expense.id} hoverStateEnabled={false}>
                  <div className="grid gap-3 text-sm sm:grid-cols-[1fr_150px_120px_100px] sm:items-center">
                    <div>
                      <p className="text-content-emphasis font-medium">
                        {expense.description}
                      </p>
                      <p className="text-content-subtle text-xs">
                        {expense.incurredAt}
                      </p>
                    </div>
                    <Badge variant="gray">{expense.category}</Badge>
                    <span className="font-medium">{money(expense.amount)}</span>
                    {canManage && (
                      <form
                        action={deleteFinanceExpense}
                        className="justify-self-end"
                      >
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="id" value={expense.id} />
                        <OperationSubmit
                          destructive
                          confirmMessage={`Delete ${expense.description}?`}
                        >
                          Delete
                        </OperationSubmit>
                      </form>
                    )}
                  </div>
                </CardListCard>
              ))}
            </CardList>
          ) : (
            <div className="py-10">
              <EmptyState
                icon={MoneyBills2}
                title="No expenses yet"
                description="Record a cost to calculate net income."
              />
            </div>
          )}
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
