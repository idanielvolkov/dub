"use client";

import { RemnawaveExternalSquad } from "@/lib/remnawave/client";
import {
  addAllExternalSquadUsers,
  addExternalSquad,
  removeAllExternalSquadUsers,
  removeExternalSquad,
  renameExternalSquad,
} from "@/app/app.dub.co/(dashboard)/[slug]/operations/actions";
import { Button, Input, Label, Modal } from "@dub/ui";
import { useState } from "react";
import { OperationSubmit } from "./operation-submit";
import { DubCard, DubCardList } from "./server-card-list";

export function ExternalSquadsManagement({
  slug,
  squads,
}: {
  slug: string;
  squads: RemnawaveExternalSquad[];
}) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-content-emphasis text-sm font-semibold">
            External squads
          </h2>
          <p className="text-content-subtle text-sm">
            Groups overriding templates and subscription behavior
          </p>
        </div>
        <Button
          className="w-fit"
          text="Create squad"
          onClick={() => setShowCreate(true)}
        />
      </div>

      <DubCardList variant="compact">
        {squads.map((squad) => (
          <DubCard
            key={squad.uuid}
            innerClassName="space-y-4 p-5"
            hoverStateEnabled={false}
          >
            <div>
              <p className="text-content-emphasis text-sm font-medium">
                {squad.name}
              </p>
              <p className="text-content-subtle mt-1 text-xs">
                {squad.info.membersCount} members · {squad.templates.length} template overrides
              </p>
            </div>
            <form
              action={renameExternalSquad}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="uuid" value={squad.uuid} />
              <Input
                aria-label={`Rename ${squad.name}`}
                className="h-9"
                name="name"
                defaultValue={squad.name}
                minLength={2}
                maxLength={30}
                pattern="[A-Za-z0-9_ -]+"
                required
              />
              <OperationSubmit>Save name</OperationSubmit>
            </form>
            <div className="border-border-subtle flex flex-wrap gap-2 border-t pt-4">
              <form action={addAllExternalSquadUsers}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="uuid" value={squad.uuid} />
                <OperationSubmit confirmMessage={`Add every Remnawave user to ${squad.name}?`}>
                  Add all users
                </OperationSubmit>
              </form>
              <form action={removeAllExternalSquadUsers}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="uuid" value={squad.uuid} />
                <OperationSubmit confirmMessage={`Remove every user from ${squad.name}?`}>
                  Remove all users
                </OperationSubmit>
              </form>
              <form action={removeExternalSquad} className="sm:ml-auto">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="uuid" value={squad.uuid} />
                <OperationSubmit
                  destructive
                  confirmMessage={`Delete ${squad.name}? Subscription overrides for its members will be removed.`}
                >
                  Delete squad
                </OperationSubmit>
              </form>
            </div>
          </DubCard>
        ))}
      </DubCardList>

      <Modal showModal={showCreate} setShowModal={setShowCreate}>
        <div className="border-border-subtle border-b px-6 py-4">
          <h3 className="text-content-emphasis text-lg font-medium">
            Create external squad
          </h3>
          <p className="text-content-subtle mt-1 text-sm">
            Create a group for subscription templates and client overrides.
          </p>
        </div>
        <form action={addExternalSquad} className="bg-bg-muted space-y-4 p-6">
          <input type="hidden" name="slug" value={slug} />
          <div className="grid gap-1.5">
            <Label htmlFor="external-squad-name">Squad name</Label>
            <Input
              id="external-squad-name"
              name="name"
              placeholder="Premium clients"
              minLength={2}
              maxLength={30}
              pattern="[A-Za-z0-9_ -]+"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              className="h-9 w-fit"
              variant="secondary"
              text="Cancel"
              onClick={() => setShowCreate(false)}
            />
            <OperationSubmit>Create squad</OperationSubmit>
          </div>
        </form>
      </Modal>
    </>
  );
}
