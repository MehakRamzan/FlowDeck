import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/useAuth";

type InvitationPreview = {
  exists: boolean;
  valid: boolean;
  accepted: boolean;
  expired: boolean;
  email?: string;
  role?: string;
  organizationName?: string;
  organizationId?: string;
  invitedByName?: string;
  invitedByEmail?: string;
  errorCode?: "NOT_FOUND" | "EXPIRED" | "ALREADY_ACCEPTED" | "UNKNOWN";
};

async function fetchInvitationPreview(
  token: string
): Promise<InvitationPreview> {
  try {
    const res = await fetch(
      `http://localhost:5000/api/invitations/preview/${token}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const json = await res.json();

    if (!res.ok) {
      return {
        exists: false,
        valid: false,
        accepted: false,
        expired: false,
        errorCode: (json.code as InvitationPreview["errorCode"]) || "UNKNOWN",
      };
    }

    return {
      exists: true,
      valid: !!json.data?.valid,
      accepted: !!json.data?.accepted,
      expired: !!json.data?.expired,
      email: json.data?.email,
      role: json.data?.role,
      organizationName: json.data?.organizationName,
      organizationId: json.data?.organizationId,
      invitedByName: json.data?.invitedByName,
      invitedByEmail: json.data?.invitedByEmail,
    };
  } catch (err) {
    console.error("Failed to preview invitation:", err);
    return {
      exists: false,
      valid: false,
      accepted: false,
      expired: false,
      errorCode: "UNKNOWN",
    };
  }
}

type ViewState =
  | { kind: "loading" }
  | { kind: "invalid"; preview: InvitationPreview }
  | { kind: "requires-auth"; preview: InvitationPreview }
  | { kind: "email-mismatch"; preview: InvitationPreview; loggedInEmail: string }
  | { kind: "ready"; preview: InvitationPreview }
  | { kind: "accepting"; preview: InvitationPreview }
  | { kind: "accepted" };

function InvitationAcceptPage() {
  const { token = "" } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, refreshUser, refreshOrganizations } =
    useAuth();

  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [acceptError, setAcceptError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token) {
        if (!cancelled) {
          setState({
            kind: "invalid",
            preview: {
              exists: false,
              valid: false,
              accepted: false,
              expired: false,
              errorCode: "NOT_FOUND",
            },
          });
        }
        return;
      }

      const preview = await fetchInvitationPreview(token);

      if (cancelled) return;

      if (
        preview.errorCode === "NOT_FOUND" ||
        preview.errorCode === "EXPIRED" ||
        preview.errorCode === "ALREADY_ACCEPTED" ||
        preview.expired ||
        preview.accepted
      ) {
        setState({ kind: "invalid", preview });
        return;
      }

      if (!preview.exists || !preview.valid) {
        setState({ kind: "invalid", preview });
        return;
      }

      if (authLoading) {
        return;
      }

      if (!user) {
        setState({ kind: "requires-auth", preview });
        return;
      }

      if (
        preview.email &&
        user.email.toLowerCase() !== preview.email.toLowerCase()
      ) {
        setState({ kind: "email-mismatch", preview, loggedInEmail: user.email });
        return;
      }

      setState({ kind: "ready", preview });
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [token, user, authLoading]);

  async function handleAccept(_evt: FormEvent) {
    _evt.preventDefault();

    if (state.kind !== "ready") return;

    const preview = state.preview;

    setAcceptError("");
    setState({ kind: "accepting", preview });

    try {
      await apiRequest("/invitations/accept", {
        method: "POST",
        body: JSON.stringify({ token }),
      });

      await Promise.all([refreshUser(), refreshOrganizations()]);

      setState({ kind: "accepted" });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to accept invitation";
      setAcceptError(msg);
      setState({ kind: "ready", preview });
    }
  }

  function goLoginWithReturn() {
    const returnTo = encodeURIComponent(`/accept-invitation/${token}`);
    navigate(`/login?next=${returnTo}`);
  }

  function goRegisterWithReturn() {
    const returnTo = encodeURIComponent(`/accept-invitation/${token}`);
    navigate(`/register?next=${returnTo}`);
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-(--color-primary) p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="font-(--font-heading) text-2xl font-bold">
          FlowDeck
        </div>

        <div className="max-w-2xl">
          <h1 className="font-(--font-heading) text-5xl leading-[1.05] font-bold xl:text-6xl">
            Join your team on FlowDeck.
          </h1>

          <p className="mt-6 max-w-lg text-lg text-white/75">
            Accept the invitation to start collaborating on projects, tasks,
            and shared boards with your teammates.
          </p>
        </div>

        <p className="text-sm text-white/60">
          Organize. Collaborate. Deliver.
        </p>
      </section>

      <section className="flex items-center justify-center bg-(--color-background) px-10 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-10 font-(--font-heading) text-2xl font-bold text-(--color-primary) lg:hidden">
            FlowDeck
          </div>

          {state.kind === "loading" && <LoadingPanel />}

          {state.kind === "invalid" && (
            <InvalidInvitationPanel preview={state.preview} />
          )}

          {state.kind === "requires-auth" && (
            <RequiresAuthPanel
              preview={state.preview}
              onLogin={goLoginWithReturn}
              onRegister={goRegisterWithReturn}
            />
          )}

          {state.kind === "email-mismatch" && (
            <EmailMismatchPanel
              preview={state.preview}
              loggedInEmail={state.loggedInEmail}
              onLogout={async () => {
                localStorage.removeItem("flowdeck_token");
                try {
                  await refreshUser();
                } catch {
                  /* ignore */
                }
                goLoginWithReturn();
              }}
            />
          )}

          {state.kind === "ready" && (
            <AcceptPanel
              preview={state.preview}
              onAccept={handleAccept}
              error={acceptError}
              isSubmitting={false}
            />
          )}

          {state.kind === "accepting" && (
            <AcceptPanel
              preview={state.preview}
              onAccept={handleAccept}
              error={acceptError}
              isSubmitting={true}
            />
          )}

          {state.kind === "accepted" && <AcceptedPanel />}
        </div>
      </section>
    </main>
  );
}

function LoadingPanel() {
  return (
    <div className="space-y-6">
      <SkeletonLine className="h-8 w-3/4" />
      <SkeletonLine className="h-5 w-1/2" />
      <SkeletonLine className="h-32 w-full rounded-(--radius-lg)" />
      <SkeletonLine className="h-12 w-full rounded-(--radius-md)" />
    </div>
  );
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-(--color-surface-soft) ${className}`}
    />
  );
}

