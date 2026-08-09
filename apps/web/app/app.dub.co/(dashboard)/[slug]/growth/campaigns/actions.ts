"use server";

import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { nanoid } from "@dub/utils";
import { revalidatePath } from "next/cache";

const text = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();

async function context(slug: string) {
  const session = await getSession();
  if (!session?.user.id) throw new Error("Unauthorized");
  const workspace = await prisma.project.findFirst({
    where: {
      slug,
      users: {
        some: { userId: session.user.id, role: { in: ["owner", "member"] } },
      },
    },
    select: {
      id: true,
      plan: true,
      users: { where: { userId: session.user.id }, select: { role: true } },
      domains: {
        where: { archived: false, verified: true },
        select: { slug: true },
      },
    },
  });
  if (!workspace) throw new Error("Unauthorized workspace access");
  return { session, workspace };
}

function metadata(formData: FormData) {
  const status = text(formData, "status");
  return `GROWTH:${JSON.stringify({
    status: ["draft", "active", "paused", "completed"].includes(status)
      ? status
      : "draft",
    budget: Math.max(0, Number(formData.get("budget")) || 0),
    owner: text(formData, "owner").slice(0, 80),
  })}`;
}

export async function createGrowthCampaign(formData: FormData) {
  const slug = text(formData, "slug");
  const { session, workspace } = await context(slug);
  const domain = text(formData, "domain");
  if (!workspace.domains.some((item) => item.slug === domain))
    throw new Error("Invalid campaign domain");

  const key = text(formData, "key")
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, "-")
    .slice(0, 80);
  const url = new URL(text(formData, "url")).toString();

  await prisma.link.create({
    data: {
      id: nanoid(24),
      domain,
      key,
      url,
      shortLink: `${domain}/${key}`,
      title: text(formData, "title").slice(0, 120),
      utm_source: text(formData, "source").slice(0, 255) || null,
      utm_medium: text(formData, "medium").slice(0, 255) || null,
      utm_campaign: text(formData, "campaign").slice(0, 255) || null,
      comments: metadata(formData),
      projectId: workspace.id,
      userId: session.user.id,
    },
  });
  revalidatePath(`/${slug}/growth`);
  revalidatePath(`/${slug}/growth/campaigns`);
}

export async function updateGrowthCampaign(formData: FormData) {
  const slug = text(formData, "slug");
  const { workspace } = await context(slug);
  await prisma.link.updateMany({
    where: { id: text(formData, "id"), projectId: workspace.id },
    data: {
      title: text(formData, "title").slice(0, 120),
      utm_campaign: text(formData, "campaign").slice(0, 255) || null,
      comments: metadata(formData),
    },
  });
  revalidatePath(`/${slug}/growth`);
  revalidatePath(`/${slug}/growth/campaigns`);
}

export async function archiveGrowthCampaign(formData: FormData) {
  const slug = text(formData, "slug");
  const { workspace } = await context(slug);
  await prisma.link.updateMany({
    where: { id: text(formData, "id"), projectId: workspace.id },
    data: { archived: true },
  });
  revalidatePath(`/${slug}/growth`);
  revalidatePath(`/${slug}/growth/campaigns`);
}
