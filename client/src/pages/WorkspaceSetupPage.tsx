import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/useAuth";

function WorkspaceSetupPage() {
  const navigate = useNavigate();

  const { refreshOrganizations, selectOrganization } = useAuth();

  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await apiRequest("/organizations", {
        method: "POST",
        body: JSON.stringify({
          name: workspaceName,
          slug: workspaceSlug,
        }),
      });

      const createdId = response.data.organization.id as string;
      selectOrganization(createdId);
      await refreshOrganizations();

      navigate("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create workspace"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--color-background) px-6 py-12">
      <section className="w-full max-w-xl">
        <header className="mb-10 flex items-center justify-between">
          <div className="font-(--font-heading) text-2xl font-bold text-(--color-primary)">
            FlowDeck
          </div>

          <span className="text-sm text-(--color-text-secondary)">
            Workspace setup
          </span>
        </header>

        <div className="rounded-(--radius-xl) border border-(--color-border) bg-white p-8 shadow-(--shadow-md)">
          <h1 className="font-(--font-heading) text-4xl font-bold text-(--color-text-primary)">
            Create your workspace
          </h1>

          <p className="mt-3 text-(--color-text-secondary)">
            Set up a shared space for your team, projects and tasks.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="workspaceName"
                className="mb-2 block text-sm font-semibold"
              >
                Workspace name
              </label>

              <input
                id="workspaceName"
                name="workspaceName"
                type="text"
                placeholder="Acme Creative Agency"
                value={workspaceName}
                onChange={(event) =>
                  setWorkspaceName(event.target.value)
                }
                required
                className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none transition focus:border-(--color-accent) focus:ring-3 focus:ring-(--color-accent)/15"
              />
            </div>

            <div>
              <label
                htmlFor="workspaceSlug"
                className="mb-2 block text-sm font-semibold"
              >
                Workspace URL
              </label>

              <div className="flex overflow-hidden rounded-(--radius-md) border border-(--color-border) bg-white focus-within:border-(--color-accent) focus-within:ring-3 focus-within:ring-(--color-accent)/15">
                <span className="flex items-center bg-(--color-background) px-4 text-sm text-(--color-text-secondary)">
                  flowdeck.app/
                </span>

                <input
                  id="workspaceSlug"
                  name="workspaceSlug"
                  type="text"
                  placeholder="acme-creative"
                  value={workspaceSlug}
                  onChange={(event) =>
                    setWorkspaceSlug(
                      event.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                    )
                  }
                  required
                  className="min-w-0 flex-1 px-4 py-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="teamSize"
                className="mb-2 block text-sm font-semibold"
              >
                Team size
              </label>

              <select
                id="teamSize"
                name="teamSize"
                value={teamSize}
                onChange={(event) =>
                  setTeamSize(event.target.value)
                }
                className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none focus:border-(--color-accent)"
              >
                <option value="" disabled>
                  Select your team size
                </option>

                <option value="1">
                  Just me
                </option>

                <option value="2-5">
                  2–5 people
                </option>

                <option value="6-15">
                  6–15 people
                </option>

                <option value="16-50">
                  16–50 people
                </option>

                <option value="50+">
                  More than 50
                </option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-(--radius-md) bg-(--color-primary) px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? "Creating workspace..."
                : "Create workspace"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default WorkspaceSetupPage;
