"use server";

import { createRemnawaveUser } from "@/lib/remnawave/client";
import { getVpnPlan } from "@/lib/remnawave/plans";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function provisionPlan(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const plan = getVpnPlan(String(formData.get("planId") || ""));
  const username = String(formData.get("username") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .slice(0, 36);

  if (!plan || username.length < 3) {
    throw new Error("Choose a plan and enter at least 3 characters");
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
      Date.now() + plan.durationDays * 24 * 60 * 60 * 1000,
    ).toISOString(),
    trafficLimitBytes: plan.trafficGb * 1024 ** 3,
    trafficLimitStrategy: plan.reset,
    hwidDeviceLimit: plan.devices,
  });

  redirect(`/${slug}/vpn/subscribers`);
}
