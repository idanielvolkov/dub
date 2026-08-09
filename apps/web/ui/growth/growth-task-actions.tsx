"use client";

import { GrowthTask } from "@/lib/growth/tasks";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import {
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@dub/ui";
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
        <ModalHeader title="Edit task" description={task.title} />
        <ModalBody className="bg-bg-muted">
          <form action={updateGrowthTask} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="id" value={task.id} />
            <GrowthTaskFields task={task} />
            <div className="flex justify-end md:col-span-2">
              <OperationSubmit>Save changes</OperationSubmit>
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <form action={deleteGrowthTask}>
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="id" value={task.id} />
            <OperationSubmit
              destructive
              confirmMessage={`Delete task “${task.title}”?`}
            >
              Delete task
            </OperationSubmit>
          </form>
        </ModalFooter>
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
        <ModalHeader
          title="Create task"
          description="Add work for the growth team."
        />
        <ModalBody asChild className="bg-bg-muted">
          <form action={createGrowthTask} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="slug" value={slug} />
            <GrowthTaskFields />
            <ModalFooter className="-mx-6 -mb-5 mt-1 md:col-span-2">
              <Button
                className="w-fit"
                variant="secondary"
                text="Cancel"
                onClick={() => setShowModal(false)}
              />
              <OperationSubmit>Create task</OperationSubmit>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}
