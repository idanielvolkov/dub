import type { WorkspaceRole } from "@prisma/client";

export const PLATFORM_AREAS = [
  "workspace",
  "support",
  "finance",
  "remnawave",
  "marketing",
] as const;

export type PlatformArea = (typeof PLATFORM_AREAS)[number];
export type PlatformAccessLevel = "none" | "view" | "manage";
export type PlatformAccess = Record<PlatformArea, PlatformAccessLevel>;

export const PLATFORM_ACCESS_TEMPLATES = {
  custom: null,
  administrator: {
    workspace: "manage",
    support: "manage",
    finance: "manage",
    remnawave: "manage",
    marketing: "manage",
  },
  support: {
    workspace: "view",
    support: "manage",
    finance: "none",
    remnawave: "view",
    marketing: "none",
  },
  finance: {
    workspace: "view",
    support: "none",
    finance: "manage",
    remnawave: "none",
    marketing: "view",
  },
  marketer: {
    workspace: "view",
    support: "none",
    finance: "none",
    remnawave: "none",
    marketing: "manage",
  },
  technician: {
    workspace: "view",
    support: "manage",
    finance: "none",
    remnawave: "manage",
    marketing: "none",
  },
  analyst: {
    workspace: "view",
    support: "view",
    finance: "view",
    remnawave: "view",
    marketing: "view",
  },
} as const satisfies Record<string, PlatformAccess | null>;

export type PlatformAccessTemplate = keyof typeof PLATFORM_ACCESS_TEMPLATES;

const ACCESS_RANK: Record<PlatformAccessLevel, number> = {
  none: 0,
  view: 1,
  manage: 2,
};

const ROLE_ACCESS: Record<WorkspaceRole, PlatformAccess> = {
  owner: {
    workspace: "manage",
    support: "manage",
    finance: "manage",
    remnawave: "manage",
    marketing: "manage",
  },
  member: {
    workspace: "manage",
    support: "manage",
    finance: "none",
    remnawave: "none",
    marketing: "manage",
  },
  viewer: {
    workspace: "view",
    support: "view",
    finance: "view",
    remnawave: "view",
    marketing: "view",
  },
  billing: {
    workspace: "view",
    support: "none",
    finance: "manage",
    remnawave: "none",
    marketing: "view",
  },
};

const isAccessLevel = (value: unknown): value is PlatformAccessLevel =>
  value === "none" || value === "view" || value === "manage";

export function getPlatformAccess(
  role: WorkspaceRole,
  workspacePreferences?: unknown,
): PlatformAccess {
  const defaults = ROLE_ACCESS[role];
  if (
    role === "owner" ||
    !workspacePreferences ||
    typeof workspacePreferences !== "object"
  ) {
    return defaults;
  }

  const stored = (workspacePreferences as { platformAccess?: unknown })
    .platformAccess;
  if (!stored || typeof stored !== "object") return defaults;

  return PLATFORM_AREAS.reduce<PlatformAccess>(
    (access, area) => {
      const value = (stored as Record<string, unknown>)[area];
      access[area] = isAccessLevel(value) ? value : defaults[area];
      return access;
    },
    { ...defaults },
  );
}

export function canAccessPlatformArea({
  role,
  workspacePreferences,
  area,
  minimum = "view",
}: {
  role: WorkspaceRole;
  workspacePreferences?: unknown;
  area: PlatformArea;
  minimum?: Exclude<PlatformAccessLevel, "none">;
}) {
  const level = getPlatformAccess(role, workspacePreferences)[area];
  return ACCESS_RANK[level] >= ACCESS_RANK[minimum];
}
