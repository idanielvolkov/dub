import "server-only";

export type FinanceExpense = {
  id: string;
  description: string;
  category: "infrastructure" | "marketing" | "software" | "payroll" | "other";
  amount: number;
  currency: "USD";
  incurredAt: string;
  createdAt: string;
};

export function financeExpensesFromStore(store: unknown): FinanceExpense[] {
  if (!store || typeof store !== "object" || Array.isArray(store)) return [];
  const value = (store as { financeExpenses?: unknown }).financeExpenses;
  return Array.isArray(value) ? (value as FinanceExpense[]) : [];
}
