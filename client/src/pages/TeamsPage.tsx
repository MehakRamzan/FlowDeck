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
  const [isRenaming, setIsRenaming] = useState(false);
  const [teamNameDraft, setTeamNameDraft] = useState("");
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
    try { const response = await apiRequest(`/teams/${teamId}`); const team = response.data.team as Team; setSelectedTeam(team); setTeamNameDraft(team.name); setIsRenaming(false); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to load team"); }
  }

  function closeTeamDrawer() {
    setSelectedTeam(null);
    setIsRenaming(false);
    setTeamNameDraft("");
    setMemberToAdd("");
  }

  async function renameTeam() {
    if (!selectedTeam) return;
    const name = teamNameDraft.trim();
    if (!name) return;
    try { await apiRequest(`/teams/${selectedTeam.id}`, { method: "PATCH", body: JSON.stringify({ name }) }); await loadTeams(); await openTeam(selectedTeam.id); setIsRenaming(false); }
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

useEffect(() => {
  if (!selectedTeam) return;
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  function closeOnEscape(event: KeyboardEvent) {
    if (event.key === "Escape") closeTeamDrawer();
  }
  document.addEventListener("keydown", closeOnEscape);
  return () => {
    document.body.style.overflow = previousOverflow;
    document.removeEventListener("keydown", closeOnEscape);
  };
}, [selectedTeam]);

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

          {canManage && <button
            type="button"
            onClick={() =>
              setIsCreateTeamOpen(true)
            }
            className="rounded-(--radius-md) bg-(--color-primary) px-4 py-3 text-sm font-semibold text-white"
          >
            + Create Team
          </button>}
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
                className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm) transition duration-200 hover:-translate-y-1 hover:border-[#d8cec6] hover:shadow-(--shadow-md)"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-(--radius-md) bg-(--color-highlight) font-semibold text-(--color-primary)">
                    {getInitials(team.name)}
                  </div>

                  <button
                    type="button"
                    onClick={() => void openTeam(team.id)}
                    aria-label={`Manage ${team.name}`}
                    className="grid h-9 w-9 place-items-center rounded-(--radius-md) text-xl text-(--color-text-secondary) transition hover:bg-(--color-background) hover:text-(--color-primary)"
                  >
                    ⋯
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

        {selectedTeam && (
          <>
            <button
              type="button"
              aria-label="Close team management"
              onClick={closeTeamDrawer}
              className="fixed inset-0 z-40 bg-[#071c25]/45 backdrop-blur-[2px]"
            />
            <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-[#fbfaf8] shadow-[-24px_0_70px_rgba(7,28,37,0.22)]">
              <header className="relative overflow-hidden bg-(--color-primary) px-6 py-7 text-white sm:px-8">
                <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full border border-white/10 bg-white/5" />
                <button
                  type="button"
                  onClick={closeTeamDrawer}
                  aria-label="Close team management"
                  title="Close"
                  className="absolute right-5 top-5 z-20 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/10 text-xl transition hover:rotate-90 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  ×
                </button>
                <div className="relative flex items-center gap-4 pr-12">
                  <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-(--color-highlight) font-(--font-heading) text-lg font-bold text-(--color-primary)">
                    {getInitials(selectedTeam.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/50">Team workspace</p>
                    <h2 className="mt-1 truncate font-(--font-heading) text-2xl font-bold">{selectedTeam.name}</h2>
                    <p className="mt-1 text-sm text-white/60">{currentOrganization?.organization.name}</p>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-(--radius-md) border border-(--color-border) bg-white p-4">
                    <strong className="font-(--font-heading) text-2xl">{selectedTeam.members.length}</strong>
                    <p className="mt-1 text-xs text-(--color-text-secondary)">Team members</p>
                  </div>
                  <div className="rounded-(--radius-md) border border-(--color-border) bg-white p-4">
                    <strong className="font-(--font-heading) text-2xl">{projectCounts[selectedTeam.id] ?? 0}</strong>
                    <p className="mt-1 text-xs text-(--color-text-secondary)">Active projects</p>
                  </div>
                </div>

                {canManage && (
                  <section className="mt-6 rounded-(--radius-lg) border border-(--color-border) bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div><h3 className="font-semibold">Team settings</h3><p className="mt-1 text-xs text-(--color-text-secondary)">Update this team’s identity or remove it.</p></div>
                      {!isRenaming && (
                        <button type="button" onClick={() => setIsRenaming(true)} className="rounded-(--radius-md) border border-(--color-border) px-3 py-2 text-sm font-semibold hover:bg-(--color-background)">
                          Rename
                        </button>
                      )}
                    </div>
                    {isRenaming && (
                      <div className="mt-4 flex gap-2">
                        <input autoFocus value={teamNameDraft} onChange={(event) => setTeamNameDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void renameTeam(); }} className="min-w-0 flex-1 rounded-(--radius-md) border border-(--color-border) px-3 py-2 outline-none focus:border-(--color-accent)" />
                        <button type="button" onClick={() => void renameTeam()} className="rounded-(--radius-md) bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white">Save</button>
                        <button type="button" onClick={() => { setIsRenaming(false); setTeamNameDraft(selectedTeam.name); }} className="rounded-(--radius-md) px-3 py-2 text-sm font-semibold">Cancel</button>
                      </div>
                    )}
                  </section>
                )}

                <section className="mt-7">
                  <div className="flex items-end justify-between">
                    <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-(--color-accent)">People</p><h3 className="mt-1 font-(--font-heading) text-xl font-bold">Team members</h3></div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-(--color-text-secondary)">{selectedTeam.members.length} total</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {selectedTeam.members.map((member) => {
                      const name = member.user?.name ?? "Team member";
                      return (
                        <div key={member.userId} className="group flex items-center gap-3 rounded-(--radius-md) border border-(--color-border) bg-white p-3 transition hover:border-[#d9cec5] hover:shadow-(--shadow-sm)">
                          <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#f1d2c5] text-xs font-bold text-(--color-primary)">{getInitials(name)}</span>
                          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{name}</p><p className="mt-0.5 truncate text-xs text-(--color-text-secondary)">{member.user?.email}</p></div>
                          {canManage && <button type="button" onClick={() => void removeMember(member.userId)} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 opacity-70 transition hover:bg-red-50 hover:opacity-100">Remove</button>}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {canManage && (
                  <section className="mt-7 rounded-(--radius-lg) border border-dashed border-[#d7ccc4] bg-white/60 p-5">
                    <h3 className="font-semibold">Add a workspace member</h3>
                    <p className="mt-1 text-xs text-(--color-text-secondary)">Give an existing workspace member access to this team.</p>
                    <div className="mt-4 flex gap-2">
                      <select value={memberToAdd} onChange={(event) => setMemberToAdd(event.target.value)} className="min-w-0 flex-1 rounded-(--radius-md) border border-(--color-border) bg-white px-3 py-2 text-sm outline-none focus:border-(--color-accent)">
                        <option value="">Select workspace member…</option>
                        {workspaceMembers.filter((member) => !selectedTeam.members.some((teamMember) => teamMember.userId === member.userId)).map((member) => <option key={member.userId} value={member.userId}>{member.user.name}</option>)}
                      </select>
                      <button type="button" disabled={!memberToAdd} onClick={() => void addMember()} className="rounded-(--radius-md) bg-(--color-primary) px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">Add</button>
                    </div>
                  </section>
                )}
              </div>

              {canManage && (
                <footer className="border-t border-(--color-border) bg-white px-6 py-4 sm:px-8">
                  <button type="button" onClick={() => void deleteSelectedTeam()} className="text-sm font-semibold text-red-600 hover:text-red-700">
                    Delete this team
                  </button>
                </footer>
              )}
            </aside>
          </>
        )}

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
