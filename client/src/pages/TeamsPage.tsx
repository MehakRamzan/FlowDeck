import {
  useCallback,
  useEffect,
  useState,
} from "react";

import AppLayout from "../components/layout/AppLayout";
import CreateTeamModal from "../components/ui/CreateTeamModal";

import { apiRequest } from "../lib/api";
import { useAuth } from "../context/useAuth";

type TeamMember = {
  userId: string;
  joinedAt: string;
  user?: { id: string; name: string; email: string };
};
type WorkspaceMember = { userId: string; user: { id: string; name: string; email: string } };

type Team = {
  id: string;
  name: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
};

type Project = {
  id: string;
  name: string;
  teamId: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TeamsPage() {
  const { currentOrganization } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [memberToAdd, setMemberToAdd] = useState("");
  const [projectCounts, setProjectCounts] = useState<
    Record<string, number>
  >({});

  const [isCreateTeamOpen, setIsCreateTeamOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const organizationId =
    currentOrganization?.organization.id;
  const canManage = currentOrganization?.role === "OWNER" || currentOrganization?.role === "ADMIN";

  const loadTeams = useCallback(async () => {
    if (!organizationId) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest(
        `/teams/organization/${organizationId}`
      );

      const workspaceTeams =
        response.data.teams as Team[];

      setTeams(workspaceTeams);
      if (canManage) {
        const membersResponse = await apiRequest(`/organizations/${organizationId}/members`);
        setWorkspaceMembers(membersResponse.data.members);
      }

      if (workspaceTeams.length === 0) {
        setProjectCounts({});
        return;
      }

      const projectResponses =
        await Promise.all(
          workspaceTeams.map((team) =>
            apiRequest(
              `/projects/teams/${team.id}`
            )
          )
        );

      const counts: Record<string, number> = {};

      workspaceTeams.forEach(
        (team, index) => {
          const projects =
            projectResponses[index].data
              .projects as Project[];

          counts[team.id] =
            projects.length;
        }
      );

      setProjectCounts(counts);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load teams"
      );
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, canManage]);

  async function openTeam(teamId: string) {
    try { const response = await apiRequest(`/teams/${teamId}`); setSelectedTeam(response.data.team); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to load team"); }
  }

  async function renameTeam() {
    if (!selectedTeam) return;
    const name = window.prompt("Team name", selectedTeam.name);
    if (!name) return;
    try { await apiRequest(`/teams/${selectedTeam.id}`, { method: "PATCH", body: JSON.stringify({ name }) }); await loadTeams(); await openTeam(selectedTeam.id); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to rename team"); }
  }

  async function deleteSelectedTeam() {
    if (!selectedTeam || !window.confirm(`Delete ${selectedTeam.name} and all its projects?`)) return;
    try { await apiRequest(`/teams/${selectedTeam.id}`, { method: "DELETE" }); setSelectedTeam(null); await loadTeams(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to delete team"); }
  }

  async function addMember() {
    if (!selectedTeam || !memberToAdd) return;
    try { await apiRequest(`/teams/${selectedTeam.id}/members`, { method: "POST", body: JSON.stringify({ userId: memberToAdd }) }); setMemberToAdd(""); await openTeam(selectedTeam.id); await loadTeams(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to add member"); }
  }

  async function removeMember(userId: string) {
    if (!selectedTeam || !window.confirm("Remove this member from the team?")) return;
    try { await apiRequest(`/teams/${selectedTeam.id}/members/${userId}`, { method: "DELETE" }); await openTeam(selectedTeam.id); await loadTeams(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to remove member"); }
  }

useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadTeams();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [loadTeams]);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-(--font-heading) text-3xl font-bold">
              Teams
            </h1>

            <p className="mt-2 text-(--color-text-secondary)">
              Organize members and projects into focused teams.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setIsCreateTeamOpen(true)
            }
            className="rounded-(--radius-md) bg-(--color-primary) px-4 py-3 text-sm font-semibold text-white"
          >
            + Create Team
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-(--radius-md) border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-(--color-text-secondary)">
              Loading teams...
            </p>
          </div>
        ) : teams.length === 0 ? (
          <section className="mt-8 rounded-(--radius-lg) border border-dashed border-(--color-border) bg-white px-6 py-16 text-center">
            <h2 className="font-(--font-heading) text-xl font-bold">
              No teams yet
            </h2>

            <p className="mt-2 text-sm text-(--color-text-secondary)">
              Create your first team to start organizing projects.
            </p>
          </section>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <article
                key={team.id}
                className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-(--radius-md) bg-(--color-highlight) font-semibold text-(--color-primary)">
                    {getInitials(team.name)}
                  </div>

                  <button
                    type="button"
                    onClick={() => void openTeam(team.id)}
                    className="text-xl text-(--color-text-secondary)"
                  >
                    •••
                  </button>
                </div>

                <h2 className="mt-5 font-(--font-heading) text-xl font-bold">
                  {team.name}
                </h2>

                <p className="mt-2 text-sm leading-6 text-(--color-text-secondary)">
                  Team in{" "}
                  {
                    currentOrganization
                      ?.organization.name
                  }
                </p>

                <div className="mt-6 flex gap-6 border-t border-(--color-border) pt-4 text-sm">
                  <div>
                    <p className="font-semibold">
                      {team.members.length}
                    </p>

                    <p className="text-(--color-text-secondary)">
                      Members
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      {
                        projectCounts[
                          team.id
                        ] ?? 0
                      }
                    </p>

                    <p className="text-(--color-text-secondary)">
                      Projects
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {selectedTeam && <section className="mt-8 rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-(--font-heading) text-xl font-bold">{selectedTeam.name}</h2><p className="text-sm text-(--color-text-secondary)">Team details and members</p></div><button type="button" onClick={() => setSelectedTeam(null)} className="text-sm font-semibold">Close</button></div>{canManage && <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => void renameTeam()} className="rounded-(--radius-md) border border-(--color-border) px-4 py-2 font-semibold">Rename</button><button type="button" onClick={() => void deleteSelectedTeam()} className="rounded-(--radius-md) border border-red-300 px-4 py-2 font-semibold text-red-600">Delete</button></div>}<div className="mt-6 space-y-3">{selectedTeam.members.map((member) => <div key={member.userId} className="flex items-center justify-between rounded-(--radius-md) border border-(--color-border) p-3"><div><p className="font-semibold">{member.user?.name ?? member.userId}</p><p className="text-sm text-(--color-text-secondary)">{member.user?.email}</p></div>{canManage && <button type="button" onClick={() => void removeMember(member.userId)} className="text-sm font-semibold text-red-600">Remove</button>}</div>)}</div>{canManage && <div className="mt-5 flex gap-3"><select value={memberToAdd} onChange={(event) => setMemberToAdd(event.target.value)} className="min-w-0 flex-1 rounded-(--radius-md) border border-(--color-border) px-3"><option value="">Add workspace member...</option>{workspaceMembers.filter((member) => !selectedTeam.members.some((teamMember) => teamMember.userId === member.userId)).map((member) => <option key={member.userId} value={member.userId}>{member.user.name}</option>)}</select><button type="button" onClick={() => void addMember()} className="rounded-(--radius-md) bg-(--color-primary) px-4 py-2 font-semibold text-white">Add</button></div>}</section>}

        {isCreateTeamOpen && (
          <CreateTeamModal
            onClose={() =>
              setIsCreateTeamOpen(false)
            }
            onCreated={loadTeams}
          />
        )}
      </div>
    </AppLayout>
  );
}

export default TeamsPage;
