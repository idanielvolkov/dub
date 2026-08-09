import { tokenSchema } from "@/lib/zod/schemas/token";
import type { Project, WorkspaceRole } from "@prisma/client";
import * as z from "zod/v4";

export const plans = [
  "free",
  "pro",
  "business",
  "business plus",
  "business extra",
  "business max",
  "advanced",
  "enterprise",
] as const;

export type PlanProps = (typeof plans)[number];

export type WorkspaceProps = Project & {
  plan: PlanProps;
  domains: {
    slug: string;
    primary: boolean;
    verified: boolean;
  }[];
  users: {
    role: WorkspaceRole;
    defaultFolderId: string | null;
  }[];
  flags?: Record<string, boolean>;
  store: Record<string, unknown> | null;
};

export type WorkspaceWithUsers = WorkspaceProps;

export interface UserProps {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: Date;
  source: string | null;
  defaultWorkspace?: string | null;
  defaultPartnerId?: string | null;
  isMachine: boolean;
  hasPassword: boolean;
  provider: string | null;
}

export type TokenProps = z.infer<typeof tokenSchema>;
