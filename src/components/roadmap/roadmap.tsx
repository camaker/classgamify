import { m } from '@/locale/paraglide/messages';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
}
export function Roadmap() {
  const columnTitles = {
    backlog: m.roadmap_columns_backlog(),
    inProgress: m.roadmap_columns_in_progress(),
    done: m.roadmap_columns_done(),
  };
  const columns = {
    backlog: [
      {
        id: '1',
        title: m.roadmap_board_tasks_backlog_0_title(),
        description: m.roadmap_board_tasks_backlog_0_description(),
        priority: 'high',
      },
      {
        id: '2',
        title: m.roadmap_board_tasks_backlog_1_title(),
        description: m.roadmap_board_tasks_backlog_1_description(),
        priority: 'medium',
      },
      {
        id: '3',
        title: m.roadmap_board_tasks_backlog_2_title(),
        description: m.roadmap_board_tasks_backlog_2_description(),
        priority: 'low',
      },
    ],
    inProgress: [
      {
        id: '4',
        title: m.roadmap_board_tasks_in_progress_0_title(),
        description: m.roadmap_board_tasks_in_progress_0_description(),
        priority: 'high',
      },
      {
        id: '5',
        title: m.roadmap_board_tasks_in_progress_1_title(),
        description: m.roadmap_board_tasks_in_progress_1_description(),
        priority: 'medium',
      },
    ],
    done: [
      {
        id: '7',
        title: m.roadmap_board_tasks_done_0_title(),
        description: m.roadmap_board_tasks_done_0_description(),
        priority: 'high',
      },
      {
        id: '8',
        title: m.roadmap_board_tasks_done_1_title(),
        description: m.roadmap_board_tasks_done_1_description(),
        priority: 'low',
      },
    ],
  } satisfies Record<string, Task[]>;
  return (
    <div className="grid w-full auto-rows-auto grid-cols-1 gap-4 md:grid-cols-2 md:auto-rows-fr lg:grid-cols-3">
      {Object.entries(columns).map(([columnValue, tasks]) => (
        <TaskColumn
          key={columnValue}
          value={columnValue}
          tasks={tasks}
          title={
            columnTitles[columnValue as keyof typeof columnTitles] ??
            columnValue
          }
        />
      ))}
    </div>
  );
}
interface TaskCardProps {
  task: Task;
}
function TaskCard({ task }: TaskCardProps) {
  const priority = {
    high: m.roadmap_board_priority_high(),
    medium: m.roadmap_board_priority_medium(),
    low: m.roadmap_board_priority_low(),
  }[task.priority];
  return (
    <div className="rounded-md border bg-card p-3 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-2 font-medium text-sm">{task.title}</span>
          <Badge
            variant="outline"
            className={cn(
              'pointer-events-none h-5 shrink-0 rounded-sm px-1.5 text-[11px] capitalize border-transparent',
              task.priority === 'high'
                ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                : task.priority === 'medium'
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
            )}
          >
            {priority}
          </Badge>
        </div>
        <p className="line-clamp-3 text-muted-foreground text-xs leading-5">
          {task.description}
        </p>
      </div>
    </div>
  );
}
interface TaskColumnProps {
  value: string;
  tasks: Task[];
  title: string;
}
function TaskColumn({ value, tasks, title }: TaskColumnProps) {
  return (
    <div key={value} className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{title}</span>
          <Badge variant="secondary" className="pointer-events-none rounded-sm">
            {tasks.length}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-0.5">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
