"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createRemnawaveSquad,
  deleteRemnawaveHost,
  deleteRemnawaveSquad,
  restartRemnawaveNode,
  setRemnawaveNodeEnabled,
  updateRemnawaveConfigProfile,
  updateRemnawaveHost,
  updateRemnawaveNode,
  updateRemnawaveSquad,
  updateRemnawaveSubscriptionSettings,
} from "@/lib/remnawave/client";
import { revalidatePath } from "next/cache";

async function authorize(slug: string) {
  const session = await getSession();
  const workspace = session?.user.id
    ? await prisma.project.findFirst({
        where: {
          slug,
          users: { some: { userId: session.user.id, role: "owner" } },
        },
        select: { id: true },
      })
    : null;
  if (!workspace) throw new Error("Unauthorized workspace access");
}

const text = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();

export async function saveNode(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await updateRemnawaveNode({
    uuid: text(formData, "uuid"),
    name: text(formData, "name").slice(0, 64),
    countryCode: text(formData, "countryCode").toUpperCase().slice(0, 2),
  });
  revalidatePath(`/${slug}/operations/nodes`);
}

export async function changeNodeState(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await setRemnawaveNodeEnabled(
    text(formData, "uuid"),
    text(formData, "enabled") === "true",
  );
  revalidatePath(`/${slug}/operations/nodes`);
}

export async function restartNode(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await restartRemnawaveNode(text(formData, "uuid"));
  revalidatePath(`/${slug}/operations/nodes`);
}

export async function saveHost(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await updateRemnawaveHost({
    uuid: text(formData, "uuid"),
    remark: text(formData, "remark").slice(0, 40),
    address: text(formData, "address"),
    port: Math.max(1, Math.min(65535, Number(formData.get("port")) || 443)),
    isDisabled: formData.get("isDisabled") === "on",
    isHidden: formData.get("isHidden") === "on",
  });
  revalidatePath(`/${slug}/operations/hosts`);
}

export async function removeHost(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await deleteRemnawaveHost(text(formData, "uuid"));
  revalidatePath(`/${slug}/operations/hosts`);
}

export async function saveProfile(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  const rawConfig = text(formData, "config");
  const config = JSON.parse(rawConfig) as Record<string, unknown>;
  await updateRemnawaveConfigProfile({
    uuid: text(formData, "uuid"),
    name: text(formData, "name"),
    config,
  });
  revalidatePath(`/${slug}/operations/configurations`);
}

export async function addSquad(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  const inbounds = text(formData, "inbounds").split(",").filter(Boolean);
  await createRemnawaveSquad({ name: text(formData, "name"), inbounds });
  revalidatePath(`/${slug}/operations/configurations`);
}

export async function saveSquad(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await updateRemnawaveSquad({
    uuid: text(formData, "uuid"),
    name: text(formData, "name"),
    inbounds: text(formData, "inbounds").split(",").filter(Boolean),
  });
  revalidatePath(`/${slug}/operations/configurations`);
}

export async function removeSquad(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await deleteRemnawaveSquad(text(formData, "uuid"));
  revalidatePath(`/${slug}/operations/configurations`);
}

export async function saveSubscriptionSettings(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await updateRemnawaveSubscriptionSettings({
    uuid: text(formData, "uuid"),
    randomizeHosts: formData.get("randomizeHosts") === "on",
    serveJsonAtBaseSubscription:
      formData.get("serveJsonAtBaseSubscription") === "on",
    isShowCustomRemarks: formData.get("isShowCustomRemarks") === "on",
  });
  revalidatePath(`/${slug}/operations/subscriptions`);
}
