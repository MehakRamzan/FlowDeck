import { NavLink } from "react-router";

const navigationItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "My Tasks", path: "/my-tasks" },
  { label: "Teams", path: "/teams" },
  { label: "Projects", path: "/projects" },
  { label: "Members", path: "/members" },
  { label: "Settings", path: "/settings" },
  
];

type SidebarProps = {
  isMobileOpen: boolean;
  onClose: () => void;
};

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="font-(--font-heading) text-2xl font-bold">FlowDeck</div>

      <nav className="mt-10 space-y-2">
        {navigationItems.map((item) => {
          if (!item.path) {
            return (
              <span
                key={item.label}
                className="block cursor-not-allowed rounded-(--radius-md) px-4 py-3 text-white/40"
              >
                {item.label}
              </span>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={onNavigate}
              className={({ isActive }) =>
                `block rounded-(--radius-md) px-4 py-3 transition ${
                  isActive
                    ? "bg-white/10 font-semibold text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/15 pt-5 text-sm text-white/70">
        Acme Workspace
      </div>
    </>
  );
}

function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col bg-(--color-primary) p-6 text-white lg:flex">
        <SidebarContent />
      </aside>

      {isMobileOpen && (
        <>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          />

          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-(--color-primary) p-6 text-white lg:hidden">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 text-2xl text-white/70"
            >
              ×
            </button>

            <SidebarContent onNavigate={onClose} />
          </aside>
        </>
      )}
    </>
  );
}

export default Sidebar;