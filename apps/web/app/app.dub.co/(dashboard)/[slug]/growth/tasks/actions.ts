"use server";

import { getSession } from "@/lib/auth/utils";
import { GrowthTask, tasksFromStore } from "@/lib/growth/tasks";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const text = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();

async function editorWorkspace(slug: string) {
  const session = await getSession();
  const workspace = session?.user.id
    ? await prisma.project.findFirst({
        where: {
          slug,
          users: {
            some: {
              userId: session.user.id,
              role: { in: ["owner", "member"] },
            },
          },
        },
        select: { id: true },
      })
    : null;
  if (!workspace) throw new Error("Growth editor access required");
  return workspace.id;
}

function taskValues(formData: FormData) {
  const requestedStatus = text(formData, "status");
  const requestedPriority = text(formData, "priority");
  return {
    title: text(formData, "title").slice(0, 120),
    description: text(formData, "description").slice(0, 500),
    status: (["backlog", "in_progress", "review", "done"].includes(
      requestedStatus,
    )
      ? requestedStatus
      : "backlog") as GrowthTask["status"],
    priority: (["low", "medium", "high"].includes(requestedPriority)
      ? requestedPriority
      : "medium") as GrowthTask["priority"],
    assignee: text(formData, "assignee").slice(0, 80),
    dueDate: text(formData, "dueDate") || null,
  };
}

async function mutateTasks(
  projectId: string,
  mutate: (tasks: GrowthTask[]) => GrowthTask[],
) {
  await prisma.$transaction(async (tx) => {
    const workspace = await tx.project.findUniqueOrThrow({
      where: { id: projectId },
      select: { store: true },
    });
    const store = (
      workspace.store &&
      typeof workspace.store === "object" &&
      !Array.isArray(workspace.store)
        ? workspace.store
        : {}
    ) as Record<string, Prisma.JsonValue>;
    const growthTasks = mutate(tasksFromStore(store));
    await tx.project.update({
      where: { id: projectId },
      data: { store: { ...store, growthTasks } as Prisma.InputJsonValue },
    });
  });
}

export async function createGrowthTask(formData: FormData) {
  const slug = text(formData, "slug");
  const projectId = await editorWorkspace(slug);
  const values = taskValues(formData);
  if (values.title.length < 3)
    throw new Error("Task title must contain at least 3 characters");
  await mutateTasks(projectId, (tasks) => [
    { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...values },
    ...tasks,
  ]);
  revalidatePath(`/${slug}/growth/tasks`);
}

export async function updateGrowthTask(formData: FormData) {
  const slug = text(formData, "slug");
  const projectId = await editorWorkspace(slug);
  const id = text(formData, "id");
  const values = taskValues(formData);
  await mutateTasks(projectId, (tasks) =>
    tasks.map((task) => (task.id === id ? { ...task, ...values } : task)),
  );
  revalidatePath(`/${slug}/growth/tasks`);
}

export async function deleteGrowthTask(formData: FormData) {
  const slug = text(formData, "slug");
  const projectId = await editorWorkspace(slug);
  const id = text(formData, "id");
  await mutateTasks(projectId, (tasks) =>
    tasks.filter((task) => task.id !== id),
  );
  revalidatePath(`/${slug}/growth/tasks`);
}
