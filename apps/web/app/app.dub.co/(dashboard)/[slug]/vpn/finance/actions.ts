"use server";

import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { FinanceExpense, financeExpensesFromStore } from "@/lib/vpn/finance";
import { recordWorkspaceActivity } from "@/lib/workspace/activity";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const text = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();

async function context(slug: string) {
  const session = await getSession();
  const workspace = session?.user.id
    ? await prisma.project.findFirst({
        where: {
          slug,
          users: {
            some: {
              userId: session.user.id,
              role: { in: ["owner", "billing"] },
            },
          },
        },
        select: { id: true },
      })
    : null;
  if (!workspace || !session?.user.id)
    throw new Error("Finance access required");
  return { workspace, userId: session.user.id };
}

async function mutateExpenses(
  projectId: string,
  mutate: (expenses: FinanceExpense[]) => FinanceExpense[],
) {
  await prisma.$transaction(async (tx) => {
    const project = await tx.project.findUniqueOrThrow({
      where: { id: projectId },
      select: { store: true },
    });
    const store = (
      project.store &&
      typeof project.store === "object" &&
      !Array.isArray(project.store)
        ? project.store
        : {}
    ) as Record<string, Prisma.JsonValue>;
    await tx.project.update({
      where: { id: projectId },
      data: {
        store: {
          ...store,
          financeExpenses: mutate(financeExpensesFromStore(store)),
        } as Prisma.InputJsonValue,
      },
    });
  });
}

export async function createFinanceExpense(formData: FormData) {
  const slug = text(formData, "slug");
  const { workspace, userId } = await context(slug);
  const amount = Number(text(formData, "amount"));
  if (!Number.isFinite(amount) || amount <= 0)
    throw new Error("Enter a valid amount");
  const requestedCategory = text(formData, "category");
  const category = (
    ["infrastructure", "marketing", "software", "payroll", "other"].includes(
      requestedCategory,
    )
      ? requestedCategory
      : "other"
  ) as FinanceExpense["category"];
  const expense: FinanceExpense = {
    id: crypto.randomUUID(),
    description: text(formData, "description").slice(0, 160),
    category,
    amount,
    currency: "USD",
    incurredAt:
      text(formData, "incurredAt") || new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  };
  if (!expense.description) throw new Error("Enter an expense description");
  await mutateExpenses(workspace.id, (expenses) => [expense, ...expenses]);
  await recordWorkspaceActivity({
    workspaceId: workspace.id,
    userId,
    action: "created",
    resourceType: "expense",
    resourceId: expense.id,
    description: `Recorded ${expense.description} expense`,
    changeSet: { amount, category },
  });
  revalidatePath(`/${slug}/vpn/finance`);
  revalidatePath(`/${slug}/vpn/activity`);
}

export async function deleteFinanceExpense(formData: FormData) {
  const slug = text(formData, "slug");
  const { workspace, userId } = await context(slug);
  const id = text(formData, "id");
  await mutateExpenses(workspace.id, (expenses) =>
    expenses.filter((expense) => expense.id !== id),
  );
  await recordWorkspaceActivity({
    workspaceId: workspace.id,
    userId,
    action: "deleted",
    resourceType: "expense",
    resourceId: id,
    description: "Deleted an expense",
  });
  revalidatePath(`/${slug}/vpn/finance`);
  revalidatePath(`/${slug}/vpn/activity`);
}
