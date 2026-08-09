import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/useAuth";
import { apiRequest } from "../lib/api";

type SettingsSection = "profile" | "workspace" | "notifications" | "security";
type Notification = { id: string; title: string; message: string; link: string | null; readAt: string | null; createdAt: string };
type Preferences = { taskAssignments: boolean; comments: boolean; inApp: boolean };
type WorkspaceMember = { userId: string; role: "OWNER" | "ADMIN" | "MEMBER"; user: { id: string; name: string; email: string } };
type Session = { id: string; userAgent: string | null; ipAddress: string | null; lastSeenAt: string; createdAt: string };

function getInitials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function SettingsPage() {
  const navigate = useNavigate();
  const { user, currentOrganization, refreshUser, refreshOrganizations, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [profileStatus, setProfileStatus] = useState({ error: "", success: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<Preferences>({ taskAssignments: true, comments: true, inApp: true });
  const [notificationError, setNotificationError] = useState("");
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [workspaceName, setWorkspaceName] = useState(currentOrganization?.organization.name ?? "");
  const [workspaceSlug, setWorkspaceSlug] = useState(currentOrganization?.organization.slug ?? "");
  const [workspacePreferences, setWorkspacePreferences] = useState({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, weekStartsOn: "monday", dateFormat: "MM/DD/YYYY" });
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [newOwnerId, setNewOwnerId] = useState("");
  const [workspaceStatus, setWorkspaceStatus] = useState({ error: "", success: "" });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [securityStatus, setSecurityStatus] = useState({ error: "", success: "" });

  useEffect(() => {
    if (activeSection !== "notifications") return;
    async function load() {
      setIsLoadingNotifications(true);
      setNotificationError("");
      try {
        const [inbox, settings] = await Promise.all([
          apiRequest("/notifications"),
          apiRequest("/notifications/preferences"),
        ]);
        setNotifications(inbox.data.notifications);
        setUnreadCount(inbox.data.unreadCount);
        setPreferences(settings.data.preferences);
      } catch (error) {
        setNotificationError(error instanceof Error ? error.message : "Unable to load notifications");
      } finally {
        setIsLoadingNotifications(false);
      }
    }
    void load();
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "workspace" || !currentOrganization) return;
    async function loadWorkspace() {
      try {
        const [workspaceResponse, memberResponse] = await Promise.all([
          apiRequest(`/organizations/${currentOrganization?.organization.id}`),
          apiRequest(`/organizations/${currentOrganization?.organization.id}/members`),
        ]);
        const organization = workspaceResponse.data.workspace.organization;
        setWorkspaceName(organization.name);
        setWorkspaceSlug(organization.slug);
        setWorkspacePreferences((current) => ({ ...current, ...(organization.preferences ?? {}) }));
        setWorkspaceMembers(memberResponse.data.members);
      } catch (error) {
        setWorkspaceStatus({ error: error instanceof Error ? error.message : "Unable to load workspace", success: "" });
      }
    }
    void loadWorkspace();
  }, [activeSection, currentOrganization]);

  useEffect(() => { if (activeSection !== "security") return; void apiRequest("/auth/sessions").then((response) => { setSessions(response.data.sessions); setCurrentSessionId(response.data.currentSessionId); }).catch((error) => setSecurityStatus({ error: error instanceof Error ? error.message : "Unable to load sessions", success: "" })); }, [activeSection]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setProfileStatus({ error: "", success: "" });
    setIsSavingProfile(true);
    try {
      await apiRequest("/auth/me", { method: "PATCH", body: JSON.stringify({ name, email, avatarUrl: avatarUrl || null }) });
      await refreshUser();
      setProfileStatus({ error: "", success: "Profile updated successfully." });
    } catch (error) {
      setProfileStatus({ error: error instanceof Error ? error.message : "Unable to update profile", success: "" });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function updatePreference(key: keyof Preferences, value: boolean) {
    const previous = preferences;
    setPreferences({ ...preferences, [key]: value });
    setIsSavingPreferences(true);
    try {
      const response = await apiRequest("/notifications/preferences", { method: "PATCH", body: JSON.stringify({ [key]: value }) });
      setPreferences(response.data.preferences);
    } catch (error) {
      setPreferences(previous);
      setNotificationError(error instanceof Error ? error.message : "Unable to save preferences");
    } finally {
      setIsSavingPreferences(false);
    }
  }

  async function markRead(id: string) {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      setNotificationError(error instanceof Error ? error.message : "Unable to update notification");
    }
  }

  async function markAllRead() {
    try {
      await apiRequest("/notifications/read-all", { method: "PATCH" });
      const readAt = new Date().toISOString();
      setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt ?? readAt })));
      setUnreadCount(0);
    } catch (error) {
      setNotificationError(error instanceof Error ? error.message : "Unable to update notifications");
    }
  }

  async function saveWorkspace(event: FormEvent) {
    event.preventDefault();
    if (!currentOrganization) return;
    setWorkspaceStatus({ error: "", success: "" });
    try {
      await apiRequest(`/organizations/${currentOrganization.organization.id}`, { method: "PATCH", body: JSON.stringify({ name: workspaceName, slug: workspaceSlug, preferences: workspacePreferences }) });
      await refreshOrganizations();
      setWorkspaceStatus({ error: "", success: "Workspace updated successfully." });
    } catch (error) { setWorkspaceStatus({ error: error instanceof Error ? error.message : "Unable to update workspace", success: "" }); }
  }

  async function transferOwnership() {
    if (!currentOrganization || !newOwnerId || !window.confirm("Transfer ownership? You will become an administrator.")) return;
    try {
      await apiRequest(`/organizations/${currentOrganization.organization.id}/transfer-ownership`, { method: "POST", body: JSON.stringify({ userId: newOwnerId }) });
      await refreshOrganizations();
      setWorkspaceStatus({ error: "", success: "Ownership transferred successfully." });
    } catch (error) { setWorkspaceStatus({ error: error instanceof Error ? error.message : "Unable to transfer ownership", success: "" }); }
  }

  async function deleteWorkspace() {
    if (!currentOrganization || !window.confirm(`Permanently delete “${workspaceName}” and all of its projects and tasks?`)) return;
    try {
      await apiRequest(`/organizations/${currentOrganization.organization.id}`, { method: "DELETE" });
      await refreshOrganizations();
      navigate("/setup-workspace");
    } catch (error) { setWorkspaceStatus({ error: error instanceof Error ? error.message : "Unable to delete workspace", success: "" }); }
  }

  async function submitPassword(event: FormEvent) { event.preventDefault(); try { const response = await apiRequest("/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }); setCurrentPassword(""); setNewPassword(""); setSecurityStatus({ error: "", success: response.message }); } catch (error) { setSecurityStatus({ error: error instanceof Error ? error.message : "Unable to change password", success: "" }); } }
  async function resendVerification() { try { const response = await apiRequest("/auth/resend-verification", { method: "POST" }); setSecurityStatus({ error: "", success: response.message }); } catch (error) { setSecurityStatus({ error: error instanceof Error ? error.message : "Unable to send verification", success: "" }); } }
  async function revokeDevice(id: string) { if (!window.confirm("Sign this device out?")) return; try { await apiRequest(`/auth/sessions/${id}`, { method: "DELETE" }); if (id === currentSessionId) { logout(); navigate("/login"); return; } setSessions((items) => items.filter((item) => item.id !== id)); } catch (error) { setSecurityStatus({ error: error instanceof Error ? error.message : "Unable to revoke session", success: "" }); } }

  const navItems: Array<[SettingsSection, string]> = [["profile", "Profile"], ["workspace", "Workspace"], ["notifications", `Notifications${unreadCount ? ` (${unreadCount})` : ""}`], ["security", "Security"]];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <header><h1 className="font-(--font-heading) text-3xl font-bold">Settings</h1><p className="mt-2 text-(--color-text-secondary)">Manage your profile and workspace preferences.</p></header>
        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
          <nav className="space-y-2">
            {navItems.map(([key, label]) => <button key={key} type="button" onClick={() => setActiveSection(key)} className={`w-full rounded-(--radius-md) px-4 py-3 text-left ${activeSection === key ? "bg-white font-semibold text-(--color-primary) shadow-(--shadow-sm)" : "text-(--color-text-secondary)"}`}>{label}</button>)}
          </nav>

          {activeSection === "profile" && <section className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)">
            <h2 className="font-(--font-heading) text-xl font-bold">Profile information</h2><p className="mt-2 text-sm text-(--color-text-secondary)">Update your FlowDeck account information.</p>
            <form onSubmit={saveProfile} className="mt-6 max-w-xl space-y-5">
              <div className="flex items-center gap-4">{avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-16 w-16 rounded-full object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--color-highlight) font-semibold text-(--color-primary)">{name ? getInitials(name) : "?"}</div>}<div><p className="font-semibold">{name || "Unknown user"}</p><p className="text-sm text-(--color-text-secondary)">{email}</p></div></div>
              <label className="block text-sm font-semibold">Full name<input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} className="mt-2 w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 font-normal outline-none focus:border-(--color-accent)" /></label>
              <label className="block text-sm font-semibold">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-2 w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 font-normal outline-none focus:border-(--color-accent)" /></label>
              <label className="block text-sm font-semibold">Avatar URL<input type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://example.com/avatar.jpg" className="mt-2 w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 font-normal outline-none focus:border-(--color-accent)" /></label>
              {profileStatus.error && <p className="text-sm text-red-600">{profileStatus.error}</p>}{profileStatus.success && <p className="text-sm text-emerald-700">{profileStatus.success}</p>}
              <button disabled={isSavingProfile} className="rounded-(--radius-md) bg-(--color-primary) px-5 py-3 font-semibold text-white disabled:opacity-60">{isSavingProfile ? "Saving..." : "Save profile"}</button>
            </form>
          </section>}

          {activeSection === "workspace" && <section className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)"><h2 className="font-(--font-heading) text-xl font-bold">Workspace management</h2><p className="mt-2 text-sm text-(--color-text-secondary)">Your role: {currentOrganization?.role ?? "—"}</p>
            <form onSubmit={saveWorkspace} className="mt-6 max-w-xl space-y-5"><label className="block text-sm font-semibold">Workspace name<input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} className="mt-2 w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 font-normal" /></label><label className="block text-sm font-semibold">Workspace slug<input value={workspaceSlug} onChange={(event) => setWorkspaceSlug(event.target.value)} className="mt-2 w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 font-normal" /></label><label className="block text-sm font-semibold">Timezone<input value={workspacePreferences.timezone} onChange={(event) => setWorkspacePreferences({ ...workspacePreferences, timezone: event.target.value })} className="mt-2 w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 font-normal" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Week starts on<select value={workspacePreferences.weekStartsOn} onChange={(event) => setWorkspacePreferences({ ...workspacePreferences, weekStartsOn: event.target.value })} className="mt-2 w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 font-normal"><option value="monday">Monday</option><option value="sunday">Sunday</option></select></label><label className="text-sm font-semibold">Date format<select value={workspacePreferences.dateFormat} onChange={(event) => setWorkspacePreferences({ ...workspacePreferences, dateFormat: event.target.value })} className="mt-2 w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 font-normal"><option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></select></label></div>{workspaceStatus.error && <p className="text-sm text-red-600">{workspaceStatus.error}</p>}{workspaceStatus.success && <p className="text-sm text-emerald-700">{workspaceStatus.success}</p>}<button className="rounded-(--radius-md) bg-(--color-primary) px-5 py-3 font-semibold text-white">Save workspace</button></form>
            {currentOrganization?.role === "OWNER" && <div className="mt-8 max-w-xl border-t border-(--color-border) pt-6"><h3 className="font-semibold">Transfer ownership</h3><div className="mt-3 flex gap-3"><select value={newOwnerId} onChange={(event) => setNewOwnerId(event.target.value)} className="min-w-0 flex-1 rounded-(--radius-md) border border-(--color-border) px-4 py-3"><option value="">Select a member</option>{workspaceMembers.filter((member) => member.userId !== user?.id).map((member) => <option key={member.userId} value={member.userId}>{member.user.name} ({member.user.email})</option>)}</select><button type="button" onClick={() => void transferOwnership()} className="rounded-(--radius-md) border border-(--color-border) px-4 font-semibold">Transfer</button></div><button type="button" onClick={() => void deleteWorkspace()} className="mt-8 rounded-(--radius-md) border border-red-300 px-5 py-3 font-semibold text-red-700">Delete workspace</button></div>}
          </section>}

          {activeSection === "notifications" && <section className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)">
            <div className="flex items-center justify-between gap-4"><div><h2 className="font-(--font-heading) text-xl font-bold">Notifications</h2><p className="mt-1 text-sm text-(--color-text-secondary)">{unreadCount} unread</p></div>{unreadCount > 0 && <button type="button" onClick={() => void markAllRead()} className="text-sm font-semibold text-(--color-accent)">Mark all as read</button>}</div>
            {notificationError && <p className="mt-4 rounded-(--radius-md) bg-red-50 p-3 text-sm text-red-700">{notificationError}</p>}
            <div className="mt-6 rounded-(--radius-md) border border-(--color-border) p-5"><h3 className="font-semibold">Preferences</h3><div className="mt-4 space-y-4">{([["inApp", "In-app notifications", "Show notifications inside FlowDeck"], ["taskAssignments", "Task assignments", "Notify me when a task is assigned to me"], ["comments", "Task comments", "Notify me about comments on my tasks"]] as const).map(([key, label, description]) => <label key={key} className="flex items-center justify-between gap-4"><span><span className="block font-medium">{label}</span><span className="text-sm text-(--color-text-secondary)">{description}</span></span><input type="checkbox" checked={preferences[key]} disabled={isSavingPreferences} onChange={(event) => void updatePreference(key, event.target.checked)} className="h-5 w-5 accent-(--color-primary)" /></label>)}</div></div>
            <div className="mt-6 space-y-3"><h3 className="font-semibold">Recent notifications</h3>{isLoadingNotifications ? <p className="py-5 text-sm text-(--color-text-secondary)">Loading notifications...</p> : notifications.length === 0 ? <p className="rounded-(--radius-md) bg-(--color-background) p-5 text-sm text-(--color-text-secondary)">You have no notifications yet.</p> : notifications.map((item) => <article key={item.id} className={`rounded-(--radius-md) border p-4 ${item.readAt ? "border-(--color-border)" : "border-(--color-accent) bg-(--color-highlight)/30"}`}><div className="flex justify-between gap-4"><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-(--color-text-secondary)">{item.message}</p><p className="mt-2 text-xs text-(--color-text-secondary)">{new Date(item.createdAt).toLocaleString()}</p></div>{!item.readAt && <button type="button" onClick={() => void markRead(item.id)} className="shrink-0 text-xs font-semibold text-(--color-accent)">Mark read</button>}</div>{item.link && <Link to={item.link} onClick={() => !item.readAt && void markRead(item.id)} className="mt-3 inline-block text-sm font-semibold text-(--color-primary)">Open item</Link>}</article>)}</div>
          </section>}

          {activeSection === "security" && <section className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)"><h2 className="font-(--font-heading) text-xl font-bold">Account security</h2>{securityStatus.error&&<p className="mt-4 text-sm text-red-600">{securityStatus.error}</p>}{securityStatus.success&&<p className="mt-4 text-sm text-emerald-700">{securityStatus.success}</p>}<div className="mt-6 rounded-(--radius-md) border border-(--color-border) p-5"><h3 className="font-semibold">Email verification</h3><p className="mt-1 text-sm text-(--color-text-secondary)">{user?.emailVerifiedAt ? "Your email is verified." : "Your email has not been verified."}</p>{!user?.emailVerifiedAt&&<button type="button" onClick={() => void resendVerification()} className="mt-3 text-sm font-semibold text-(--color-primary)">Resend verification email</button>}</div><form onSubmit={submitPassword} className="mt-6 max-w-xl space-y-4"><h3 className="font-semibold">Change password</h3><input type="password" required value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3"/><input type="password" required minLength={8} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="New password" className="w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3"/><button className="rounded-(--radius-md) bg-(--color-primary) px-5 py-3 font-semibold text-white">Change password</button></form><div className="mt-8"><h3 className="font-semibold">Active devices</h3><div className="mt-3 space-y-3">{sessions.map(session=><div key={session.id} className="flex items-center justify-between gap-4 rounded-(--radius-md) border border-(--color-border) p-4"><div><p className="font-medium">{session.userAgent || "Unknown device"}{session.id===currentSessionId?" (current)":""}</p><p className="text-xs text-(--color-text-secondary)">{session.ipAddress||"Unknown IP"} · active {new Date(session.lastSeenAt).toLocaleString()}</p></div><button type="button" onClick={()=>void revokeDevice(session.id)} className="text-sm font-semibold text-red-600">Sign out</button></div>)}</div></div><button type="button" onClick={() => { logout(); navigate("/login"); }} className="mt-8 rounded-(--radius-md) border border-red-200 px-5 py-3 font-semibold text-red-600">Sign out locally</button></section>}
        </div>
      </div>
    </AppLayout>
  );
}

export default SettingsPage;
