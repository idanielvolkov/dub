import { getGrowthTasks } from "@/lib/growth/tasks";
import {
  CreateGrowthTaskButton,
  GrowthTaskActions,
  growthTaskStatuses,
} from "@/ui/growth/growth-task-actions";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { Badge, CardList, CardListCard, EmptyState } from "@dub/ui";
import { SquareCheck } from "@dub/ui/icons";

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
      controls={<CreateGrowthTaskButton slug={slug} />}
    >
      <PageWidthWrapper className="pb-10">
        <div className="grid items-start gap-4 xl:grid-cols-4">
          {growthTaskStatuses.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.value,
            );
            return (
              <section key={column.value}>
                <div className="mb-3">
                  <h2 className="text-content-emphasis text-sm font-semibold">
                    {column.label}
                  </h2>
                  <p className="text-content-subtle text-sm">
                    {columnTasks.length} tasks
                  </p>
                </div>
                <CardList variant="compact">
                  {columnTasks.map((task) => (
                    <CardListCard
                      key={task.id}
                      innerClassName="space-y-3 p-4"
                      hoverStateEnabled={false}
                    >
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
                      <GrowthTaskActions slug={slug} task={task} />
                    </CardListCard>
                  ))}
                </CardList>
                {!columnTasks.length && (
                  <div className="py-8">
                    <EmptyState icon={SquareCheck} title="No tasks" />
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </PageWidthWrapper>
    </PageContent>
  );
}
