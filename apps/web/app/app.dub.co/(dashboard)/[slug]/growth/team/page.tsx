import { getSession } from "@/lib/auth/utils";
import {
  getPlatformAccess,
  PLATFORM_ACCESS_TEMPLATES,
  PLATFORM_AREAS,
} from "@/lib/platform-access";
import { prisma } from "@/lib/prisma";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { UserAvatar } from "@/ui/users/user-avatar";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { Badge, CardList, CardListCard, Input } from "@dub/ui";
import {
  changeGrowthMemberRole,
  changeMemberAccess,
  inviteGrowthMember,
  removeGrowthMember,
  revokeGrowthInvite,
} from "./actions";

const areaLabel = {
  workspace: "Workspace",
  support: "Support",
  finance: "Finance",
  remnawave: "Remnawave API",
  marketing: "Marketing",
} as const;

const templateLabel = {
  custom: "Custom",
  administrator: "Administrator",
  support: "Support",
  finance: "Finance",
  marketer: "Marketer",
  technician: "Technician",
  analyst: "Analyst",
} as const;

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
          user: { select: { id: true, name: true, email: true, image: true } },
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
  const memberProfile = (preferences: unknown) => {
    if (
      !preferences ||
      typeof preferences !== "object" ||
      Array.isArray(preferences)
    )
      return { jobTitle: "", accessTemplate: "custom" };
    const profile = preferences as Record<string, unknown>;
    return {
      jobTitle: typeof profile.jobTitle === "string" ? profile.jobTitle : "",
      accessTemplate:
        typeof profile.accessTemplate === "string"
          ? profile.accessTemplate
          : "custom",
    };
  };
  return (
    <PageContent
      title="Team"
      titleInfo={{
        title: "Manage members, roles, and access across the platform.",
      }}
    >
      <PageWidthWrapper className="pb-10">
        {isOwner && (
          <section className="mb-6">
            <div className="mb-3">
              <h2 className="text-content-emphasis text-sm font-semibold">
                Invite member
              </h2>
              <p className="text-content-subtle text-sm">
                Add a teammate with an initial workspace role
              </p>
            </div>
            <CardList>
              <CardListCard innerClassName="p-0" hoverStateEnabled={false}>
                <form
                  action={inviteGrowthMember}
                  className="grid gap-3 p-5 sm:grid-cols-[1fr_160px_auto]"
                >
                  <input type="hidden" name="slug" value={slug} />
                  <Input
                    className="h-9"
                    type="email"
                    name="email"
                    placeholder="teammate@company.com"
                    required
                  />
                  <FormCombobox
                    name="role"
                    defaultValue="member"
                    className="h-9"
                    options={[
                      { value: "member", label: "Member" },
                      { value: "viewer", label: "Viewer" },
                      { value: "billing", label: "Billing" },
                    ]}
                  />
                  <OperationSubmit>Send invite</OperationSubmit>
                </form>
              </CardListCard>
            </CardList>
          </section>
        )}
        <section className="mb-6">
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Access templates
            </h2>
            <p className="text-content-subtle text-sm">
              Start with a role and customize access for each person
            </p>
          </div>
          <CardList variant="compact">
            {Object.entries(PLATFORM_ACCESS_TEMPLATES)
              .filter(([key]) => key !== "custom")
              .map(([key, access]) => (
                <CardListCard
                  key={key}
                  innerClassName="flex flex-wrap items-center gap-3 px-5 py-4"
                  hoverStateEnabled={false}
                >
                  <div className="min-w-40 flex-1">
                    <p className="text-content-emphasis text-sm font-medium">
                      {templateLabel[key as keyof typeof templateLabel]}
                    </p>
                    <p className="text-content-subtle text-xs">
                      Ready-to-use platform permissions
                    </p>
                  </div>
                  {access &&
                    PLATFORM_AREAS.map((area) => (
                      <Badge
                        key={area}
                        variant={
                          access[area] === "manage"
                            ? "blue"
                            : access[area] === "view"
                              ? "gray"
                              : "neutral"
                        }
                      >
                        {areaLabel[area]} · {access[area]}
                      </Badge>
                    ))}
                </CardListCard>
              ))}
          </CardList>
        </section>
        <section>
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Workspace members
            </h2>
            <p className="text-content-subtle text-sm">
              {workspace.users.length} active · {workspace.invites.length}{" "}
              pending
            </p>
          </div>
          <CardList variant="compact">
            {workspace.users.map((member) => (
              <CardListCard
                key={member.userId}
                innerClassName="flex flex-wrap items-center gap-3 px-5 py-4"
                hoverStateEnabled={false}
              >
                <UserAvatar
                  user={{ ...member.user, role: member.role }}
                  className="size-8 border-none"
                />
                <div className="min-w-48 flex-1">
                  <p className="text-content-emphasis text-sm font-medium">
                    {member.user.name || member.user.email}
                  </p>
                  <p className="text-content-subtle text-xs">
                    {member.user.email}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="gray">
                    {memberProfile(member.workspacePreferences).jobTitle ||
                      (member.role === "member" ? "Team member" : member.role)}
                  </Badge>
                  <p className="text-content-subtle mt-1 text-xs capitalize">
                    {memberProfile(
                      member.workspacePreferences,
                    ).accessTemplate.replaceAll("_", " ")}
                  </p>
                </div>
                {isOwner && member.role !== "owner" && (
                  <div className="flex w-full flex-col gap-3 border-t border-neutral-200 pt-4 sm:ml-11">
                    <form
                      action={changeMemberAccess}
                      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]"
                    >
                      <input type="hidden" name="slug" value={slug} />
                      <input
                        type="hidden"
                        name="userId"
                        value={member.userId}
                      />
                      <label className="space-y-1">
                        <span className="text-content-subtle text-xs font-medium">
                          Job title
                        </span>
                        <Input
                          name="jobTitle"
                          defaultValue={
                            memberProfile(member.workspacePreferences).jobTitle
                          }
                          placeholder="e.g. Support lead"
                          className="h-9"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-content-subtle text-xs font-medium">
                          Access template
                        </span>
                        <FormCombobox
                          name="accessTemplate"
                          defaultValue={
                            memberProfile(member.workspacePreferences)
                              .accessTemplate
                          }
                          className="h-9 w-full"
                          options={[
                            { value: "custom", label: "Custom" },
                            { value: "administrator", label: "Administrator" },
                            { value: "support", label: "Support" },
                            { value: "finance", label: "Finance" },
                            { value: "marketer", label: "Marketer" },
                            { value: "technician", label: "Technician" },
                            { value: "analyst", label: "Analyst" },
                          ]}
                        />
                      </label>
                      {PLATFORM_AREAS.map((area) => (
                        <label key={area} className="space-y-1">
                          <span className="text-content-subtle text-xs font-medium">
                            {areaLabel[area]}
                          </span>
                          <FormCombobox
                            name={area}
                            defaultValue={
                              getPlatformAccess(
                                member.role,
                                member.workspacePreferences,
                              )[area]
                            }
                            className="h-9 w-full"
                            options={[
                              { value: "none", label: "No access" },
                              { value: "view", label: "View" },
                              { value: "manage", label: "Manage" },
                            ]}
                          />
                        </label>
                      ))}
                      <div className="self-end">
                        <OperationSubmit>Save access</OperationSubmit>
                      </div>
                    </form>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <form
                        action={changeGrowthMemberRole}
                        className="flex gap-2"
                      >
                        <input type="hidden" name="slug" value={slug} />
                        <input
                          type="hidden"
                          name="userId"
                          value={member.userId}
                        />
                        <FormCombobox
                          name="role"
                          defaultValue={member.role}
                          className="h-9 min-w-32"
                          options={[
                            { value: "member", label: "Member" },
                            { value: "viewer", label: "Viewer" },
                            { value: "billing", label: "Billing" },
                          ]}
                        />
                        <OperationSubmit>Update</OperationSubmit>
                      </form>
                      <form action={removeGrowthMember}>
                        <input type="hidden" name="slug" value={slug} />
                        <input
                          type="hidden"
                          name="userId"
                          value={member.userId}
                        />
                        <OperationSubmit
                          destructive
                          confirmMessage={`Remove ${member.user.email} from this workspace?`}
                        >
                          Remove
                        </OperationSubmit>
                      </form>
                    </div>
                  </div>
                )}
              </CardListCard>
            ))}
            {workspace.invites.map((invite) => (
              <CardListCard
                key={invite.email}
                innerClassName="flex flex-wrap items-center gap-3 bg-neutral-50 px-5 py-4"
                hoverStateEnabled={false}
              >
                <div className="min-w-48 flex-1">
                  <p className="text-sm font-medium">{invite.email}</p>
                  <p className="text-content-subtle text-xs">
                    Invitation expires{" "}
                    {invite.expires.toLocaleDateString("en-US")}
                  </p>
                </div>
                <Badge variant="gray">Pending · {invite.role}</Badge>
                {isOwner && (
                  <form action={revokeGrowthInvite}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="email" value={invite.email} />
                    <OperationSubmit
                      destructive
                      confirmMessage={`Revoke invitation for ${invite.email}?`}
                    >
                      Revoke
                    </OperationSubmit>
                  </form>
                )}
              </CardListCard>
            ))}
          </CardList>
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
