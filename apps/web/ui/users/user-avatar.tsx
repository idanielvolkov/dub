"use client";

import { Avatar } from "@dub/ui";
import { cn } from "@dub/utils";

type User = {
  id?: string | null | undefined;
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
  role?: "owner" | "member" | "viewer" | "billing" | string | null;
};

export function getUserAvatarUrl(user?: User | null) {
  if (user?.image) return user.image;

  if (!user?.id) return "/api/og/avatar";

  const role = user.role ? `?role=${encodeURIComponent(user.role)}` : "";
  return `/api/og/avatar/${user.id}${role}`;
}

export function UserAvatar({
  user = {},
  className,
}: {
  user?: User;
  className?: string;
}) {
  const roleThemes: Record<string, { bg: string; fg: string }> = {
    owner: { bg: "#f3e8ff", fg: "#a855f7" },
    member: { bg: "#dbeafe", fg: "#3b82f6" },
    viewer: { bg: "#dcfce7", fg: "#22c55e" },
    billing: { bg: "#fef3c7", fg: "#f59e0b" },
  };

  const identifier =
    user.name || user.email || user.id || "Detz account member";

  return (
    <Avatar
      imageUrl={user.image}
      identifier={identifier}
      theme={user.role ? roleThemes[user.role] : undefined}
      className={cn(
        "h-10 w-10 rounded-full border border-neutral-300",
        className,
      )}
    />
  );
}
