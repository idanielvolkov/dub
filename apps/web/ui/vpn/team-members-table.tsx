"use client";

import {
  PLATFORM_AREAS,
  PlatformAccess,
  PlatformAccessTemplate,
} from "@/lib/platform-access";
import { OperationSubmit } from "@/ui/shared/operation-submit";
import { UserAvatar } from "@/ui/users/user-avatar";
import {
  Button,
  EmptyState,
  FormCombobox,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  StatusBadge,
  Table,
  TableRowMenu,
  useTable,
} from "@dub/ui";
import { Users } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  changeGrowthMemberRole,
  changeMemberAccess,
  inviteGrowthMember,
  removeGrowthMember,
  revokeGrowthInvite,
} from "../../app/app.dub.co/(dashboard)/[slug]/growth/team/actions";

type TeamRole = "owner" | "member" | "viewer" | "billing";

export type TeamMemberRow = {
  kind: "member";
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: TeamRole;
  jobTitle: string;
  accessTemplate: PlatformAccessTemplate;
  access: PlatformAccess;
  joinedAt: string;
};

export type TeamInviteRow = {
  kind: "invite";
  id: string;
  name: string;
  email: string;
  image: null;
  role: Exclude<TeamRole, "owner">;
  jobTitle: string;
  accessTemplate: "custom";
  access: null;
  joinedAt: string;
};

export type TeamRow = TeamMemberRow | TeamInviteRow;

const areaLabel = {
  workspace: "Workspace",
  support: "Support",
  finance: "Finance",
  remnawave: "Remnawave API",
  marketing: "Marketing",
} as const;

const templateOptions = [
  { value: "custom", label: "Custom" },
  { value: "administrator", label: "Administrator" },
  { value: "support", label: "Support" },
  { value: "finance", label: "Finance" },
  { value: "marketer", label: "Marketer" },
  { value: "technician", label: "Technician" },
  { value: "analyst", label: "Analyst" },
];

const roleOptions = [
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
  { value: "billing", label: "Billing" },
];

