"use server";

import { createRemnawaveUser } from "@/lib/remnawave/client";
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

  if (username.length < 3) {
    throw new Error("Subscriber name must contain at least 3 characters");
  }

  await createRemnawaveUser({
    username,
    expireAt: new Date(
      Date.now() + durationDays * 24 * 60 * 60 * 1000,
    ).toISOString(),
  });

  revalidatePath(`/${slug}/vpn/subscribers`);
}
