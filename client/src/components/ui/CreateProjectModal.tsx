import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/useAuth";

type Team = {
  id: string;
  name: string;
  organizationId: string;
};

type CreateProjectModalProps = {
  onClose: () => void;
  onCreated?: () => void;
};

function CreateProjectModal({
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const { currentOrganization } = useAuth();

  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [description, setDescription] = useState("");

  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const organizationId =
    currentOrganization?.organization.id;

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    async function loadTeams() {
      setIsLoadingTeams(true);
      setError("");

      try {
        const response = await apiRequest(
          `/teams/organization/${organizationId}`
        );

        const workspaceTeams =
          response.data.teams as Team[];

        setTeams(workspaceTeams);

        if (workspaceTeams.length > 0) {
          setTeamId(workspaceTeams[0].id);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load teams"
        );
      } finally {
        setIsLoadingTeams(false);
      }
    }

    void loadTeams();
  }, [organizationId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!teamId) {
      setError(
        "Create a team before creating a project."
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await apiRequest(
        `/projects/teams/${teamId}`,
        {
          method: "POST",
          body: JSON.stringify({
            name,
            description:
              description.trim() || undefined,
          }),
        }
      );

      onCreated?.();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create project"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <section className="w-full max-w-lg rounded-(--radius-xl) bg-white p-6 shadow-(--shadow-lg)">
        <header className="flex items-center justify-between">
          <h2 className="font-(--font-heading) text-2xl font-bold">
            Create project
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-2xl text-(--color-text-secondary)"
          >
            ×
          </button>
        </header>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Create a project and assign it to one of your teams.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="projectName"
              className="mb-2 block text-sm font-semibold"
            >
              Project name
            </label>

            <input
              id="projectName"
              type="text"
              placeholder="Website Redesign"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              className="w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none focus:border-(--color-accent)"
            />
          </div>

          <div>
            <label
              htmlFor="projectTeam"
              className="mb-2 block text-sm font-semibold"
            >
              Team
            </label>

            <select
              id="projectTeam"
              value={teamId}
              onChange={(event) =>
                setTeamId(event.target.value)
              }
              disabled={
                isLoadingTeams ||
                teams.length === 0
              }
              className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none focus:border-(--color-accent) disabled:opacity-60"
            >
              {isLoadingTeams ? (
                <option value="">
                  Loading teams...
                </option>
              ) : teams.length === 0 ? (
                <option value="">
                  No teams available
                </option>
              ) : (
                teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                  >
                    {team.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="projectDescription"
              className="mb-2 block text-sm font-semibold"
            >
              Description
            </label>

            <textarea
              id="projectDescription"
              placeholder="Describe the project..."
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              className="min-h-24 w-full resize-none rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none focus:border-(--color-accent)"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-(--radius-md) border border-(--color-border) px-4 py-2 font-semibold disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingTeams ||
                teams.length === 0
              }
              className="rounded-(--radius-md) bg-(--color-primary) px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Creating..."
                : "Create project"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CreateProjectModal;