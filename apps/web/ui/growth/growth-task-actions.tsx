"use client";

import { GrowthTask } from "@/lib/growth/tasks";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { Button, Input, Label, Modal } from "@dub/ui";
import { useState } from "react";
import {
  createGrowthTask,
  deleteGrowthTask,
  updateGrowthTask,
} from "../../app/app.dub.co/(dashboard)/[slug]/growth/tasks/actions";

export const growthTaskStatuses: {
  value: GrowthTask["status"];
  label: string;
}[] = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

export function GrowthTaskFields({ task }: { task?: GrowthTask }) {
  return (
    <>
      <div className="grid gap-1.5 md:col-span-2">
        <Label>Title</Label>
        <Input
          className="h-9"
          name="title"
          defaultValue={task?.title}
          placeholder="Prepare Telegram launch"
          minLength={3}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Assignee</Label>
        <Input
          className="h-9"
          name="assignee"
          defaultValue={task?.assignee}
          placeholder="Alex"
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Due date</Label>
        <Input
          className="h-9"
          type="date"
          name="dueDate"
          defaultValue={task?.dueDate || ""}
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Status</Label>
        <FormCombobox
          name="status"
          defaultValue={task?.status || "backlog"}
          className="h-9"
          options={growthTaskStatuses}
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Priority</Label>
        <FormCombobox
          name="priority"
          defaultValue={task?.priority || "medium"}
          className="h-9"
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
          ]}
        />
      </div>
      <div className="grid gap-1.5 md:col-span-2">
        <Label>Description</Label>
        <Input
          className="h-9"
          name="description"
          defaultValue={task?.description}
          placeholder="Deliverables and acceptance criteria"
        />
      </div>
    </>
  );
}

export function GrowthTaskActions({
  slug,
  task,
}: {
  slug: string;
  task: GrowthTask;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        className="h-8 w-fit px-2.5 text-xs"
        text="Edit task"
        onClick={() => setShowModal(true)}
      />
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        className="max-w-xl"
      >
        <div className="border-border-subtle border-b px-6 py-4">
          <h3 className="text-content-emphasis text-lg font-medium">
            Edit task
          </h3>
          <p className="text-content-subtle mt-1 text-sm">{task.title}</p>
        </div>
        <div className="bg-bg-muted p-6">
          <form action={updateGrowthTask} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="id" value={task.id} />
            <GrowthTaskFields task={task} />
            <div className="flex justify-end md:col-span-2">
              <OperationSubmit>Save changes</OperationSubmit>
            </div>
          </form>
          <form action={deleteGrowthTask} className="mt-3 flex justify-end">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="id" value={task.id} />
            <OperationSubmit
              destructive
              confirmMessage={`Delete task “${task.title}”?`}
            >
              Delete task
            </OperationSubmit>
          </form>
        </div>
      </Modal>
    </>
  );
}

export function CreateGrowthTaskButton({ slug }: { slug: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        className="h-9 w-fit px-3"
        text="Create task"
        onClick={() => setShowModal(true)}
      />
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        className="max-w-xl"
      >
        <div className="border-border-subtle border-b px-6 py-4">
          <h3 className="text-content-emphasis text-lg font-medium">
            Create task
          </h3>
          <p className="text-content-subtle mt-1 text-sm">
            Add work for the growth team.
          </p>
        </div>
        <form
          action={createGrowthTask}
          className="bg-bg-muted grid gap-4 p-6 md:grid-cols-2"
        >
          <input type="hidden" name="slug" value={slug} />
          <GrowthTaskFields />
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button
              className="w-fit"
              variant="secondary"
              text="Cancel"
              onClick={() => setShowModal(false)}
            />
            <OperationSubmit>Create task</OperationSubmit>
          </div>
        </form>
      </Modal>
    </>
  );
}
