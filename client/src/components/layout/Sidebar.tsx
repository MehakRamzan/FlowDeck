import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/useAuth";

const items = [
  ["Dashboard", "/dashboard", "D"],
  ["My Tasks", "/my-tasks", "T"],
  ["Teams", "/teams", "G"],
  ["Projects", "/projects", "P"],
  ["Members", "/members", "M"],
  ["Settings", "/settings", "S"],
] as const;

function roleLabel(role?: string) {
  if (!role) return "Member";
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function Content({ close }: { close?: () => void }) {
  const {
    organizations,
    currentOrganization,
    selectOrganization,
    logout,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState("");

  useEffect(() => {
    if (!isWorkspaceMenuOpen) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsWorkspaceMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [isWorkspaceMenuOpen]);

  const filteredWorkspaces = organizations.filter((workspace) =>
    workspace.organization.name
      .toLowerCase()
      .includes(workspaceSearch.trim().toLowerCase())
  );

  function go(path: string) {
    setIsWorkspaceMenuOpen(false);
    close?.();
    navigate(path);
  }

  function switchWorkspace(organizationId: string) {
    if (organizationId === currentOrganization?.organization.id) {
      setIsWorkspaceMenuOpen(false);
      return;
    }
    selectOrganization(organizationId);
    setIsWorkspaceMenuOpen(false);
    close?.();
    const isWorkspaceSpecificRecord = /^\/projects\/[^/]+\/board/.test(
      location.pathname
    );
    navigate(isWorkspaceSpecificRecord ? "/dashboard" : location.pathname);
  }

  function signOut() {
    logout();
    close?.();
    navigate("/login");
  }

  return (
    <>
      <div className="app-brand">
        <span>F</span>
        <div>
          FlowDeck<small>WORK STUDIO</small>
        </div>
      </div>

      <div className="sidebar-label">Workspace</div>
      <nav className="app-nav">
        {items.map(([label, path, icon]) => (
          <NavLink
            key={path}
            to={path}
            onClick={close}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i>{icon}</i>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="workspace-switcher" ref={menuRef}>
        {isWorkspaceMenuOpen && (
          <div className="workspace-popover">
            <div className="workspace-popover-header">
              <b>Switch workspace</b>
              <span>{organizations.length} available</span>
            </div>
            {organizations.length > 4 && (
              <input
                autoFocus
                value={workspaceSearch}
                onChange={(event) => setWorkspaceSearch(event.target.value)}
                placeholder="Search workspaces..."
                aria-label="Search workspaces"
              />
            )}
            <div className="workspace-list">
              {filteredWorkspaces.map((workspace) => {
                const active =
                  workspace.organization.id ===
                  currentOrganization?.organization.id;
                return (
                  <button
                    type="button"
                    key={workspace.organization.id}
                    onClick={() => switchWorkspace(workspace.organization.id)}
                    className={active ? "active" : ""}
                  >
                    <span>{workspace.organization.name.slice(0, 1).toUpperCase()}</span>
                    <div>
                      <b>{workspace.organization.name}</b>
                      <small>{roleLabel(workspace.role)}</small>
                    </div>
                    {active && <i aria-label="Active workspace">✓</i>}
                  </button>
                );
              })}
            </div>
            <div className="workspace-menu-actions">
              <button type="button" onClick={() => go("/setup-workspace?new=1")}>
                <span>+</span> Create workspace
              </button>
              <button type="button" onClick={() => go("/members")}>
                <span>✉</span> View invitations
              </button>
              <button type="button" onClick={() => go("/settings")}>
                <span>⚙</span> Workspace settings
              </button>
              <button type="button" className="sign-out" onClick={signOut}>
                <span>↗</span> Sign out
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          className="sidebar-workspace"
          onClick={() => setIsWorkspaceMenuOpen((open) => !open)}
          aria-expanded={isWorkspaceMenuOpen}
          aria-label="Open workspace switcher"
        >
          <span>
            {currentOrganization?.organization.name?.slice(0, 1).toUpperCase() ?? "W"}
          </span>
          <div>
            <b>{currentOrganization?.organization.name ?? "Workspace"}</b>
            <small>{roleLabel(currentOrganization?.role)}</small>
          </div>
          <i aria-hidden="true">•••</i>
        </button>
      </div>
    </>
  );
}

export default function Sidebar({
  isMobileOpen,
  onClose,
}: {
  isMobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <aside className="app-sidebar desktop-sidebar">
        <Content />
      </aside>
      {isMobileOpen && (
        <>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="sidebar-overlay"
          />
          <aside className="app-sidebar mobile-sidebar">
            <button type="button" onClick={onClose} className="sidebar-close">
              ×
            </button>
            <Content close={onClose} />
          </aside>
        </>
      )}
    </>
  );
}
