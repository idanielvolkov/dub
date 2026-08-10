"use client";

import { RemnawaveExternalSquad } from "@/lib/remnawave/client";
import { OperationSubmit } from "@/ui/shared/operation-submit";
import {
  Button,
  CardList,
  CardListCard,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@dub/ui";
import { useState } from "react";
import {
  addAllExternalSquadUsers,
  addExternalSquad,
  removeAllExternalSquadUsers,
  removeExternalSquad,
  renameExternalSquad,
} from "../../app/app.dub.co/(dashboard)/[slug]/operations/actions";

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

      <CardList variant="compact">
        {squads.map((squad) => (
          <CardListCard
            key={squad.uuid}
            innerClassName="space-y-4 p-5"
            hoverStateEnabled={false}
          >
            <div>
              <p className="text-content-emphasis text-sm font-medium">
                {squad.name}
              </p>
              <p className="text-content-subtle mt-1 text-xs">
                {squad.info.membersCount} members · {squad.templates.length}{" "}
                template overrides
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
                <OperationSubmit
                  confirmMessage={`Add every Remnawave user to ${squad.name}?`}
                >
                  Add all users
                </OperationSubmit>
              </form>
              <form action={removeAllExternalSquadUsers}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="uuid" value={squad.uuid} />
                <OperationSubmit
                  confirmMessage={`Remove every user from ${squad.name}?`}
                >
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
          </CardListCard>
        ))}
      </CardList>

      <Modal showModal={showCreate} setShowModal={setShowCreate}>
        <ModalHeader
          title="Create external squad"
          description="Create a group for subscription templates and client overrides."
        />
        <ModalBody asChild className="bg-bg-muted">
          <form action={addExternalSquad} className="space-y-4">
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
            <ModalFooter className="-mx-6 -mb-5">
              <Button
                className="h-9 w-fit"
                variant="secondary"
                text="Cancel"
                onClick={() => setShowCreate(false)}
              />
              <OperationSubmit>Create squad</OperationSubmit>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}
