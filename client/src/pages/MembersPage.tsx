import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router";

import AppLayout from "../components/layout/AppLayout";
import InviteMemberModal from "../components/ui/InviteMemberModal";

import { apiRequest } from "../lib/api";
import { useAuth } from "../context/useAuth";

type Member = {
  id: string;
  organizationId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;

  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
};
type Invitation = { id: string; email: string; role: "ADMIN" | "MEMBER"; expiresAt: string; createdAt: string };

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatRole(role: Member["role"]) {
  if (role === "OWNER") {
    return "Owner";
  }

  if (role === "ADMIN") {
    return "Admin";
  }

  return "Member";
}

function MembersPage() {
  const { currentOrganization } = useAuth();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] =
    useState("all");

  const [isInviteModalOpen, setIsInviteModalOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [activeMemberMenuId, setActiveMemberMenuId] = useState<string | null>(null);

  const organizationId =
    currentOrganization?.organization.id;
  const canManage = currentOrganization?.role === "OWNER" || currentOrganization?.role === "ADMIN";

  const loadMembers = useCallback(async () => {
    if (!organizationId) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest(
        `/organizations/${organizationId}/members`
      );

      setMembers(
        response.data.members as Member[]
      );
      if (canManage) {
        const invitationResponse = await apiRequest(`/invitations/organization/${organizationId}`);
        setInvitations(invitationResponse.data.invitations);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load workspace members"
      );
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, canManage]);

  async function changeRole(member: Member, role: "ADMIN" | "MEMBER") {
    if (!organizationId) return;
    setActiveMemberMenuId(null);
    try { await apiRequest(`/organizations/${organizationId}/members/${member.userId}`, { method: "PATCH", body: JSON.stringify({ role }) }); await loadMembers(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to change role"); }
  }

  async function removeMember(member: Member) {
    if (!organizationId || !window.confirm(`Remove ${member.user.name} from this workspace?`)) return;
    setActiveMemberMenuId(null);
    try { await apiRequest(`/organizations/${organizationId}/members/${member.userId}`, { method: "DELETE" }); await loadMembers(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to remove member"); }
  }

  async function invitationAction(invitation: Invitation, action: "resend" | "revoke") {
    if (action === "revoke" && !window.confirm(`Revoke the invitation for ${invitation.email}?`)) return;
    try { await apiRequest(`/invitations/${invitation.id}${action === "resend" ? "/resend" : ""}`, { method: action === "resend" ? "POST" : "DELETE" }); await loadMembers(); }
    catch (error) { setError(error instanceof Error ? error.message : `Unable to ${action} invitation`); }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMembers();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadMembers]);

  useEffect(() => {
    function closeMemberMenu(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest("[data-member-menu]")) {
        setActiveMemberMenuId(null);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveMemberMenuId(null);
    }
    document.addEventListener("mousedown", closeMemberMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMemberMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const filteredMembers = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        member.user.name
          .toLowerCase()
          .includes(searchValue) ||
        member.user.email
          .toLowerCase()
          .includes(searchValue);

      const matchesRole =
        selectedRole === "all" ||
        member.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [members, search, selectedRole]);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-(--font-heading) text-3xl font-bold">
              Members
            </h1>

            <p className="mt-2 text-(--color-text-secondary)">
              Manage people and access in your workspace.
            </p>
          </div>

          {canManage && <button
            type="button"
            onClick={() =>
              setIsInviteModalOpen(true)
            }
            className="rounded-(--radius-md) bg-(--color-primary) px-4 py-3 text-sm font-semibold text-white"
          >
            + Invite Member
          </button>}
        </header>

        {error && (
          <div className="mt-6 rounded-(--radius-md) border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <input
            type="search"
            placeholder="Search members..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none focus:border-(--color-accent) sm:max-w-sm"
          />

          <select
            value={selectedRole}
            onChange={(event) =>
              setSelectedRole(
                event.target.value
              )
            }
            className="rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none"
          >
            <option value="all">
              All roles
            </option>

            <option value="OWNER">
              Owner
            </option>

            <option value="ADMIN">
              Admin
            </option>

            <option value="MEMBER">
              Member
            </option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-(--color-text-secondary)">
              Loading members...
            </p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <section className="mt-6 rounded-(--radius-lg) border border-dashed border-(--color-border) bg-white px-6 py-14 text-center">
            <h2 className="font-(--font-heading) text-xl font-bold">
              No members found
            </h2>

            <p className="mt-2 text-sm text-(--color-text-secondary)">
              No workspace members match your current filters.
            </p>
          </section>
        ) : (
          <section className="mt-6 overflow-visible rounded-(--radius-lg) border border-(--color-border) bg-white shadow-(--shadow-sm)">
            <div className="hidden grid-cols-[2fr_2fr_1fr_auto] gap-4 border-b border-(--color-border) px-6 py-4 text-sm font-semibold text-(--color-text-secondary) md:grid">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Actions</span>
            </div>

            {filteredMembers.map((member) => (
              <article
                key={member.id}
                className="grid gap-4 border-b border-(--color-border) p-5 last:border-b-0 md:grid-cols-[2fr_2fr_1fr_auto] md:items-center md:px-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-highlight) text-sm font-semibold text-(--color-primary)">
                    {getInitials(
                      member.user.name
                    )}
                  </span>

                  <span className="font-semibold">
                    {member.user.name}
                  </span>
                </div>

                <span className="text-sm text-(--color-text-secondary)">
                  {member.user.email}
                </span>

                <span className="w-fit rounded-full bg-(--color-background) px-3 py-1 text-sm font-medium">
                  {formatRole(member.role)}
                </span>

                <div className="relative w-fit" data-member-menu>
                  <button
                    type="button"
                    onClick={() => setActiveMemberMenuId((current) => current === member.id ? null : member.id)}
                    aria-label={`Actions for ${member.user.name}`}
                    aria-expanded={activeMemberMenuId === member.id}
                    className="grid h-9 w-9 place-items-center rounded-(--radius-md) text-xl text-(--color-text-secondary) transition hover:bg-(--color-background) hover:text-(--color-primary)"
                  >
                    ⋯
                  </button>

                  {activeMemberMenuId === member.id && (
                    <div className="absolute right-0 top-11 z-30 w-56 rounded-(--radius-md) border border-(--color-border) bg-white p-2 shadow-(--shadow-lg)">
                      {!canManage ? (
                        <p className="px-3 py-2 text-xs leading-5 text-(--color-text-secondary)">
                          Only workspace owners and admins can manage members.
                        </p>
                      ) : member.role === "OWNER" ? (
                        <>
                          <div className="px-3 py-2">
                            <b className="text-sm">Workspace owner</b>
                            <p className="mt-1 text-xs leading-5 text-(--color-text-secondary)">
                              Transfer ownership before changing or removing this member.
                            </p>
                          </div>
                          {currentOrganization?.role === "OWNER" && (
                            <button
                              type="button"
                              onClick={() => { setActiveMemberMenuId(null); navigate("/settings"); }}
                              className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-(--color-background)"
                            >
                              Manage ownership
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-(--color-text-secondary)">
                            Change role
                          </p>
                          <button
                            type="button"
                            disabled={member.role === "ADMIN"}
                            onClick={() => void changeRole(member, "ADMIN")}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-(--color-background) disabled:cursor-default disabled:font-semibold"
                          >
                            Admin {member.role === "ADMIN" && <span>✓</span>}
                          </button>
                          <button
                            type="button"
                            disabled={member.role === "MEMBER"}
                            onClick={() => void changeRole(member, "MEMBER")}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-(--color-background) disabled:cursor-default disabled:font-semibold"
                          >
                            Member {member.role === "MEMBER" && <span>✓</span>}
                          </button>
                          <div className="my-1 border-t border-(--color-border)" />
                          <button
                            type="button"
                            onClick={() => void removeMember(member)}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                          >
                            Remove from workspace
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        {canManage && <section className="mt-8 rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)"><h2 className="font-(--font-heading) text-xl font-bold">Pending invitations</h2>{invitations.length === 0 ? <p className="mt-4 text-sm text-(--color-text-secondary)">No pending invitations.</p> : <div className="mt-4 space-y-3">{invitations.map((invitation) => <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 rounded-(--radius-md) border border-(--color-border) p-4"><div><p className="font-semibold">{invitation.email}</p><p className="text-sm text-(--color-text-secondary)">{invitation.role} · expires {new Date(invitation.expiresAt).toLocaleDateString()}</p></div><div className="flex gap-3"><button type="button" onClick={() => void invitationAction(invitation, "resend")} className="text-sm font-semibold text-(--color-primary)">Resend</button><button type="button" onClick={() => void invitationAction(invitation, "revoke")} className="text-sm font-semibold text-red-600">Revoke</button></div></div>)}</div>}</section>}

        {isInviteModalOpen && (
          <InviteMemberModal
            onClose={() =>
              setIsInviteModalOpen(false)
            }
            onInvited={loadMembers}
          />
        )}
      </div>
    </AppLayout>
  );
}

export default MembersPage;
