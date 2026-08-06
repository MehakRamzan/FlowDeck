import StatCard from "../components/ui/StatCard";
import AppLayout from "../components/layout/AppLayout";

function DashboardPage() {
  return (


    <AppLayout>

 
        <div className="p-6 lg:p-8">
          <h1 className="font-(--font-heading) text-3xl font-bold">
            Good morning
          </h1>

          <p className="mt-2 text-(--color-text-secondary)">
            Here’s what’s happening in your workspace today.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Tasks"
              value={48}
              note="Across all projects"
            />
            <StatCard
              label="In Progress"
              value={12}
              note="Currently being worked on"
            />

            <StatCard label="Completed" value={29} note="Finished this month" />

            <StatCard label="Overdue" value={7} note="Need your attention" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            {/*My Tasks*/}
            <section className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm) xl:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-(--font-heading) text-xl font-bold">
                  My Tasks
                </h2>

                <button className="text-sm font-semibold text-(--color-accent)">
                  View all
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <article className="flex items-center justify-between rounded-(--radius-md) border border-(--color-border) p-4">
                  <div>
                    <h3 className="font-semibold">Design dashboard layout</h3>
                    <p className="mt-1 text-sm text-(--color-text-secondary)">
                      Website Redesign
                    </p>
                  </div>

                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                    High
                  </span>
                </article>

                <article className="flex items-center justify-between rounded-(--radius-md) border border-(--color-border) p-4">
                  <div>
                    <h3 className="font-semibold">
                      Prepare project requirements
                    </h3>
                    <p className="mt-1 text-sm text-(--color-text-secondary)">
                      Mobile Application
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Medium
                  </span>
                </article>

                <article className="flex items-center justify-between rounded-(--radius-md) border border-(--color-border) p-4">
                  <div>
                    <h3 className="font-semibold">Review client feedback</h3>
                    <p className="mt-1 text-sm text-(--color-text-secondary)">
                      Marketing Campaign
                    </p>
                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    Low
                  </span>
                </article>
              </div>
            </section>

            {/* Upcoming Deadlines */}
            <section className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)">
              <h2 className="font-(--font-heading) text-xl font-bold">
                Upcoming Deadlines
              </h2>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="font-semibold">Homepage design</p>
                  <p className="mt-1 text-sm text-(--color-danger)">
                    Due today
                  </p>
                </div>

                <div>
                  <p className="font-semibold">API documentation</p>
                  <p className="mt-1 text-sm text-(--color-text-secondary)">
                    Due tomorrow
                  </p>
                </div>

                <div>
                  <p className="font-semibold">Client presentation</p>
                  <p className="mt-1 text-sm text-(--color-text-secondary)">
                    Due Aug 10
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            {/* Project Progress */}
            <section className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)">
              <div className="flex items-center justify-between">
                <h2 className="font-(--font-heading) text-xl font-bold">
                  Project Progress
                </h2>

                <button className="text-sm font-semibold text-(--color-accent)">
                  View projects
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Website Redesign</p>
                      <p className="mt-1 text-sm text-(--color-text-secondary)">
                        Design Team
                      </p>
                    </div>

                    <span className="font-semibold">75%</span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-(--color-background)">
                    <div className="h-full w-3/4 rounded-full bg-(--color-accent)" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Mobile Application</p>
                      <p className="mt-1 text-sm text-(--color-text-secondary)">
                        Development Team
                      </p>
                    </div>

                    <span className="font-semibold">50%</span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-(--color-background)">
                    <div className="h-full w-1/2 rounded-full bg-(--color-primary)" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Marketing Campaign</p>
                      <p className="mt-1 text-sm text-(--color-text-secondary)">
                        Marketing Team
                      </p>
                    </div>

                    <span className="font-semibold">30%</span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-(--color-background)">
                    <div className="h-full w-[30%] rounded-full bg-(--color-highlight)" />
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)">
              <h2 className="font-(--font-heading) text-xl font-bold">
                Recent Activity
              </h2>

              <div className="mt-6 space-y-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-highlight) text-sm font-semibold text-(--color-primary)">
                    SK
                  </div>

                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">Sara Khan</span> moved
                      “Homepage Design” to In Progress.
                    </p>
                    <p className="mt-1 text-xs text-(--color-text-secondary)">
                      10 minutes ago
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-background) text-sm font-semibold text-(--color-primary)">
                    AA
                  </div>

                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">Ali Ahmed</span> added a
                      comment to “API Documentation”.
                    </p>
                    <p className="mt-1 text-xs text-(--color-text-secondary)">
                      35 minutes ago
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-accent) text-sm font-semibold text-white">
                    MR
                  </div>

                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">You</span> created the
                      project “Marketing Campaign”.
                    </p>
                    <p className="mt-1 text-xs text-(--color-text-secondary)">
                      2 hours ago
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        </AppLayout>

  );
}

export default DashboardPage;
