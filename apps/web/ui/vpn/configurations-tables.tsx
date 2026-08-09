"use client";

import { RemnawaveConfigProfile, RemnawaveSquad } from "@/lib/remnawave/client";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import {
  Button,
  EmptyState,
  Input,
  Modal,
  StatusBadge,
  Table,
  useTable,
} from "@dub/ui";
import { Sliders, UsersSettings } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  addSquad,
  removeSquad,
  saveProfile,
  saveSquad,
} from "../../app/app.dub.co/(dashboard)/[slug]/operations/actions";

const textareaClass =
  "border-border-default bg-bg-default text-content-default placeholder:text-content-subtle focus:border-border-emphasis min-h-80 w-full rounded-xl border p-3 font-mono text-xs outline-none focus:ring-4 focus:ring-neutral-100";

export function ConfigurationsTables({
  slug,
  profiles,
  squads,
  inboundIds,
}: {
  slug: string;
  profiles: RemnawaveConfigProfile[];
  squads: RemnawaveSquad[];
  inboundIds: string[];
}) {
  const [selectedProfile, setSelectedProfile] =
    useState<RemnawaveConfigProfile | null>(null);
  const [selectedSquad, setSelectedSquad] = useState<RemnawaveSquad | null>(
    null,
  );
  const [showCreateSquad, setShowCreateSquad] = useState(false);

  const profileColumns = useMemo<ColumnDef<RemnawaveConfigProfile>[]>(
    () => [
      {
        id: "profile",
        header: "Profile",
        cell: ({ row }) => (
          <div>
            <p className="text-content-emphasis font-medium">
              {row.original.name}
            </p>
            <p className="text-content-subtle max-w-52 truncate font-mono text-xs">
              {row.original.uuid}
            </p>
          </div>
        ),
      },
      {
        id: "inbounds",
        header: "Inbounds",
        cell: ({ row }) => row.original.inbounds.length,
      },
      {
        id: "nodes",
        header: "Nodes",
        cell: ({ row }) => row.original.nodes.length,
      },
      {
        id: "configuration",
        header: "Configuration",
        cell: () => (
          <StatusBadge icon={null} variant="new">
            Xray JSON
          </StatusBadge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { disableTruncate: true },
        cell: ({ row }) => (
          <Button
            className="h-9 w-fit"
            variant="secondary"
            text="Edit profile"
            onClick={() => setSelectedProfile(row.original)}
          />
        ),
      },
    ],
    [],
  );
  const squadColumns = useMemo<ColumnDef<RemnawaveSquad>[]>(
    () => [
      {
        id: "squad",
        header: "Squad",
        cell: ({ row }) => (
          <div>
            <p className="text-content-emphasis font-medium">
              {row.original.name}
            </p>
            <p className="text-content-subtle max-w-52 truncate font-mono text-xs">
              {row.original.uuid}
            </p>
          </div>
        ),
      },
      {
        id: "members",
        header: "Members",
        cell: ({ row }) => row.original.info?.membersCount || 0,
      },
      {
        id: "inbounds",
        header: "Inbounds",
        cell: ({ row }) => row.original.inbounds.length,
      },
      {
        id: "actions",
        header: "Actions",
        meta: { disableTruncate: true },
        cell: ({ row }) => (
          <Button
            className="h-9 w-fit"
            variant="secondary"
            text="Manage"
            onClick={() => setSelectedSquad(row.original)}
          />
        ),
      },
    ],
    [],
  );
  const profileTable = useTable({ data: profiles, columns: profileColumns });
  const squadTable = useTable({ data: squads, columns: squadColumns });

  return (
    <>
      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-content-emphasis text-sm font-semibold">
              Configuration profiles
            </h2>
            <p className="text-content-subtle text-sm">
              {profiles.length} profiles · advanced JSON editor
            </p>
          </div>
          <StatusBadge variant="success">Live data</StatusBadge>
        </div>
        <Table
          {...profileTable}
          resourceName={(plural) => (plural ? "profiles" : "profile")}
          emptyState={
            <EmptyState
              icon={Sliders}
              title="No profiles found"
              description="Create an Xray profile in Remnawave first."
            />
          }
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-content-emphasis text-sm font-semibold">
              Internal squads
            </h2>
            <p className="text-content-subtle text-sm">
              {squads.length} access groups
            </p>
          </div>
          <Button
            className="w-fit"
            text="Create squad"
            onClick={() => setShowCreateSquad(true)}
          />
        </div>
        <Table
          {...squadTable}
          resourceName={(plural) => (plural ? "squads" : "squad")}
          emptyState={
            <EmptyState
              icon={UsersSettings}
              title="No squads found"
              description="Create a squad to group access permissions."
            />
          }
        />
      </section>

      <Modal
        showModal={Boolean(selectedProfile)}
        setShowModal={(open) => !open && setSelectedProfile(null)}
        className="max-w-2xl"
      >
        {selectedProfile && (
          <>
            <div className="border-border-subtle border-b p-6">
              <h3 className="text-content-emphasis text-lg font-medium">
                Edit {selectedProfile.name}
              </h3>
              <p className="text-content-subtle mt-1 text-sm">
                Validate and apply the complete Xray configuration.
              </p>
            </div>
            <form action={saveProfile} className="bg-bg-muted space-y-4 p-6">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="uuid" value={selectedProfile.uuid} />
              <label className="text-content-default grid gap-1.5 text-sm font-medium">
                Profile name
                <Input
                  name="name"
                  defaultValue={selectedProfile.name}
                  required
                />
              </label>
              <label className="text-content-default grid gap-1.5 text-sm font-medium">
                Xray JSON
                <textarea
                  className={textareaClass}
                  name="config"
                  defaultValue={JSON.stringify(selectedProfile.config, null, 2)}
                  spellCheck={false}
                />
              </label>
              <div className="flex justify-end">
                <OperationSubmit confirmMessage="Apply this Xray configuration to the profile?">
                  Validate & save
                </OperationSubmit>
              </div>
            </form>
          </>
        )}
      </Modal>

      <Modal
        showModal={Boolean(selectedSquad)}
        setShowModal={(open) => !open && setSelectedSquad(null)}
      >
        {selectedSquad && (
          <>
            <div className="border-border-subtle border-b p-6">
              <h3 className="text-content-emphasis text-lg font-medium">
                Manage squad
              </h3>
              <p className="text-content-subtle mt-1 text-sm">
                {selectedSquad.info?.membersCount || 0} members ·{" "}
                {selectedSquad.inbounds.length} inbounds
              </p>
            </div>
            <div className="bg-bg-muted p-6">
              <form action={saveSquad} className="space-y-4">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="uuid" value={selectedSquad.uuid} />
                <input
                  type="hidden"
                  name="inbounds"
                  value={selectedSquad.inbounds
                    .map((item) => (item as { uuid?: string }).uuid)
                    .filter(Boolean)
                    .join(",")}
                />
                <label className="text-content-default grid gap-1.5 text-sm font-medium">
                  Squad name
                  <Input
                    name="name"
                    defaultValue={selectedSquad.name}
                    required
                  />
                </label>
                <div className="flex justify-end">
                  <OperationSubmit>Save changes</OperationSubmit>
                </div>
              </form>
              <div className="border-border-subtle mt-5 flex items-center justify-between gap-4 border-t pt-5">
                <p className="text-content-subtle text-xs">
                  Users may lose access when this squad is deleted.
                </p>
                <form action={removeSquad}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="uuid" value={selectedSquad.uuid} />
                  <OperationSubmit
                    destructive
                    confirmMessage={`Delete ${selectedSquad.name}? Users may lose access.`}
                  >
                    Delete squad
                  </OperationSubmit>
                </form>
              </div>
            </div>
          </>
        )}
      </Modal>

      <Modal showModal={showCreateSquad} setShowModal={setShowCreateSquad}>
        <div className="border-border-subtle border-b p-6">
          <h3 className="text-content-emphasis text-lg font-medium">
            Create squad
          </h3>
          <p className="text-content-subtle mt-1 text-sm">
            Create an internal Remnawave access group.
          </p>
        </div>
        <form action={addSquad} className="bg-bg-muted space-y-4 p-6">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="inbounds" value={inboundIds.join(",")} />
          <label className="text-content-default grid gap-1.5 text-sm font-medium">
            Squad name
            <Input
              name="name"
              placeholder="Marketing-VPN"
              minLength={2}
              maxLength={20}
              pattern="[A-Za-z0-9_-]+"
              required
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button
              className="w-fit"
              variant="secondary"
              text="Cancel"
              onClick={() => setShowCreateSquad(false)}
            />
            <OperationSubmit>Create squad</OperationSubmit>
          </div>
        </form>
      </Modal>
    </>
  );
}
