import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { UserAvatar } from "@/ui/users/user-avatar";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { Badge, CardList, CardListCard, Input } from "@dub/ui";
import {
  changeGrowthMemberRole,
  inviteGrowthMember,
  removeGrowthMember,
  revokeGrowthInvite,
} from "./actions";

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
  return (
    <PageContent
      title="Team"
      titleInfo={{
        title: "Manage your marketing team.",
      }}
    >
      <PageWidthWrapper className="pb-10">
        {isOwner && (
          <section className="mb-6">
            <div className="mb-3">
              <h2 className="text-content-emphasis text-sm font-semibold">
                Invite marketer
              </h2>
              <p className="text-content-subtle text-sm">
                Members can edit Marketing; viewers have read-only access
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
                    placeholder="marketer@company.com"
                    required
                  />
                  <FormCombobox
                    name="role"
                    defaultValue="member"
                    className="h-9"
                    options={[
                      { value: "member", label: "Marketing member" },
                      { value: "viewer", label: "Viewer" },
                    ]}
                  />
                  <OperationSubmit>Send invite</OperationSubmit>
                </form>
              </CardListCard>
            </CardList>
          </section>
        )}
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
                <Badge variant="gray">
                  {member.role === "member" ? "Marketing" : member.role}
                </Badge>
                {isOwner && member.role !== "owner" && (
                  <>
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
                          { value: "member", label: "Marketing" },
                          { value: "viewer", label: "Viewer" },
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
                  </>
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
