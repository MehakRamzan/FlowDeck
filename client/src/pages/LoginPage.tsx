import { Link, useNavigate, useSearchParams } from "react-router";
import { useState, type FormEvent } from "react";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/useAuth";
import { getSafeNextPath } from "../lib/navigation";

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
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
