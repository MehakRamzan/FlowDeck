import AppLayout from "../components/layout/AppLayout";

const tasks = [
  {
    key: "FD-24",
    title: "Design dashboard layout",
    project: "Website Redesign",
    status: "To Do",
    priority: "High",
    dueDate: "Aug 12",
  },
  {
    key: "FD-25",
    title: "Build reusable UI components",
    project: "Website Redesign",
    status: "In Progress",
    priority: "High",
    dueDate: "Aug 14",
  },
  {
    key: "FD-31",
    title: "Prepare API documentation",
    project: "Mobile Application",
    status: "Review",
    priority: "Medium",
    dueDate: "Aug 18",
  },
];

function MyTasksPage() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <header>
          <h1 className="font-(--font-heading) text-3xl font-bold">
            My Tasks
          </h1>

          <p className="mt-2 text-(--color-text-secondary)">
            View and manage tasks assigned to you.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <input
            type="search"
            placeholder="Search your tasks..."
            className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none focus:border-(--color-accent) sm:max-w-sm"
          />

          <select className="rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none">
            <option>All statuses</option>
            <option>To Do</option>
            <option>In Progress</option>
            <option>Review</option>
            <option>Done</option>
          </select>

          <select className="rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none">
            <option>All priorities</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
        </div>

        <section className="mt-6 overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-white shadow-(--shadow-sm)">
          <div className="hidden grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr] gap-4 border-b border-(--color-border) px-6 py-4 text-sm font-semibold text-(--color-text-secondary) md:grid">
            <span>Task</span>
            <span>Project</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Due date</span>
          </div>

          {tasks.map((task) => (
            <article
              key={task.key}
              className="grid gap-3 border-b border-(--color-border) p-5 last:border-b-0 md:grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr] md:items-center md:px-6"
            >
              <div>
                <p className="text-xs font-medium text-(--color-text-secondary)">
                  {task.key}
                </p>

                <h2 className="mt-1 font-semibold">{task.title}</h2>
              </div>

              <span className="text-sm text-(--color-text-secondary)">
                {task.project}
              </span>

              <span className="w-fit rounded-full bg-(--color-background) px-3 py-1 text-xs font-semibold">
                {task.status}
              </span>

              <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                {task.priority}
              </span>

              <span className="text-sm text-(--color-text-secondary)">
                {task.dueDate}
              </span>
            </article>
          ))}
        </section>
      </div>
    </AppLayout>
  );
}

export default MyTasksPage;