function InvalidInvitationPanel({
  preview,
}: {
  preview: InvitationPreview;
}) {
  const isExpired = preview.expired || preview.errorCode === "EXPIRED";
  const isAccepted = preview.accepted || preview.errorCode === "ALREADY_ACCEPTED";
  const isNotFound = !preview.exists || preview.errorCode === "NOT_FOUND";

  let title = "Invitation not available";
  let description =
    "This invitation link is not valid. It may have been removed.";

  if (isExpired) {
    title = "This invitation has expired";
    description =
      "Invitations are valid for 7 days. Please ask the workspace owner to send a new invitation.";
  } else if (isAccepted) {
    title = "This invitation has already been accepted";
    description =
      "You're all set. Sign in to your account to access the workspace.";
  } else if (isNotFound) {
    title = "Invitation not found";
    description =
      "We couldn't find this invitation. It may have been cancelled or the link was copied incorrectly.";
  }

  return (
    <div>
      <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <h2 className="mt-6 font-(--font-heading) text-4xl font-bold text-(--color-text-primary)">
        {title}
      </h2>

      <p className="mt-3 text-(--color-text-secondary)">{description}</p>

      <div className="mt-10 space-y-3">
        <Link
          to="/login"
          className="flex w-full items-center justify-center rounded-(--radius-md) bg-(--color-primary) px-4 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Sign in to FlowDeck
        </Link>

        <Link
          to="/"
          className="flex w-full items-center justify-center rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 font-semibold text-(--color-text-primary) transition hover:bg-(--color-surface-soft)"
        >
          Go to home
        </Link>
      </div>
    </div>
  );
}