export function InviteMemberButton({ slug }: { slug: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button text="Invite member" onClick={() => setShowModal(true)} />
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <ModalHeader
          title="Invite member"
          description="Invite a teammate to this workspace."
        />
        <ModalBody asChild className="bg-bg-muted">
          <form action={inviteGrowthMember} className="space-y-4">
            <input type="hidden" name="slug" value={slug} />
            <div className="grid gap-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                name="email"
                placeholder="teammate@company.com"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="invite-role">Workspace role</Label>
              <FormCombobox
                id="invite-role"
                name="role"
                defaultValue="member"
                options={roleOptions}
              />
            </div>
            <ModalFooter className="-mx-6 -mb-5">
              <Button
                variant="secondary"
                text="Cancel"
                onClick={() => setShowModal(false)}
              />
              <OperationSubmit>Send invite</OperationSubmit>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}

export function TeamMembersTable({
  slug,
  rows,
  isOwner,
}: {
  slug: string;
  rows: TeamRow[];
  isOwner: boolean;
}) {
  const [selected, setSelected] = useState<TeamRow | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TeamRow | null>(null);
  const columns = useMemo<ColumnDef<TeamRow>[]>(
    () => [
      {
        id: "member",
        header: "Member",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <UserAvatar
              user={{
                id: row.original.id,
                name: row.original.name,
                email: row.original.email,
                image: row.original.image,
                role: row.original.role,
              }}
              className="size-8 border-none"
            />
            <div>
              <p className="text-content-emphasis font-medium">
                {row.original.name || row.original.email}
              </p>
              <p className="text-content-subtle text-xs">
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "position",
        header: "Position",
        cell: ({ row }) => row.original.jobTitle || "—",
      },
      {
        id: "role",
        header: "Role",
        cell: ({ row }) => (
          <StatusBadge icon={null} variant="neutral">
            {row.original.role}
          </StatusBadge>
        ),
      },
      {
        id: "access",
        header: "Access",
        cell: ({ row }) => (
          <span className="capitalize">
            {row.original.kind === "invite"
              ? "Pending invite"
              : row.original.accessTemplate.replaceAll("_", " ")}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={row.original.kind === "member" ? "success" : "pending"}
          >
            {row.original.kind === "member" ? "Active" : "Invited"}
          </StatusBadge>
        ),
      },
      ...(isOwner
        ? [
            {
              id: "actions",
              header: "Actions",
              meta: { disableTruncate: true },
              cell: ({ row }: { row: { original: TeamRow } }) => (
                <TableRowMenu
                  actions={[
                    ...(row.original.kind === "member" &&
                    row.original.role !== "owner"
                      ? [
                          {
                            label: "Manage access",
                            onClick: () => setSelected(row.original),
                          },
                        ]
                      : []),
                    ...(row.original.role !== "owner"
                      ? [
                          {
                            label:
                              row.original.kind === "invite"
                                ? "Revoke invite"
                                : "Remove member",
                            variant: "danger" as const,
                            onClick: () => setRemoveTarget(row.original),
                          },
                        ]
                      : []),
                  ]}
                />
              ),
            } satisfies ColumnDef<TeamRow>,
          ]
        : []),
    ],
    [isOwner],
  );
  const table = useTable({ data: rows, columns });

  return (
    <>
      <Table
        {...table}
        resourceName={(plural) => (plural ? "members" : "member")}
        emptyState={
          <EmptyState
            icon={Users}
            title="No team members"
            description="Invite a teammate to start collaborating."
          />
        }
      />

      <Modal
        showModal={Boolean(selected)}
        setShowModal={(open) => !open && setSelected(null)}
        className="max-w-2xl"
      >
        {selected?.kind === "member" && (
          <>
            <ModalHeader
              title={selected.name || selected.email}
              description="Manage the member’s role and platform access."
            />
            <ModalBody className="bg-bg-muted space-y-6">
              <form action={changeMemberAccess} className="space-y-4">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="userId" value={selected.id} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="member-job-title">Job title</Label>
                    <Input
                      id="member-job-title"
                      name="jobTitle"
                      defaultValue={selected.jobTitle}
                      placeholder="Support lead"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="member-access-template">
                      Access template
                    </Label>
                    <FormCombobox
                      id="member-access-template"
                      name="accessTemplate"
                      defaultValue={selected.accessTemplate}
                      options={templateOptions}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {PLATFORM_AREAS.map((area) => (
                    <div key={area} className="grid gap-1.5">
                      <Label htmlFor={`member-${area}`}>
                        {areaLabel[area]}
                      </Label>
                      <FormCombobox
                        id={`member-${area}`}
                        name={area}
                        defaultValue={selected.access[area]}
                        options={[
                          { value: "none", label: "No access" },
                          { value: "view", label: "View" },
                          { value: "manage", label: "Manage" },
                        ]}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <OperationSubmit>Save access</OperationSubmit>
                </div>
              </form>
              <form
                action={changeGrowthMemberRole}
                className="border-border-subtle flex items-end gap-3 border-t pt-5"
              >
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="userId" value={selected.id} />
                <div className="grid flex-1 gap-1.5">
                  <Label htmlFor="member-role">Workspace role</Label>
                  <FormCombobox
                    id="member-role"
                    name="role"
                    defaultValue={selected.role}
                    options={roleOptions}
                  />
                </div>
                <OperationSubmit>Update role</OperationSubmit>
              </form>
            </ModalBody>
          </>
        )}
      </Modal>

      <Modal
        showModal={Boolean(removeTarget)}
        setShowModal={(open) => !open && setRemoveTarget(null)}
      >
        {removeTarget && (
          <>
            <ModalHeader
              title={
                removeTarget.kind === "invite"
                  ? "Revoke invitation"
                  : "Remove member"
              }
              description={`This will remove access for ${removeTarget.email}.`}
            />
            <ModalFooter>
              <Button
                variant="secondary"
                text="Cancel"
                onClick={() => setRemoveTarget(null)}
              />
              <form
                action={
                  removeTarget.kind === "invite"
                    ? revokeGrowthInvite
                    : removeGrowthMember
                }
              >
                <input type="hidden" name="slug" value={slug} />
                {removeTarget.kind === "invite" ? (
                  <input
                    type="hidden"
                    name="email"
                    value={removeTarget.email}
                  />
                ) : (
                  <input type="hidden" name="userId" value={removeTarget.id} />
                )}
                <OperationSubmit destructive>
                  {removeTarget.kind === "invite" ? "Revoke" : "Remove"}
                </OperationSubmit>
              </form>
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  );
}
