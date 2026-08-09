import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { apiRequest } from "../../lib/api";
import CreateTaskModal from "./CreateTaskModal";

type ProjectOption = { id: string; name: string; teamName: string };
type BoardColumn = { id: string; name: string; position: number; projectId: string };

export default function QuickCreateTaskModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: () => void;
}) {
  const { currentOrganization } = useAuth();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState("");
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [error, setError] = useState("");
  const organizationId = currentOrganization?.organization.id;

  useEffect(() => {
    if (!organizationId) return;
    let active = true;
    async function loadProjects() {
      try {
        const teamsResponse = await apiRequest(
          `/teams/organization/${organizationId}`
        );
        const teams = teamsResponse.data.teams as { id: string; name: string }[];
        const responses = await Promise.all(
          teams.map((team) => apiRequest(`/projects/teams/${team.id}`))
        );
        if (!active) return;
        const options = responses.flatMap((response, index) =>
          (response.data.projects as { id: string; name: string }[]).map(
            (project) => ({ ...project, teamName: teams[index].name })
          )
        );
        setProjects(options);
        setProjectId(options[0]?.id ?? "");
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load projects"
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void loadProjects();
    return () => {
      active = false;
    };
  }, [organizationId]);

  async function continueToTask() {
    if (!projectId) return;
    setIsLoadingColumns(true);
    setError("");
    try {
      const response = await apiRequest(`/board-columns/projects/${projectId}`);
      const projectColumns = response.data.columns as BoardColumn[];
      if (!projectColumns.length) {
        setError("This project has no board columns. Add a column from its board first.");
        return;
      }
      setColumns(projectColumns);
      setShowTaskForm(true);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load the project board"
      );
    } finally {
      setIsLoadingColumns(false);
    }
  }

  if (showTaskForm) {
    return (
      <CreateTaskModal
        projectId={projectId}
        columns={columns}
        onClose={onClose}
        onCreated={onCreated}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <section className="w-full max-w-lg rounded-(--radius-xl) bg-white p-6 shadow-(--shadow-lg)">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-(--color-accent)">
              Quick create
            </p>
            <h2 className="mt-1 font-(--font-heading) text-2xl font-bold">
              Choose a project
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close modal" className="text-2xl text-(--color-text-secondary)">
            ×
          </button>
        </header>

        {isLoading ? (
          <p className="mt-8 text-sm text-(--color-text-secondary)">Loading projects…</p>
        ) : projects.length ? (
          <div className="mt-7">
            <label htmlFor="quickTaskProject" className="mb-2 block text-sm font-semibold">
              Project
            </label>
            <select
              id="quickTaskProject"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none focus:border-(--color-accent)"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} — {project.teamName}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mt-7 rounded-(--radius-md) bg-(--color-background) p-5">
            <b>No projects yet</b>
            <p className="mt-1 text-sm text-(--color-text-secondary)">
              Create a project before adding your first task.
            </p>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-(--radius-md) border border-(--color-border) px-4 py-2 font-semibold">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void continueToTask()}
            disabled={!projectId || isLoadingColumns}
            className="rounded-(--radius-md) bg-(--color-primary) px-5 py-2 font-semibold text-white disabled:opacity-50"
          >
            {isLoadingColumns ? "Loading…" : "Continue"}
          </button>
        </div>
      </section>
    </div>
  );
}
