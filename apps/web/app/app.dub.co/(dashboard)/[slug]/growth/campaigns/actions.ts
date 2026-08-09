"use server";

import { createLink } from "@/lib/api/links/create-link";
import { processLink } from "@/lib/api/links/process-link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ProcessedLinkProps } from "@/lib/types";
import { createLinkBodySchema } from "@/lib/zod/schemas/links";
import { revalidatePath } from "next/cache";

const text = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();

async function context(slug: string) {
  const session = await getSession();
  if (!session?.user.id) throw new Error("Unauthorized");
  const workspace = await prisma.project.findFirst({
    where: { slug, users: { some: { userId: session.user.id } } },
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

  const payload = createLinkBodySchema.parse({
    domain,
    key: text(formData, "key")
      .toLowerCase()
      .replace(/[^a-z0-9/_-]/g, "-")
      .slice(0, 80),
    url: text(formData, "url"),
    title: text(formData, "title").slice(0, 120),
    utm_source: text(formData, "source") || undefined,
    utm_medium: text(formData, "medium") || undefined,
    utm_campaign: text(formData, "campaign") || undefined,
    comments: metadata(formData),
  });
  const processed = await processLink({
    payload,
    workspace,
    userId: session.user.id,
  });
  if (processed.error) throw new Error(processed.error);
  await createLink({
    ...processed.link,
    projectId: workspace.id,
  } as ProcessedLinkProps);
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
