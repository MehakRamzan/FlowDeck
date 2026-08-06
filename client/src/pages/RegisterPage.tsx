import { Link } from "react-router";

function RegisterPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-(--color-primary) p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="font-(--font-heading) text-2xl font-bold">FlowDeck</div>
        <div className="max-w-2xl">
          <h1 className="font-(--font-heading) text-5xl leading-[1.05] font-bold xl:text-6xl">
            Bring your team and projects together.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/75">
            Create your workspace, organize tasks, and keep everyone moving in
            the same direction.
          </p>
        </div>

        <p className="text-sm text-white/60">Organize. Collaborate. Deliver.</p>
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

          <form className="mt-8 space-y-5">
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
                className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none transition focus:border-(--color-accent) focus:ring-3 focus:ring-(--color-accent)/15"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-(--radius-md) bg-(--color-primary) px-4 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-(--color-text-secondary)">
            Already have an account?{" "}
            <Link
              to="/login"
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
