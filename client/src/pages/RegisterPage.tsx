import { Link, useNavigate, useSearchParams } from "react-router";
import { useState, type FormEvent } from "react";
import { apiRequest } from "../lib/api";
import { getSafeNextPath } from "../lib/navigation";

function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = getSafeNextPath(
    searchParams.get("next"),
    "/dashboard"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      navigate(
        `/login?next=${encodeURIComponent(nextPath)}`,
        { replace: true }
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed"
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
            Bring your team and projects together.
          </h1>

          <p className="mt-6 max-w-lg text-lg text-white/75">
            Create your workspace, organize tasks, and keep everyone moving in
            the same direction.
          </p>
        </div>

        <p className="text-sm text-white/60">
          Organize. Collaborate. Deliver.
        </p>
      </section>

      <section className="flex items-center justify-center bg-(--color-background) px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 font-(--font-heading) text-2xl font-bold text-(--color-primary) lg:hidden">
            FlowDeck
          </div>

          <h2 className="font-(--font-heading) text-4xl font-bold text-(--color-text-primary)">
            Create your account
          </h2>

          <p className="mt-3 text-(--color-text-secondary)">
            Start organizing your team’s work with FlowDeck.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold"
              >
                Full name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
                className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none transition focus:border-(--color-accent) focus:ring-3 focus:ring-(--color-accent)/15"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
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
                className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none transition focus:border-(--color-accent) focus:ring-3 focus:ring-(--color-accent)/15"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none transition focus:border-(--color-accent) focus:ring-3 focus:ring-(--color-accent)/15"
              />
            </div>

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
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-(--color-text-secondary)">
            Already have an account?{" "}
            <Link
              to={`/login?next=${encodeURIComponent(nextPath)}`}
              className="font-semibold text-(--color-accent) hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
