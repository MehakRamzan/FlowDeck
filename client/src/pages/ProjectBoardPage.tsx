import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useSearchParams,
} from "react-router";

import AppLayout from "../components/layout/AppLayout";
import KanbanColumn from "../components/ui/KanbanColumn";
import TaskCard from "../components/ui/TaskCard";
import TaskDetailsDrawer from "../components/ui/TaskDetailsDrawer";
import CreateTaskModal from "../components/ui/CreateTaskModal";

import { apiRequest } from "../lib/api";

type Project = {
  id: string;
  name: string;
  description: string | null;
  teamId: string;

  team: {
    id: string;
    name: string;
    organizationId: string;
  };
};

type BoardColumn = {
  id: string;
  name: string;
  position: number;
  projectId: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  projectId: string;
  columnId: string;
  assigneeId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;

  assignee: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;

  column: {
    id: string;
    name: string;
  };
};

type ProjectView = "overview" | "board" | "list" | "calendar";

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ProjectBoardPage() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get("view");
  const activeView: ProjectView =
    requestedView === "overview" || requestedView === "list" || requestedView === "calendar"
      ? requestedView
      : "board";
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [project, setProject] =
    useState<Project | null>(null);

  const [columns, setColumns] =
    useState<BoardColumn[]>([]);

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [selectedTaskId, setSelectedTaskId] =
    useState<string | null>(null);

  const [isCreateTaskOpen, setIsCreateTaskOpen] =
    useState(false);

  const [defaultColumnId, setDefaultColumnId] =
    useState<string | undefined>();

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");

  const completedColumnIds = useMemo(
    () =>
      new Set(
        columns
          .filter((column) => /done|complete|closed/i.test(column.name))
          .map((column) => column.id)
      ),
    [columns]
  );
  const completedTasks = tasks.filter((task) => completedColumnIds.has(task.columnId));
  const completionRate = tasks.length
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;
  const assignedPeople = new Set(
    tasks.map((task) => task.assigneeId).filter(Boolean)
  ).size;
  const calendarDays = useMemo(() => {
    const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [calendarMonth]);

  function changeView(view: ProjectView) {
    if (view === "board") setSearchParams({});
    else setSearchParams({ view });
  }

  const loadBoard = useCallback(async () => {
    if (!projectId) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [
        projectResponse,
        columnsResponse,
        tasksResponse,
      ] = await Promise.all([
        apiRequest(
          `/projects/${projectId}`
        ),

        apiRequest(
          `/board-columns/projects/${projectId}`
        ),

        apiRequest(
          `/tasks/projects/${projectId}`
        ),
      ]);

      setProject(
        projectResponse.data.project as Project
      );

      setColumns(
        (
          columnsResponse.data
            .columns as BoardColumn[]
        ).sort(
          (a, b) =>
            a.position - b.position
        )
      );

      setTasks(
        tasksResponse.data.tasks as Task[]
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load project board"
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void loadBoard();
      }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadBoard]);

  function openCreateTask(
    columnId?: string
  ) {
    setDefaultColumnId(columnId);
    setIsCreateTaskOpen(true);
  }

  async function addColumn() {
    if (!projectId) return;
    const name = window.prompt("Column name");
    if (!name?.trim()) return;
    try { await apiRequest(`/board-columns/projects/${projectId}`, { method: "POST", body: JSON.stringify({ name: name.trim() }) }); await loadBoard(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to add column"); }
  }

  async function manageColumn(column: BoardColumn) {
    const action = window.prompt("Enter a new column name, or type DELETE to remove it", column.name);
    if (!action) return;
    try { if (action === "DELETE") { if (!window.confirm(`Delete “${column.name}” and every task in it?`)) return; await apiRequest(`/board-columns/${column.id}`, { method: "DELETE" }); } else await apiRequest(`/board-columns/${column.id}`, { method: "PATCH", body: JSON.stringify({ name: action.trim() }) }); await loadBoard(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to update column"); }
  }

  async function moveColumn(index: number, direction: -1 | 1) {
    if (!projectId) return;
    const target = index + direction;
    if (target < 0 || target >= columns.length) return;
    const reordered = [...columns];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    try { await apiRequest(`/board-columns/projects/${projectId}/reorder`, { method: "PATCH", body: JSON.stringify({ columnIds: reordered.map((column) => column.id) }) }); setColumns(reordered.map((column, position) => ({ ...column, position }))); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to reorder columns"); }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-(--color-text-secondary)">
            Loading project board...
          </p>
        </div>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <div className="rounded-(--radius-md) border border-red-200 bg-red-50 p-4 text-red-700">
            {error ||
              "Project not found"}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-(--color-text-secondary)">
              {project.team.name}
            </p>

            <h1 className="mt-1 font-(--font-heading) text-3xl font-bold text-(--color-text-primary)">
              {project.name}
            </h1>
          </div>

          <div className="flex gap-3">
            {activeView === "board" && (
              <button type="button" onClick={() => void addColumn()} className="rounded-(--radius-md) border border-(--color-border) px-4 py-3 text-sm font-semibold">
                + Column
              </button>
            )}
            <button
              type="button"
              onClick={() => openCreateTask()}
              disabled={columns.length === 0}
              className="rounded-(--radius-md) bg-(--color-primary) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              + New Task
            </button>
          </div>
        </header>

        <nav className="mt-8 flex gap-6 border-b border-(--color-border)">
          {(["overview", "board", "list", "calendar"] as ProjectView[]).map((view) => (
            <button
              type="button"
              key={view}
              onClick={() => changeView(view)}
              className={
                activeView === view
                  ? "border-b-2 border-(--color-accent) pb-3 text-sm font-semibold capitalize text-(--color-primary)"
                  : "pb-3 text-sm font-medium capitalize text-(--color-text-secondary) hover:text-(--color-primary)"
              }
            >
              {view}
            </button>
          ))}
        </nav>

        {activeView === "overview" && (
          <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)">
              <p className="text-xs font-bold uppercase tracking-widest text-(--color-accent)">Project overview</p>
              <h2 className="mt-3 font-(--font-heading) text-2xl font-bold">{project.name}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-(--color-text-secondary)">
                {project.description || "No project description has been added yet."}
              </p>
              <div className="mt-8 h-2 overflow-hidden rounded-full bg-(--color-background)">
                <div className="h-full rounded-full bg-(--color-accent) transition-all" style={{ width: `${completionRate}%` }} />
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-(--color-text-secondary)">Overall completion</span>
                <b>{completionRate}%</b>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Total tasks", tasks.length],
                ["Completed", completedTasks.length],
                ["People assigned", assignedPeople],
                ["Board stages", columns.length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-(--radius-lg) border border-(--color-border) bg-white p-5 shadow-(--shadow-sm)">
                  <strong className="font-(--font-heading) text-3xl">{value}</strong>
                  <p className="mt-2 text-xs text-(--color-text-secondary)">{label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeView === "board" && (columns.length === 0 ? (
          <section className="mt-8 rounded-(--radius-lg) border border-dashed border-(--color-border) bg-white px-6 py-16 text-center">
            <h2 className="font-(--font-heading) text-xl font-bold">
              No board columns
            </h2>

            <p className="mt-2 text-sm text-(--color-text-secondary)">
              This project does not have any board columns yet.
            </p>
          </section>
        ) : (
          <div className="mt-6 flex gap-5 overflow-x-auto pb-5">
            {columns.map((column, columnIndex) => {
              const columnTasks = tasks
                .filter(
                  (task) =>
                    task.columnId ===
                    column.id
                )
                .sort(
                  (a, b) =>
                    a.position -
                    b.position
                );

              return (
                <KanbanColumn
                  key={column.id}
                  title={column.name}
                  count={
                    columnTasks.length
                  }
                  onAddTask={() =>
                    openCreateTask(
                      column.id
                    )
                  }
                  onManage={() => void manageColumn(column)}
                  onMoveLeft={columnIndex > 0 ? () => void moveColumn(columnIndex, -1) : undefined}
                  onMoveRight={columnIndex < columns.length - 1 ? () => void moveColumn(columnIndex, 1) : undefined}
                >
                  {columnTasks.map(
                    (task) => (
                      <TaskCard
                        key={task.id}
                        title={task.title}
                        description={
                          task.description
                        }
                        assignee={
                          task.assignee
                            ? getInitials(
                                task
                                  .assignee
                                  .name
                              )
                            : null
                        }
                        onClick={() =>
                          setSelectedTaskId(
                            task.id
                          )
                        }
                      />
                    )
                  )}
                </KanbanColumn>
              );
            })}
          </div>
        ))}

        {activeView === "list" && (
          <section className="mt-6 overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-white shadow-(--shadow-sm)">
            {tasks.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead className="bg-(--color-background) text-xs uppercase tracking-wider text-(--color-text-secondary)">
                    <tr><th className="px-5 py-4">Task</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Assignee</th><th className="px-5 py-4">Due date</th></tr>
                  </thead>
                  <tbody>
                    {[...tasks]
                      .sort((a, b) => (columns.findIndex((column) => column.id === a.columnId) - columns.findIndex((column) => column.id === b.columnId)) || a.position - b.position)
                      .map((task) => (
                        <tr key={task.id} onClick={() => setSelectedTaskId(task.id)} className="cursor-pointer border-t border-(--color-border) transition hover:bg-(--color-background)">
                          <td className="px-5 py-4"><b className="text-sm">{task.title}</b><p className="mt-1 max-w-md truncate text-xs text-(--color-text-secondary)">{task.description || "No description"}</p></td>
                          <td className="px-5 py-4"><span className="rounded-full bg-(--color-background) px-3 py-1 text-xs font-semibold">{task.column.name}</span></td>
                          <td className="px-5 py-4 text-sm">{task.assignee?.name || "Unassigned"}</td>
                          <td className="px-5 py-4 text-sm text-(--color-text-secondary)">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not scheduled"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-16 text-center"><h2 className="font-(--font-heading) text-xl font-bold">No tasks yet</h2><p className="mt-2 text-sm text-(--color-text-secondary)">Create a task to see it in this list.</p></div>
            )}
          </section>
        )}

        {activeView === "calendar" && (
          <section className="mt-6 rounded-(--radius-lg) border border-(--color-border) bg-white p-5 shadow-(--shadow-sm)">
            <header className="flex items-center justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-widest text-(--color-accent)">Task schedule</p><h2 className="mt-1 font-(--font-heading) text-xl font-bold">{calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2></div>
              <div className="flex gap-2"><button type="button" aria-label="Previous month" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-(--radius-md) border border-(--color-border) px-3 py-2">←</button><button type="button" onClick={() => setCalendarMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} className="rounded-(--radius-md) border border-(--color-border) px-3 py-2 text-xs font-semibold">Today</button><button type="button" aria-label="Next month" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-(--radius-md) border border-(--color-border) px-3 py-2">→</button></div>
            </header>
            <div className="mt-5 grid grid-cols-7 border-l border-t border-(--color-border)">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => <div key={day} className="border-b border-r border-(--color-border) bg-(--color-background) px-2 py-3 text-center text-[10px] font-bold uppercase text-(--color-text-secondary)">{day}</div>)}
              {calendarDays.map((date) => {
                const scheduled = tasks.filter((task) => task.dueDate?.slice(0, 10) === dateKey(date));
                const inMonth = date.getMonth() === calendarMonth.getMonth();
                const today = dateKey(date) === dateKey(new Date());
                return <div key={dateKey(date)} className={`min-h-28 border-b border-r border-(--color-border) p-2 ${inMonth ? "bg-white" : "bg-(--color-background) opacity-55"}`}><span className={`inline-grid h-6 w-6 place-items-center rounded-full text-xs ${today ? "bg-(--color-primary) text-white" : "text-(--color-text-secondary)"}`}>{date.getDate()}</span><div className="mt-1 space-y-1">{scheduled.slice(0,3).map((task) => <button type="button" key={task.id} onClick={() => setSelectedTaskId(task.id)} className="block w-full truncate rounded-md bg-[#f2d8ce] px-2 py-1 text-left text-[10px] font-semibold text-[#653e32]">{task.title}</button>)}{scheduled.length > 3 && <small className="block px-1 text-[9px] text-(--color-text-secondary)">+{scheduled.length - 3} more</small>}</div></div>;
              })}
            </div>
            {!tasks.some((task) => task.dueDate) && <p className="mt-4 rounded-(--radius-md) bg-(--color-background) p-4 text-sm text-(--color-text-secondary)">No tasks have due dates yet. Open a task or create a new one to schedule it.</p>}
          </section>
        )}
      </div>

    {selectedTaskId && (
  <TaskDetailsDrawer
    taskId={selectedTaskId}
    columns={columns}
    onClose={() =>
      setSelectedTaskId(null)
    }
    onUpdated={loadBoard}
  />
)}

      {isCreateTaskOpen &&
        projectId && (
          <CreateTaskModal
            projectId={projectId}
            columns={columns}
            defaultColumnId={
              defaultColumnId
            }
            onClose={() => {
              setIsCreateTaskOpen(false);
              setDefaultColumnId(
                undefined
              );
            }}
            onCreated={loadBoard}
          />
        )}
    </AppLayout>
  );
}

export default ProjectBoardPage;
