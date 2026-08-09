import "server-only";

import { prisma } from "@/lib/prisma";

export type GrowthTask = {
  id: string;
  title: string;
  description: string;
  status: "backlog" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assignee: string;
  dueDate: string | null;
  createdAt: string;
};

export function tasksFromStore(store: unknown): GrowthTask[] {
  if (!store || typeof store !== "object" || Array.isArray(store)) return [];
  const value = (store as { growthTasks?: unknown }).growthTasks;
  return Array.isArray(value) ? (value as GrowthTask[]) : [];
}

export async function getGrowthTasks(slug: string) {
  const workspace = await prisma.project.findUniqueOrThrow({
    where: { slug },
    select: { store: true },
  });
  return tasksFromStore(workspace.store);
}
