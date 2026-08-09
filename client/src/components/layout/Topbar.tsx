import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/useAuth";
import CreateProjectModal from "../ui/CreateProjectModal";
import CreateTeamModal from "../ui/CreateTeamModal";
import InviteMemberModal from "../ui/InviteMemberModal";
import QuickCreateTaskModal from "../ui/QuickCreateTaskModal";

type Props = { onMenuClick: () => void };
type CreateKind = "task" | "project" | "team" | "invitation";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const actions: Array<{
  kind: CreateKind;
  label: string;
  description: string;
  icon: string;
}> = [
  { kind: "task", label: "New task", description: "Add work to a project board", icon: "T" },
  { kind: "project", label: "New project", description: "Start a project for a team", icon: "P" },
  { kind: "team", label: "New team", description: "Organize people and projects", icon: "G" },
  { kind: "invitation", label: "Invite member", description: "Add someone to this workspace", icon: "M" },
];

export default function Topbar({ onMenuClick }: Props) {
  const { user, currentOrganization } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<CreateKind | null>(null);
  const canManageWorkspace =
    currentOrganization?.role === "OWNER" || currentOrganization?.role === "ADMIN";

  useEffect(() => {
    if (!isCreateOpen) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsCreateOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsCreateOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isCreateOpen]);

  const availableActions = useMemo(() => {
    const allowed = canManageWorkspace
      ? actions
      : actions.filter((action) => action.kind === "task");
    const preferred = location.pathname.startsWith("/members")
      ? "invitation"
      : location.pathname.startsWith("/teams")
        ? "team"
        : location.pathname.includes("/board") || location.pathname.startsWith("/my-tasks")
          ? "task"
          : location.pathname.startsWith("/projects")
            ? "project"
            : "task";
    return [...allowed].sort((a, b) =>
      a.kind === preferred ? -1 : b.kind === preferred ? 1 : 0
    );
  }, [canManageWorkspace, location.pathname]);

  function openCreate(kind: CreateKind) {
    setIsCreateOpen(false);
    setActiveModal(kind);
  }

  function finishCreate(path: string) {
    setActiveModal(null);
    if (location.pathname === path) navigate(0);
    else navigate(path);
  }

  return (
    <>
      <header className="app-topbar">
        <div className="topbar-left">
          <button type="button" onClick={onMenuClick} aria-label="Open navigation" className="mobile-menu">
            ☰
          </button>
          <div>
            <p>{currentOrganization?.organization.name ?? "Workspace"}</p>
            <span>Command center</span>
          </div>
        </div>

        <div className="topbar-actions">
          <div className="quick-create" ref={menuRef}>
            <button
              type="button"
              className="topbar-create"
              onClick={() => setIsCreateOpen((open) => !open)}
              aria-expanded={isCreateOpen}
            >
              <span>+</span> Create <i aria-hidden="true">⌄</i>
            </button>
            {isCreateOpen && (
              <div className="quick-create-menu">
                <div>
                  <b>Quick create</b>
                  <span>{currentOrganization?.organization.name}</span>
                </div>
                {availableActions.map((action) => (
                  <button type="button" key={action.kind} onClick={() => openCreate(action.kind)}>
                    <i>{action.icon}</i>
                    <span>
                      <b>{action.label}</b>
                      <small>{action.description}</small>
                    </span>
                    <em>→</em>
                  </button>
                ))}
                {!canManageWorkspace && (
                  <p>Admins and owners can create projects, teams, and invitations.</p>
                )}
              </div>
            )}
          </div>

          <Link to="/settings" className="topbar-bell" aria-label="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
            <i />
          </Link>
          <Link to="/settings" title={user?.name} className="topbar-profile">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" />
            ) : (
              <span>{user ? initials(user.name) : "?"}</span>
            )}
            <div>
              <b>{user?.name?.split(" ")[0] ?? "Account"}</b>
              <small>{currentOrganization?.role?.toLowerCase()}</small>
            </div>
          </Link>
        </div>
      </header>

      {activeModal === "task" && (
        <QuickCreateTaskModal
          onClose={() => setActiveModal(null)}
          onCreated={() => finishCreate("/my-tasks")}
        />
      )}
      {activeModal === "project" && (
        <CreateProjectModal
          onClose={() => setActiveModal(null)}
          onCreated={() => finishCreate("/projects")}
        />
      )}
      {activeModal === "team" && (
        <CreateTeamModal
          onClose={() => setActiveModal(null)}
          onCreated={() => finishCreate("/teams")}
        />
      )}
      {activeModal === "invitation" && (
        <InviteMemberModal
          onClose={() => setActiveModal(null)}
          onInvited={() => finishCreate("/members")}
        />
      )}
    </>
  );
}
