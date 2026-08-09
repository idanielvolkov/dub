"use server";

import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import {
  createRemnawaveUser,
  deleteRemnawaveUser,
  extendAllRemnawaveUsers,
  resetAllRemnawaveUserTraffic,
  resetRemnawaveUserTraffic,
  revokeRemnawaveUserSubscription,
  setRemnawaveUserEnabled,
  updateRemnawaveUser,
} from "@/lib/remnawave/client";
import { revalidatePath } from "next/cache";

export async function createSubscriber(formData: FormData) {
  const username = String(formData.get("username") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .slice(0, 36);
  const durationDays = Math.max(
    1,
    Math.min(3650, Number(formData.get("durationDays")) || 30),
  );
  const slug = String(formData.get("slug") || "");
  const email = String(formData.get("email") || "")
    .trim()
    .slice(0, 128);
  const description = String(formData.get("description") || "")
    .trim()
    .slice(0, 500);
  const trafficGb = Math.min(
    1_000_000,
    Math.max(0, Number(formData.get("trafficGb")) || 0),
  );
  const deviceLimit = Math.min(
    999,
    Math.max(0, Math.round(Number(formData.get("deviceLimit")) || 0)),
  );
  const requestedStrategy = String(
    formData.get("trafficLimitStrategy") || "NO_RESET",
  );
  const trafficLimitStrategy = ["NO_RESET", "DAY", "WEEK", "MONTH"].includes(
    requestedStrategy,
  )
    ? (requestedStrategy as "NO_RESET" | "DAY" | "WEEK" | "MONTH")
    : "NO_RESET";

  if (username.length < 3) {
    throw new Error("Subscriber name must contain at least 3 characters");
  }

  const session = await getSession();
  const workspace = session?.user.id
    ? await prisma.project.findFirst({
        where: { slug, users: { some: { userId: session.user.id } } },
        select: { id: true },
      })
    : null;
  if (!workspace) throw new Error("Unauthorized workspace access");

  await createRemnawaveUser({
    username,
    expireAt: new Date(
      Date.now() + durationDays * 24 * 60 * 60 * 1000,
    ).toISOString(),
    email: email || undefined,
    description: description || undefined,
    trafficLimitBytes: Math.round(trafficGb * 1024 ** 3),
    trafficLimitStrategy,
    hwidDeviceLimit: deviceLimit || undefined,
  });

  revalidatePath(`/${slug}/operations/users`);
}

async function authorize(slug: string) {
  const session = await getSession();
  const workspace = session?.user.id
    ? await prisma.project.findFirst({
        where: { slug, users: { some: { userId: session.user.id } } },
        select: { id: true },
      })
    : null;
  if (!workspace) throw new Error("Unauthorized workspace access");
}

const text = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();

export async function saveSubscriber(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  const trafficGb = Math.max(0, Number(formData.get("trafficGb")) || 0);
  const deviceLimit = Math.max(0, Number(formData.get("deviceLimit")) || 0);
  await updateRemnawaveUser({
    uuid: text(formData, "uuid"),
    expireAt: new Date(
      `${text(formData, "expireAt")}T23:59:59.000Z`,
    ).toISOString(),
    trafficLimitBytes: Math.round(trafficGb * 1024 ** 3),
    trafficLimitStrategy: text(formData, "trafficLimitStrategy") as
      | "NO_RESET"
      | "DAY"
      | "WEEK"
      | "MONTH",
    hwidDeviceLimit: deviceLimit || null,
    email: text(formData, "email") || null,
    description: text(formData, "description") || null,
  });
  revalidatePath(`/${slug}/operations/users`);
  revalidatePath(`/${slug}/operations/users`);
}

export async function changeSubscriberState(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await setRemnawaveUserEnabled(
    text(formData, "uuid"),
    text(formData, "enabled") === "true",
  );
  revalidatePath(`/${slug}/operations/users`);
  revalidatePath(`/${slug}/operations/users`);
}

export async function resetSubscriberTraffic(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await resetRemnawaveUserTraffic(text(formData, "uuid"));
  revalidatePath(`/${slug}/operations/users`);
  revalidatePath(`/${slug}/operations/users`);
}

export async function resetAllSubscriberTraffic(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await resetAllRemnawaveUserTraffic();
  revalidatePath(`/${slug}/operations/users`);
  revalidatePath(`/${slug}/operations/traffic`);
}

export async function extendAllSubscribers(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  const extendDays = Math.min(
    9999,
    Math.max(1, Number(formData.get("extendDays")) || 0),
  );
  await extendAllRemnawaveUsers(extendDays);
  revalidatePath(`/${slug}/operations/users`);
}

export async function revokeSubscriber(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await revokeRemnawaveUserSubscription(text(formData, "uuid"));
  revalidatePath(`/${slug}/operations/users`);
  revalidatePath(`/${slug}/operations/users`);
}

export async function removeSubscriber(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await deleteRemnawaveUser(text(formData, "uuid"));
  revalidatePath(`/${slug}/operations/users`);
  revalidatePath(`/${slug}/operations/users`);
}
