import AppLayout from "../components/layout/AppLayout";

function SettingsPage() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <header>
          <h1 className="font-(--font-heading) text-3xl font-bold">
            Settings
          </h1>

          <p className="mt-2 text-(--color-text-secondary)">
            Manage your profile and workspace preferences.
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
          <nav className="space-y-2">
            <button className="w-full rounded-(--radius-md) bg-white px-4 py-3 text-left font-semibold text-(--color-primary) shadow-(--shadow-sm)">
              Profile
            </button>

            <button className="w-full rounded-(--radius-md) px-4 py-3 text-left text-(--color-text-secondary)">
              Workspace
            </button>

            <button className="w-full rounded-(--radius-md) px-4 py-3 text-left text-(--color-text-secondary)">
              Notifications
            </button>

            <button className="w-full rounded-(--radius-md) px-4 py-3 text-left text-(--color-text-secondary)">
              Security
            </button>
          </nav>

          <section className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)">
            <h2 className="font-(--font-heading) text-xl font-bold">
              Profile information
            </h2>

            <p className="mt-2 text-sm text-(--color-text-secondary)">
              Update your personal information and profile details.
            </p>

            <form className="mt-6 max-w-xl space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--color-highlight) font-semibold text-(--color-primary)">
                  MR
                </div>

                <button
                  type="button"
                  className="rounded-(--radius-md) border border-(--color-border) px-4 py-2 text-sm font-semibold"
                >
                  Change photo
                </button>
              </div>

              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold"
                >
                  Full name
                </label>

                <input
                  id="fullName"
                  type="text"
                  defaultValue="Mehak Ramzan"
                  className="w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none focus:border-(--color-accent)"
                />
              </div>

              <div>
                <label
                  htmlFor="profileEmail"
                  className="mb-2 block text-sm font-semibold"
                >
                  Email address
                </label>

                <input
                  id="profileEmail"
                  type="email"
                  defaultValue="mehak@flowdeck.com"
                  className="w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none focus:border-(--color-accent)"
                />
              </div>

              <div>
                <label
                  htmlFor="jobTitle"
                  className="mb-2 block text-sm font-semibold"
                >
                  Job title
                </label>

                <input
                  id="jobTitle"
                  type="text"
                  placeholder="Product Designer"
                  className="w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none focus:border-(--color-accent)"
                />
              </div>

              <button
                type="submit"
                className="rounded-(--radius-md) bg-(--color-primary) px-5 py-3 font-semibold text-white"
              >
                Save changes
              </button>
            </form>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

export default SettingsPage;