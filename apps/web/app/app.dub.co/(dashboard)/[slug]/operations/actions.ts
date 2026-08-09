"use server";

import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import {
  addAllUsersToRemnawaveExternalSquad,
  createRemnawaveExternalSquad,
  createRemnawaveSquad,
  deleteRemnawaveExternalSquad,
  deleteRemnawaveHost,
  deleteRemnawaveHwidDevice,
  deleteRemnawaveNode,
  deleteRemnawaveSquad,
  removeAllUsersFromRemnawaveExternalSquad,
  resetRemnawaveNodeTraffic,
  restartAllRemnawaveNodes,
  restartRemnawaveNode,
  setRemnawaveNodeEnabled,
  updateRemnawaveConfigProfile,
  updateRemnawaveExternalSquad,
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
    name: text(formData, "name").slice(0, 30),
    countryCode: text(formData, "countryCode").toUpperCase().slice(0, 2),
    isTrafficTrackingActive: formData.get("isTrafficTrackingActive") === "on",
    trafficLimitBytes: Math.round(
      Math.max(0, Number(formData.get("trafficLimitGb")) || 0) * 1024 ** 3,
    ),
    notifyPercent: Math.min(
      100,
      Math.max(0, Number(formData.get("notifyPercent")) || 0),
    ),
    trafficResetDay: Math.min(
      31,
      Math.max(1, Number(formData.get("trafficResetDay")) || 1),
    ),
    consumptionMultiplier: Math.min(
      100,
      Math.max(0, Number(formData.get("consumptionMultiplier")) || 1),
    ),
  });
  revalidatePath(`/${slug}/operations/nodes`);
}

export async function resetNodeTraffic(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await resetRemnawaveNodeTraffic(text(formData, "uuid"));
  revalidatePath(`/${slug}/operations/nodes`);
  revalidatePath(`/${slug}/operations/traffic`);
}

export async function removeNode(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await deleteRemnawaveNode(text(formData, "uuid"));
  revalidatePath(`/${slug}/operations/nodes`);
  revalidatePath(`/${slug}/operations`);
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

export async function restartAllNodes(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await restartAllRemnawaveNodes();
  revalidatePath(`/${slug}/operations/nodes`);
  revalidatePath(`/${slug}/operations`);
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

export async function addExternalSquad(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  const name = text(formData, "name").slice(0, 30);
  if (name.length < 2 || !/^[A-Za-z0-9_\s-]+$/.test(name)) {
    throw new Error("Invalid external squad name");
  }
  await createRemnawaveExternalSquad(name);
  revalidatePath(`/${slug}/operations/insights`);
}

export async function renameExternalSquad(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  const name = text(formData, "name").slice(0, 30);
  if (name.length < 2 || !/^[A-Za-z0-9_\s-]+$/.test(name)) {
    throw new Error("Invalid external squad name");
  }
  await updateRemnawaveExternalSquad(text(formData, "uuid"), name);
  revalidatePath(`/${slug}/operations/insights`);
}

export async function removeExternalSquad(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await deleteRemnawaveExternalSquad(text(formData, "uuid"));
  revalidatePath(`/${slug}/operations/insights`);
}

export async function addAllExternalSquadUsers(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await addAllUsersToRemnawaveExternalSquad(text(formData, "uuid"));
  revalidatePath(`/${slug}/operations/insights`);
}

export async function removeAllExternalSquadUsers(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  await removeAllUsersFromRemnawaveExternalSquad(text(formData, "uuid"));
  revalidatePath(`/${slug}/operations/insights`);
}

export async function removeHwidDevice(formData: FormData) {
  const slug = text(formData, "slug");
  await authorize(slug);
  const userId = Number(formData.get("userId"));
  const hwid = text(formData, "hwid");
  if (!Number.isSafeInteger(userId) || userId < 1 || !hwid) {
    throw new Error("Invalid device identity");
  }
  await deleteRemnawaveHwidDevice({ userId, hwid });
  revalidatePath(`/${slug}/operations/devices`);
  revalidatePath(`/${slug}/operations/insights`);
}
