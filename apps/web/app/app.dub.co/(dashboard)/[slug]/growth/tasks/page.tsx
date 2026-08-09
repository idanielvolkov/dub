import { getGrowthTasks, GrowthTask } from "@/lib/growth/tasks";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { Badge } from "@dub/ui";
import {
  createGrowthTask,
  deleteGrowthTask,
  updateGrowthTask,
} from "./actions";

const inputClass =
  "h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-neutral-400";
const columns: { value: GrowthTask["status"]; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

function TaskFields({ task }: { task?: GrowthTask }) {
  return (
    <>
      <label className="grid gap-1 text-xs text-neutral-500 md:col-span-2">
        Title
        <input
          className={inputClass}
          name="title"
          defaultValue={task?.title}
          placeholder="Prepare Telegram launch"
          minLength={3}
          required
        />
      </label>
      <label className="grid gap-1 text-xs text-neutral-500">
        Assignee
        <input
          className={inputClass}
          name="assignee"
          defaultValue={task?.assignee}
          placeholder="Alex"
        />
      </label>
      <label className="grid gap-1 text-xs text-neutral-500">
        Due date
        <input
          className={inputClass}
          type="date"
          name="dueDate"
          defaultValue={task?.dueDate || ""}
        />
      </label>
      <label className="grid gap-1 text-xs text-neutral-500">
        Status
        <select
          className={inputClass}
          name="status"
          defaultValue={task?.status || "backlog"}
        >
          {columns.map((column) => (
            <option key={column.value} value={column.value}>
              {column.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs text-neutral-500">
        Priority
        <select
          className={inputClass}
          name="priority"
          defaultValue={task?.priority || "medium"}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs text-neutral-500 md:col-span-2">
        Description
        <input
          className={inputClass}
          name="description"
          defaultValue={task?.description}
          placeholder="Deliverables and acceptance criteria"
        />
      </label>
    </>
  );
}

export default async function GrowthTasksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tasks = await getGrowthTasks(slug);
  return (
    <PageContent
      title="Tasks"
      titleInfo={{
        title: "Marketing work, ownership, deadlines, and progress.",
      }}
    >
      <PageWidthWrapper className="pb-10">
        <VpnPanel className="mb-4">
          <VpnPanelHeader
            title="Create task"
            description="Add work for the growth team"
          />
          <form
            action={createGrowthTask}
            className="grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-4"
          >
            <input type="hidden" name="slug" value={slug} />
            <TaskFields />
            <div className="lg:col-span-4">
              <OperationSubmit>Create task</OperationSubmit>
            </div>
          </form>
        </VpnPanel>
        <div className="grid items-start gap-4 xl:grid-cols-4">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.value,
            );
            return (
              <VpnPanel key={column.value}>
                <VpnPanelHeader
                  title={column.label}
                  description={`${columnTasks.length} tasks`}
                />
                <div className="divide-border-subtle divide-y">
                  {columnTasks.map((task) => (
                    <div key={task.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-content-emphasis text-sm font-medium">
                          {task.title}
                        </p>
                        <Badge
                          variant={task.priority === "high" ? "red" : "gray"}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-content-subtle text-xs leading-5">
                          {task.description}
                        </p>
                      )}
                      <p className="text-content-subtle text-xs">
                        {task.assignee || "Unassigned"}
                        {task.dueDate
                          ? ` · Due ${new Date(`${task.dueDate}T00:00:00`).toLocaleDateString("en-US")}`
                          : ""}
                      </p>
                      <details className="group">
                        <summary className="cursor-pointer text-xs font-medium text-neutral-600">
                          Edit task
                        </summary>
                        <form
                          action={updateGrowthTask}
                          className="mt-3 grid gap-3"
                        >
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="id" value={task.id} />
                          <TaskFields task={task} />
                          <OperationSubmit>Save</OperationSubmit>
                        </form>
                        <form
                          action={deleteGrowthTask}
                          className="mt-2 flex justify-end"
                        >
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="id" value={task.id} />
                          <OperationSubmit
                            destructive
                            confirmMessage={`Delete task “${task.title}”?`}
                          >
                            Delete
                          </OperationSubmit>
                        </form>
                      </details>
                    </div>
                  ))}
                  {!columnTasks.length && (
                    <p className="text-content-subtle p-6 text-center text-xs">
                      No tasks
                    </p>
                  )}
                </div>
              </VpnPanel>
            );
          })}
        </div>
      </PageWidthWrapper>
    </PageContent>
  );
}
