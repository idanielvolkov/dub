"use client";

import { FinanceExpense } from "@/lib/vpn/finance";
import { VpnOrder } from "@/lib/vpn/orders";
import { OperationSubmit } from "@/ui/shared/operation-submit";
import {
  Button,
  EmptyState,
  FormCombobox,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  StatusBadge,
  Table,
  TableRowMenu,
  useTable,
} from "@dub/ui";
import { MoneyBills2 } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  createFinanceExpense,
  deleteFinanceExpense,
} from "../../app/app.dub.co/(dashboard)/[slug]/vpn/finance/actions";

const money = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export function CreateExpenseButton({ slug }: { slug: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button text="Add expense" onClick={() => setShowModal(true)} />
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <ModalHeader
          title="Add expense"
          description="Record an infrastructure or operating cost."
        />
        <ModalBody asChild className="bg-bg-muted">
          <form action={createFinanceExpense} className="space-y-4">
            <input type="hidden" name="slug" value={slug} />
            <div className="grid gap-1.5">
              <Label htmlFor="expense-description">Description</Label>
              <Input
                id="expense-description"
                name="description"
                placeholder="Monthly server invoice"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="expense-amount">Amount</Label>
                <Input
                  id="expense-amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="expense-date">Date</Label>
                <Input
                  id="expense-date"
                  name="incurredAt"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="expense-category">Category</Label>
              <FormCombobox
                id="expense-category"
                name="category"
                defaultValue="infrastructure"
                options={[
                  { value: "infrastructure", label: "Infrastructure" },
                  { value: "marketing", label: "Marketing" },
                  { value: "software", label: "Software" },
                  { value: "payroll", label: "Payroll" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>
            <ModalFooter className="-mx-6 -mb-5">
              <Button
                variant="secondary"
                text="Cancel"
                onClick={() => setShowModal(false)}
              />
              <OperationSubmit>Add expense</OperationSubmit>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}

export function ExpensesTable({
  slug,
  expenses,
  canManage,
}: {
  slug: string;
  expenses: FinanceExpense[];
  canManage: boolean;
}) {
  const [selectedExpense, setSelectedExpense] = useState<FinanceExpense | null>(
    null,
  );
  const columns = useMemo<ColumnDef<FinanceExpense>[]>(
    () => [
      {
        accessorKey: "description",
        header: "Expense",
        cell: ({ row }) => (
          <span className="text-content-emphasis font-medium">
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <StatusBadge icon={null} variant="neutral">
            {row.original.category}
          </StatusBadge>
        ),
      },
      {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => money(row.original.amount),
      },
      {
        accessorKey: "incurredAt",
        header: "Date",
      },
      ...(canManage
        ? [
            {
              id: "actions",
              header: "Actions",
              meta: { disableTruncate: true },
              cell: ({ row }: { row: { original: FinanceExpense } }) => (
                <TableRowMenu
                  actions={[
                    {
                      label: "Delete expense",
                      variant: "danger",
                      onClick: () => setSelectedExpense(row.original),
                    },
                  ]}
                />
              ),
            } satisfies ColumnDef<FinanceExpense>,
          ]
        : []),
    ],
    [canManage],
  );
  const table = useTable({ data: expenses, columns });

  return (
    <>
      <Table
        {...table}
        resourceName={(plural) => (plural ? "expenses" : "expense")}
        emptyState={
          <EmptyState
            icon={MoneyBills2}
            title="No expenses yet"
            description="Record a cost to calculate net income."
          />
        }
      />
      <Modal
        showModal={Boolean(selectedExpense)}
        setShowModal={(open) => !open && setSelectedExpense(null)}
      >
        {selectedExpense && (
          <>
            <ModalHeader
              title="Delete expense"
              description={`This will permanently delete “${selectedExpense.description}”.`}
            />
            <ModalFooter>
              <Button
                variant="secondary"
                text="Cancel"
                onClick={() => setSelectedExpense(null)}
              />
              <form action={deleteFinanceExpense}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={selectedExpense.id} />
                <OperationSubmit destructive>Delete expense</OperationSubmit>
              </form>
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  );
}

export function TransactionsTable({ orders }: { orders: VpnOrder[] }) {
  const columns = useMemo<ColumnDef<VpnOrder>[]>(
    () => [
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <p className="text-content-emphasis font-medium">
              {row.original.customerName || row.original.customerEmail}
            </p>
            <p className="text-content-subtle text-xs">
              {row.original.customerEmail}
            </p>
          </div>
        ),
      },
      { accessorKey: "planName", header: "Plan" },
      {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => money(row.original.amount),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={
              row.original.paymentStatus === "paid" ? "success" : "pending"
            }
          >
            {row.original.paymentStatus}
          </StatusBadge>
        ),
      },
      {
        id: "date",
        header: "Date",
        cell: ({ row }) =>
          new Intl.DateTimeFormat("en", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(row.original.createdAt)),
      },
    ],
    [],
  );
  const table = useTable({ data: orders, columns });

  return (
    <Table
      {...table}
      resourceName={(plural) => (plural ? "transactions" : "transaction")}
      emptyState={
        <EmptyState
          icon={MoneyBills2}
          title="No transactions yet"
          description="Paid and pending orders will appear here."
        />
      }
    />
  );
}
