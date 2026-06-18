import { m } from '@/locale/paraglide/messages';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  IconCircleCheck,
  IconCompass,
  IconRefresh,
  type TablerIcon,
} from '@tabler/icons-react';

interface Task {
  badge: string;
  id: string;
  title: string;
  description: string;
}

interface RoadmapColumn {
  description: string;
  icon: TablerIcon;
  id: 'backlog' | 'done' | 'inProgress';
  tasks: Task[];
  title: string;
  tone: 'available' | 'exploring' | 'improving';
}

export function Roadmap() {
  const columns: RoadmapColumn[] = [
    {
      description: m.roadmap_columns_done_description(),
      icon: IconCircleCheck,
      id: 'done',
      title: m.roadmap_columns_done(),
      tone: 'available',
      tasks: [
        {
          badge: m.roadmap_status_available(),
          id: '7',
          title: m.roadmap_board_tasks_done_0_title(),
          description: m.roadmap_board_tasks_done_0_description(),
        },
        {
          badge: m.roadmap_status_available(),
          id: '8',
          title: m.roadmap_board_tasks_done_1_title(),
          description: m.roadmap_board_tasks_done_1_description(),
        },
      ],
    },
    {
      description: m.roadmap_columns_in_progress_description(),
      icon: IconRefresh,
      id: 'inProgress',
      title: m.roadmap_columns_in_progress(),
      tone: 'improving',
      tasks: [
        {
          badge: m.roadmap_status_improving(),
          id: '4',
          title: m.roadmap_board_tasks_in_progress_0_title(),
          description: m.roadmap_board_tasks_in_progress_0_description(),
        },
        {
          badge: m.roadmap_status_improving(),
          id: '5',
          title: m.roadmap_board_tasks_in_progress_1_title(),
          description: m.roadmap_board_tasks_in_progress_1_description(),
        },
      ],
    },
    {
      description: m.roadmap_columns_backlog_description(),
      icon: IconCompass,
      id: 'backlog',
      title: m.roadmap_columns_backlog(),
      tone: 'exploring',
      tasks: [
        {
          badge: m.roadmap_status_exploring(),
          id: '1',
          title: m.roadmap_board_tasks_backlog_0_title(),
          description: m.roadmap_board_tasks_backlog_0_description(),
        },
        {
          badge: m.roadmap_status_exploring(),
          id: '2',
          title: m.roadmap_board_tasks_backlog_1_title(),
          description: m.roadmap_board_tasks_backlog_1_description(),
        },
        {
          badge: m.roadmap_status_exploring(),
          id: '3',
          title: m.roadmap_board_tasks_backlog_2_title(),
          description: m.roadmap_board_tasks_backlog_2_description(),
        },
      ],
    },
  ];

  return (
    <div className="grid w-full auto-rows-auto grid-cols-1 gap-6 md:grid-cols-3">
      {columns.map((column) => (
        <TaskColumn
          key={column.id}
          description={column.description}
          icon={column.icon}
          tasks={column.tasks}
          title={column.title}
          tone={column.tone}
        />
      ))}
    </div>
  );
}
interface TaskCardProps {
  task: Task;
}
function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-primary/30">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <span className="min-w-0 text-sm font-semibold leading-5">
            {task.title}
          </span>
          <Badge
            variant="secondary"
            className="pointer-events-none h-5 shrink-0 rounded-sm px-1.5 text-[11px]"
          >
            {task.badge}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm leading-6">
          {task.description}
        </p>
      </div>
    </div>
  );
}
interface TaskColumnProps {
  description: string;
  icon: TablerIcon;
  tasks: Task[];
  title: string;
  tone: RoadmapColumn['tone'];
}

function TaskColumn({
  description,
  icon: Icon,
  tasks,
  title,
  tone,
}: TaskColumnProps) {
  return (
    <section className="min-w-0 space-y-3">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg border',
            tone === 'available' &&
              'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
            tone === 'improving' &&
              'border-primary/30 bg-primary/10 text-primary',
            tone === 'exploring' &&
              'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300'
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-base">{title}</h2>
            <Badge
              variant="outline"
              className="pointer-events-none rounded-sm px-1.5"
            >
              {tasks.length}
            </Badge>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="grid gap-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}
