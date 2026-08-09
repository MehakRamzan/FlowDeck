import { Link, useNavigate, useSearchParams } from "react-router";
import { useState, type FormEvent } from "react";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/useAuth";
import { getSafeNextPath } from "../lib/navigation";

const DEMO_PASSWORD = "FlowDeckDemo2026!";
const demoAccounts = {
  admin: {
    email: "demo.admin@flowdeck.app",
    label: "Admin view",
    description: "Explore teams, projects, members, and workspace controls.",
  },
  member: {
    email: "demo.member@flowdeck.app",
    label: "Member view",
    description: "See assigned work and the focused contributor experience.",
  },
} as const;

type DemoRole = keyof typeof demoAccounts;

function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const nextPath = getSafeNextPath(
    searchParams.get("next"),
    "/dashboard"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<DemoRole | null>(null);

  async function signIn(loginEmail: string, loginPassword: string) {
    setError("");
    setIsLoading(true);

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      localStorage.setItem(
        "flowdeck_token",
        response.data.token
      );

      await refreshUser();
      navigate(nextPath, { replace: true });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await signIn(email, password);
  }

  async function handleDemoLogin(role: DemoRole) {
    const account = demoAccounts[role];
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setDemoLoading(role);
    await signIn(account.email, DEMO_PASSWORD);
    setDemoLoading(null);
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-(--color-primary) p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="font-(--font-heading) text-2xl font-bold">
          FlowDeck
        </div>

        <div className="max-w-2xl">
          <h1 className="font-(--font-heading) text-5xl leading-[1.05] font-bold xl:text-6xl">
            Your team’s work, organized in one place.
          </h1>

          <p className="mt-6 max-w-lg text-lg text-white/75">
            Plan projects, assign tasks, and keep your team aligned from one
            collaborative workspace.
          </p>
        </div>

        <p className="text-sm text-white/60">
          Organize. Collaborate. Deliver.
        </p>
      </section>

      <section className="flex items-center justify-center bg-(--color-background) px-10 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 font-(--font-heading) text-2xl font-bold text-(--color-primary) lg:hidden">
            FlowDeck
          </div>

          <h2 className="font-(--font-heading) text-4xl font-bold text-(--color-text-primary)">
            Welcome back
          </h2>

          <p className="mt-3 text-(--color-text-secondary)">
            Sign in to access your FlowDeck workspace.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-(--color-text-primary)"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 text-(--color-text-primary) outline-none transition focus:border-(--color-accent) focus:ring-3 focus:ring-(--color-accent)/15"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-(--color-text-primary)"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 text-(--color-text-primary) outline-none transition focus:border-(--color-accent) focus:ring-3 focus:ring-(--color-accent)/15"
              />
            </div>

            <div className="text-right"><Link to="/forgot-password" className="text-sm font-semibold text-(--color-accent)">Forgot password?</Link></div>

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
                ? "Signing in..."
                : "Sign in to FlowDeck"}
            </button>
          </form>

          <div className="my-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.16em] text-(--color-text-muted)">
            <span className="h-px flex-1 bg-(--color-border)" />
            Explore the live demo
            <span className="h-px flex-1 bg-(--color-border)" />
          </div>

          <section className="overflow-hidden rounded-(--radius-lg) border border-[#d8cec6] bg-white shadow-(--shadow-sm)">
            <div className="flex items-start justify-between gap-4 bg-[#f7f1ed] px-5 py-4">
              <div>
                <p className="font-(--font-heading) text-base font-bold text-(--color-primary)">
                  Pixora Demo Workspace
                </p>
                <p className="mt-1 text-xs leading-5 text-(--color-text-secondary)">
                  Preloaded with teams, active projects, tasks, comments, and notifications.
                </p>
              </div>
              <span className="rounded-full bg-[#dcebe5] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#3f7564]">
                Live
              </span>
            </div>

            <div className="grid gap-2 p-3 sm:grid-cols-2">
              {(Object.entries(demoAccounts) as [DemoRole, (typeof demoAccounts)[DemoRole]][]).map(
                ([role, account]) => (
                  <button
                    key={role}
                    type="button"
                    disabled={isLoading}
                    onClick={() => void handleDemoLogin(role)}
                    className="group rounded-(--radius-md) border border-(--color-border) p-3 text-left transition hover:-translate-y-0.5 hover:border-(--color-accent) hover:shadow-(--shadow-sm) disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-bold text-(--color-primary)">
                      {demoLoading === role ? "Opening demo..." : account.label}
                      <span className="transition group-hover:translate-x-1">→</span>
                    </span>
                    <span className="mt-1.5 block text-[10px] leading-4 text-(--color-text-secondary)">
                      {account.description}
                    </span>
                  </button>
                )
              )}
            </div>

            <p className="border-t border-(--color-border) px-5 py-3 text-[10px] text-(--color-text-muted)">
              Demo access is read-only and contains no personal information.
            </p>
          </section>

          <p className="mt-6 text-center text-sm text-(--color-text-secondary)">
            Don&apos;t have an account?{" "}
            <Link
              to={`/register?next=${encodeURIComponent(nextPath)}`}
              className="font-semibold text-(--color-primary)"
            >
              Create account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