function RequiresAuthPanel({
  preview,
  onLogin,
  onRegister,
}: {
  preview: InvitationPreview;
  onLogin: () => void;
  onRegister: () => void;
}) {
  return (
    <div>
      <InvitationHeader preview={preview} />

      <h2 className="mt-6 font-(--font-heading) text-4xl font-bold text-(--color-text-primary)">
        Almost there.
      </h2>

      <p className="mt-3 text-(--color-text-secondary)">
        Sign in to your existing account, or create a new one, to accept this
        invitation and join{" "}
        <strong className="text-(--color-text-primary)">
          {preview.organizationName || "the workspace"}
        </strong>
        .
      </p>

      {preview.email && (
        <div className="mt-6 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface-soft) px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
            Invitation sent to
          </p>
          <p className="mt-1 font-semibold text-(--color-text-primary)">
            {preview.email}
          </p>
        </div>
      )}

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={onLogin}
          className="w-full rounded-(--radius-md) bg-(--color-primary) px-4 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Sign in to accept
        </button>

        <button
          type="button"
          onClick={onRegister}
          className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 font-semibold text-(--color-text-primary) transition hover:bg-(--color-surface-soft)"
        >
          Create a new account
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-(--color-text-muted)">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onLogin}
          className="font-semibold text-(--color-primary) hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

function EmailMismatchPanel({
  preview,
  loggedInEmail,
  onLogout,
}: {
  preview: InvitationPreview;
  loggedInEmail: string;
  onLogout: () => void;
}) {
  return (
    <div>
      <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
          <polyline points="3 7 12 13 21 7" />
        </svg>
      </div>

      <h2 className="mt-6 font-(--font-heading) text-4xl font-bold text-(--color-text-primary)">
        Email mismatch
      </h2>

      <p className="mt-3 text-(--color-text-secondary)">
        This invitation was sent to a different email address than the one
        you&apos;re currently signed in with.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-(--radius-lg) border border-dashed border-red-200 bg-red-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
            Invitation for
          </p>
          <p className="mt-1 break-words font-semibold text-red-900">
            {preview.email}
          </p>
        </div>

        <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface-soft) p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
            You&apos;re signed in as
          </p>
          <p className="mt-1 break-words font-semibold text-(--color-text-primary)">
            {loggedInEmail}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-(--radius-md) bg-(--color-primary) px-4 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Sign out and switch accounts
        </button>

        <Link
          to="/dashboard"
          className="flex w-full items-center justify-center rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 font-semibold text-(--color-text-primary) transition hover:bg-(--color-surface-soft)"
        >
          Go back to my dashboard
        </Link>
      </div>
    </div>
  );
}

function AcceptPanel({
  preview,
  onAccept,
  error,
  isSubmitting,
}: {
  preview: InvitationPreview;
  onAccept: (e: FormEvent) => void;
  error: string;
  isSubmitting: boolean;
}) {
  const roleLabel =
    preview.role === "ADMIN" ? "Admin" : "Member";

  return (
    <div>
      <InvitationHeader preview={preview} />

      <h2 className="mt-6 font-(--font-heading) text-4xl font-bold text-(--color-text-primary)">
        Accept the invitation
      </h2>

      <p className="mt-3 text-(--color-text-secondary)">
        You&apos;re about to join{" "}
        <strong className="text-(--color-text-primary)">
          {preview.organizationName || "the workspace"}
        </strong>{" "}
        as an{" "}
        <strong className="text-(--color-text-primary)">
          {roleLabel}
        </strong>
        .
      </p>

      <div className="mt-8 rounded-(--radius-lg) border border-(--color-border) bg-white p-5 shadow-(--shadow-sm)">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
              Workspace
            </p>
            <p className="mt-1 font-semibold text-(--color-text-primary)">
              {preview.organizationName || "FlowDeck workspace"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
              Role
            </p>
            <p className="mt-1 inline-flex rounded-full bg-(--color-primary)/10 px-3 py-1 text-sm font-semibold text-(--color-primary)">
              {roleLabel}
            </p>
          </div>
        </div>

        {preview.invitedByName && (
          <div className="mt-5 border-t border-(--color-border) pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-muted)">
              Invited by
            </p>
            <p className="mt-1 font-semibold text-(--color-text-primary)">
              {preview.invitedByName}
              {preview.invitedByEmail && (
                <span className="ml-2 font-normal text-(--color-text-secondary)">
                  &lt;{preview.invitedByEmail}&gt;
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-(--radius-md) border border-red-200 bg-red-50/70 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onAccept} className="mt-8 space-y-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-(--radius-md) bg-(--color-primary) px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Joining workspace..." : "Accept invitation & join"}
        </button>

        <Link
          to="/"
          className="flex w-full items-center justify-center rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 font-semibold text-(--color-text-primary) transition hover:bg-(--color-surface-soft)"
        >
          Maybe later
        </Link>
      </form>
    </div>
  );
}

function AcceptedPanel() {
  return (
    <div>
      <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="mt-6 font-(--font-heading) text-4xl font-bold text-(--color-text-primary)">
        You&apos;re in!
      </h2>

      <p className="mt-3 text-(--color-text-secondary)">
        The invitation has been accepted. Taking you to your dashboard in a
        moment...
      </p>

      <div className="mt-10 rounded-(--radius-lg) border border-emerald-200 bg-emerald-50/60 p-5">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
          <p className="text-sm font-medium text-emerald-800">
            Redirecting to workspace...
          </p>
        </div>
      </div>

      <Link
        to="/dashboard"
        className="mt-10 flex w-full items-center justify-center rounded-(--radius-md) bg-(--color-primary) px-4 py-3 font-semibold text-white transition hover:opacity-90"
      >
        Go to dashboard now
      </Link>
    </div>
  );
}

function InvitationHeader({
  preview,
}: {
  preview: InvitationPreview;
}) {
  const initials = (preview.organizationName || "FD")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-(--color-primary) font-(--font-heading) text-2xl font-bold text-white">
        {initials}
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-(--color-text-muted)">
          Invitation to join
        </p>
        <p className="mt-0.5 font-(--font-heading) text-2xl font-bold text-(--color-text-primary)">
          {preview.organizationName || "FlowDeck"}
        </p>
      </div>
    </div>
  );
}

export default InvitationAcceptPage;
