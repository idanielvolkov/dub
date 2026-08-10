import { getSession } from "@/lib/auth/utils";
import {
  getPlatformAccess,
  PlatformAccessTemplate,
} from "@/lib/platform-access";
import { prisma } from "@/lib/prisma";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import {
  InviteMemberButton,
  TeamMembersTable,
  TeamRow,
} from "@/ui/vpn/team-members-table";

const memberProfile = (preferences: unknown) => {
  if (
    !preferences ||
    typeof preferences !== "object" ||
    Array.isArray(preferences)
  )
    return { jobTitle: "", accessTemplate: "custom" as const };
  const profile = preferences as Record<string, unknown>;
  return {
    jobTitle: typeof profile.jobTitle === "string" ? profile.jobTitle : "",
    accessTemplate:
      typeof profile.accessTemplate === "string"
        ? (profile.accessTemplate as PlatformAccessTemplate)
        : ("custom" as const),
  };
};

export default async function GrowthTeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, session] = await Promise.all([params, getSession()]);
  const workspace = await prisma.project.findFirstOrThrow({
    where: { slug, users: { some: { userId: session?.user.id } } },
    select: {
      users: {
        orderBy: { createdAt: "asc" },
        select: {
          userId: true,
          role: true,
          createdAt: true,
          workspacePreferences: true,
          user: { select: { name: true, email: true, image: true } },
        },
      },
      invites: {
        orderBy: { createdAt: "desc" },
        select: { email: true, role: true, expires: true },
      },
    },
  });
  const current = workspace.users.find(
    (item) => item.userId === session?.user.id,
  );
  const isOwner = current?.role === "owner";
  const rows: TeamRow[] = [
    ...workspace.users.map((member) => {
      const profile = memberProfile(member.workspacePreferences);
      return {
        kind: "member" as const,
        id: member.userId,
        name: member.user.name || "",
        email: member.user.email || "",
        image: member.user.image,
        role: member.role,
        jobTitle: profile.jobTitle,
        accessTemplate: profile.accessTemplate,
        access: getPlatformAccess(member.role, member.workspacePreferences),
        joinedAt: member.createdAt.toISOString(),
      };
    }),
    ...workspace.invites.map((invite) => ({
      kind: "invite" as const,
      id: invite.email,
      name: "",
      email: invite.email,
      image: null,
      role: invite.role === "owner" ? "member" : invite.role,
      jobTitle: "",
      accessTemplate: "custom" as const,
      access: null,
      joinedAt: invite.expires.toISOString(),
    })),
  ];

  return (
    <PageContent
      title="Team"
      titleInfo={{ title: "Manage members, roles, and platform access." }}
      controls={isOwner ? <InviteMemberButton slug={slug} /> : undefined}
    >
      <PageWidthWrapper className="pb-10">
        <TeamMembersTable slug={slug} rows={rows} isOwner={isOwner} />
      </PageWidthWrapper>
    </PageContent>
  );
}
