import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router";

import AppLayout from "../components/layout/AppLayout";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/useAuth";

type Team = {
  id: string;
  name: string;
  organizationId: string;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  teamId: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  projectId: string;
  columnId: string;
  assigneeId: string | null;

  column: {
    id: string;
    name: string;
  };

  assignee: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;
};

type TaskItem = {
  task: Task;
  project: Project;
};

function MyTasksPage() {
  const {
    user,
    currentOrganization,
  } = useAuth();

  const [tasks, setTasks] = useState<TaskItem[]>([]);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState("all");

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");

  const organizationId =
    currentOrganization?.organization.id;

  const loadTasks = useCallback(async () => {
    if (!organizationId || !user) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const teamsResponse = await apiRequest(
        `/teams/organization/${organizationId}`
      );

      const teams =
        teamsResponse.data.teams as Team[];

      if (teams.length === 0) {
        setTasks([]);
        return;
      }

      const projectResponses = await Promise.all(
        teams.map((team) =>
          apiRequest(
            `/projects/teams/${team.id}`
          )
        )
      );

      const projects =
        projectResponses.flatMap(
          (response) =>
            response.data.projects as Project[]
        );

      if (projects.length === 0) {
        setTasks([]);
        return;
      }

      const taskResponses = await Promise.all(
        projects.map((project) =>
          apiRequest(
            `/tasks/projects/${project.id}`
          )
        )
      );

      const taskItems: TaskItem[] = [];

      taskResponses.forEach(
        (response, index) => {
          const project = projects[index];

          const projectTasks =
            response.data.tasks as Task[];

          projectTasks
            .filter(
              (task) =>
                task.assigneeId === user.id
            )
            .forEach((task) => {
              taskItems.push({
                task,
                project,
              });
            });
        }
      );

      setTasks(taskItems);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load your tasks"
      );
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTasks();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadTasks]);

  const statuses = useMemo(() => {
    return Array.from(
      new Set(
        tasks.map(
          (item) => item.task.column.name
        )
      )
    );
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return tasks.filter((item) => {
      const matchesSearch =
        item.task.title
          .toLowerCase()
          .includes(searchValue) ||
        item.project.name
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        selectedStatus === "all" ||
        item.task.column.name ===
          selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, selectedStatus]);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <header>
          <h1 className="font-(--font-heading) text-3xl font-bold">
            My Tasks
          </h1>

          <p className="mt-2 text-(--color-text-secondary)">
            View and manage tasks assigned to you.
          </p>
        </header>

        {error && (
          <div className="mt-6 rounded-(--radius-md) border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <input
            type="search"
            placeholder="Search your tasks..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none focus:border-(--color-accent) sm:max-w-sm"
          />

          <select
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(
                event.target.value
              )
            }
            className="rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none"
          >
            <option value="all">
              All statuses
            </option>

            {statuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-(--color-text-secondary)">
              Loading your tasks...
            </p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <section className="mt-6 rounded-(--radius-lg) border border-dashed border-(--color-border) bg-white px-6 py-14 text-center">
            <h2 className="font-(--font-heading) text-xl font-bold">
              No tasks found
            </h2>

            <p className="mt-2 text-sm text-(--color-text-secondary)">
              {tasks.length === 0
                ? "No tasks are currently assigned to you."
                : "No tasks match your current search or status filter."}
            </p>
          </section>
        ) : (
          <section className="mt-6 overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-white shadow-(--shadow-sm)">
            <div className="hidden grid-cols-[2.5fr_1.5fr_1fr_auto] gap-4 border-b border-(--color-border) px-6 py-4 text-sm font-semibold text-(--color-text-secondary) md:grid">
              <span>Task</span>
              <span>Project</span>
              <span>Status</span>
              <span>Open</span>
            </div>

            {filteredTasks.map(
              ({ task, project }) => (
                <article
                  key={task.id}
                  className="grid gap-3 border-b border-(--color-border) p-5 last:border-b-0 md:grid-cols-[2.5fr_1.5fr_1fr_auto] md:items-center md:px-6"
                >
                  <div>
                    <h2 className="font-semibold">
                      {task.title}
                    </h2>

                    {task.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-(--color-text-secondary)">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <span className="text-sm text-(--color-text-secondary)">
                    {project.name}
                  </span>

                  <span className="w-fit rounded-full bg-(--color-background) px-3 py-1 text-xs font-semibold">
                    {task.column.name}
                  </span>

                  <Link
                    to={`/projects/${project.id}/board`}
                    className="w-fit text-sm font-semibold text-(--color-accent)"
                  >
                    Open board
                  </Link>
                </article>
              )
            )}
          </section>
        )}
      </div>
    </AppLayout>
  );
}

export default MyTasksPage;