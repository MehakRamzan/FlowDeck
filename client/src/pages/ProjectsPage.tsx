import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router";

import AppLayout from "../components/layout/AppLayout";
import CreateProjectModal from "../components/ui/CreateProjectModal";

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
  createdAt: string;
  updatedAt: string;
};

type DashboardData = {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  totalComments: number;
  totalActivities: number;
};

type ProjectItem = {
  project: Project;
  team: Team;
  dashboard: DashboardData;
};

function ProjectsPage() {
  const { currentOrganization } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTeamId, setEditTeamId] = useState("");

  const [search, setSearch] = useState("");
  const [selectedTeamId, setSelectedTeamId] =
    useState("all");

  const [isCreateProjectOpen, setIsCreateProjectOpen] =
    useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const organizationId =
    currentOrganization?.organization.id;

  function startEditing(project: Project) {
    setEditingProject(project);
    setEditName(project.name);
    setEditDescription(project.description ?? "");
    setEditTeamId(project.teamId);
  }

  async function saveProject() {
    if (!editingProject) return;
    try { await apiRequest(`/projects/${editingProject.id}`, { method: "PATCH", body: JSON.stringify({ name: editName, description: editDescription || null, teamId: editTeamId }) }); setEditingProject(null); await loadProjects(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to update project"); }
  }

  async function deleteEditingProject() {
    if (!editingProject || !window.confirm(`Delete “${editingProject.name}” and all of its tasks?`)) return;
    try { await apiRequest(`/projects/${editingProject.id}`, { method: "DELETE" }); setEditingProject(null); await loadProjects(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to delete project"); }
  }

  const loadProjects = useCallback(async () => {
    if (!organizationId) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Get workspace teams
      const teamsResponse = await apiRequest(
        `/teams/organization/${organizationId}`
      );

      const workspaceTeams =
        teamsResponse.data.teams as Team[];

      setTeams(workspaceTeams);

      if (workspaceTeams.length === 0) {
        setProjects([]);
        return;
      }

      // Get projects for every team
      const projectResponses = await Promise.all(
        workspaceTeams.map((team) =>
          apiRequest(`/projects/teams/${team.id}`)
        )
      );

      const allProjects =
        projectResponses.flatMap(
          (response) =>
            response.data.projects as Project[]
        );

      if (allProjects.length === 0) {
        setProjects([]);
        return;
      }

      // Get statistics for every project
      const dashboardResponses =
        await Promise.all(
          allProjects.map((project) =>
            apiRequest(
              `/dashboard/projects/${project.id}`
            )
          )
        );

      const projectItems: ProjectItem[] =
        allProjects.map((project, index) => {
          const team = workspaceTeams.find(
            (team) => team.id === project.teamId
          );

          if (!team) {
            throw new Error(
              "Unable to match project with team"
            );
          }

          return {
            project,
            team,
            dashboard:
              dashboardResponses[index].data
                .dashboard as DashboardData,
          };
        });

      setProjects(projectItems);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load projects"
      );
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadProjects();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [loadProjects]);
  const filteredProjects = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return projects.filter((item) => {
      const matchesSearch =
        item.project.name
          .toLowerCase()
          .includes(searchValue) ||
        item.project.description
          ?.toLowerCase()
          .includes(searchValue);

      const matchesTeam =
        selectedTeamId === "all" ||
        item.team.id === selectedTeamId;

      return matchesSearch && matchesTeam;
    });
  }, [projects, search, selectedTeamId]);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-(--font-heading) text-3xl font-bold">
              Projects
            </h1>

            <p className="mt-2 text-(--color-text-secondary)">
              View and manage projects across your workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setIsCreateProjectOpen(true)
            }
            className="rounded-(--radius-md) bg-(--color-primary) px-4 py-3 text-sm font-semibold text-white"
          >
            + Create Project
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-(--radius-md) border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <input
            type="search"
            placeholder="Search projects..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none focus:border-(--color-accent) sm:max-w-sm"
          />

          <select
            value={selectedTeamId}
            onChange={(event) =>
              setSelectedTeamId(
                event.target.value
              )
            }
            className="rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none"
          >
            <option value="all">
              All teams
            </option>

            {teams.map((team) => (
              <option
                key={team.id}
                value={team.id}
              >
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-(--color-text-secondary)">
              Loading projects...
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <section className="mt-8 rounded-(--radius-lg) border border-dashed border-(--color-border) bg-white px-6 py-16 text-center">
            <h2 className="font-(--font-heading) text-xl font-bold">
              No projects found
            </h2>

            <p className="mt-2 text-sm text-(--color-text-secondary)">
              {projects.length === 0
                ? "Create your first project to start organizing work."
                : "No projects match your current search or team filter."}
            </p>
          </section>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map(
              ({
                project,
                team,
                dashboard,
              }) => {
                const progress =
                  dashboard.totalTasks === 0
                    ? 0
                    : Math.round(
                        (dashboard.completedTasks /
                          dashboard.totalTasks) *
                          100
                      );

                return (
                  <article
                    key={project.id}
                    className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)"
                  >
                    <div className="flex items-start justify-between">
                      <span className="rounded-full bg-(--color-background) px-3 py-1 text-xs font-semibold text-(--color-secondary)">
                        {team.name}
                      </span>

                      <button
                        type="button"
                        onClick={() => startEditing(project)}
                        className="text-xl text-(--color-text-secondary)"
                      >
                        •••
                      </button>
                    </div>

                    <h2 className="mt-5 font-(--font-heading) text-xl font-bold">
                      {project.name}
                    </h2>

                    <p className="mt-2 min-h-12 text-sm leading-6 text-(--color-text-secondary)">
                      {project.description ||
                        "No project description yet."}
                    </p>

                    <div className="mt-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-(--color-text-secondary)">
                          Progress
                        </span>

                        <span className="font-semibold">
                          {progress}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-(--color-background)">
                        <div
                          className="h-full rounded-full bg-(--color-accent)"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex justify-between border-t border-(--color-border) pt-4 text-sm">
                      <span className="text-(--color-text-secondary)">
                        {dashboard.totalTasks}{" "}
                        {dashboard.totalTasks === 1
                          ? "task"
                          : "tasks"}
                      </span>

                      <span className="text-(--color-text-secondary)">
                        {dashboard.completedTasks}{" "}
                        completed
                      </span>
                    </div>

                    <Link
                      to={`/projects/${project.id}/board`}
                      className="mt-5 block rounded-(--radius-md) border border-(--color-border) px-4 py-2.5 text-center text-sm font-semibold transition hover:bg-(--color-background)"
                    >
                      Open project
                    </Link>
                  </article>
                );
              }
            )}
          </div>
        )}

        {editingProject && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={() => setEditingProject(null)}><section className="w-full max-w-lg rounded-(--radius-lg) bg-white p-6 shadow-xl" onMouseDown={(event) => event.stopPropagation()}><h2 className="font-(--font-heading) text-xl font-bold">Edit project</h2><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Name<input value={editName} onChange={(event) => setEditName(event.target.value)} className="mt-2 w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 font-normal" /></label><label className="block text-sm font-semibold">Description<textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} rows={4} className="mt-2 w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 font-normal" /></label><label className="block text-sm font-semibold">Team<select value={editTeamId} onChange={(event) => setEditTeamId(event.target.value)} className="mt-2 w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 font-normal">{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label></div><div className="mt-6 flex flex-wrap justify-between gap-3"><button type="button" onClick={() => void deleteEditingProject()} className="rounded-(--radius-md) border border-red-300 px-4 py-2 font-semibold text-red-600">Delete project</button><div className="flex gap-3"><button type="button" onClick={() => setEditingProject(null)} className="rounded-(--radius-md) border border-(--color-border) px-4 py-2 font-semibold">Cancel</button><button type="button" onClick={() => void saveProject()} className="rounded-(--radius-md) bg-(--color-primary) px-4 py-2 font-semibold text-white">Save changes</button></div></div></section></div>}

        {isCreateProjectOpen && (
          <CreateProjectModal
            onClose={() =>
              setIsCreateProjectOpen(false)
            }
            onCreated={loadProjects}
          />
        )}
      </div>
    </AppLayout>
  );
}

export default ProjectsPage;
