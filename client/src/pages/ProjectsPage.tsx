import AppLayout from "../components/layout/AppLayout";
import { Link } from "react-router";
import { useState } from "react";
import CreateProjectModal from "../components/ui/CreateProjectModal";

const projects = [
  {
    id: 1,
    name: "Website Redesign",
    team: "Design Team",
    description: "Redesign the company website and improve user experience.",
    progress: 75,
    tasks: 24,
    dueDate: "Aug 25, 2026",
  },
  {
    id: 2,
    name: "Mobile Application",
    team: "Development Team",
    description: "Build and launch the new customer mobile application.",
    progress: 50,
    tasks: 36,
    dueDate: "Sep 18, 2026",
  },
  {
    id: 3,
    name: "Marketing Campaign",
    team: "Marketing Team",
    description: "Plan and deliver the upcoming product-launch campaign.",
    progress: 30,
    tasks: 18,
    dueDate: "Sep 30, 2026",
  },
];

function ProjectsPage() {

    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-(--font-heading) text-3xl font-bold">
              Projects
            </h1>

            <p className="mt-2 text-(--color-text-secondary)">
              View and manage projects across your workspace.
            </p>
          </div>

          <button
  type="button"
  onClick={() => setIsCreateProjectOpen(true)}
  className="rounded-(--radius-md) bg-(--color-primary) px-4 py-3 text-sm font-semibold text-white"
>
  + Create Project
</button>
        </header>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <input
            type="search"
            placeholder="Search projects..."
            className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none focus:border-(--color-accent) sm:max-w-sm"
          />

          <select className="rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none">
            <option>All teams</option>
            <option>Design Team</option>
            <option>Development Team</option>
            <option>Marketing Team</option>
          </select>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)"
            >
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-(--color-background) px-3 py-1 text-xs font-semibold text-(--color-secondary)">
                  {project.team}
                </span>

                <button className="text-xl text-(--color-text-secondary)">
                  •••
                </button>
              </div>

              <h2 className="mt-5 font-(--font-heading) text-xl font-bold">
                {project.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-(--color-text-secondary)">
                {project.description}
              </p>

              <div className="mt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-(--color-text-secondary)">
                    Progress
                  </span>

                  <span className="font-semibold">{project.progress}%</span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-(--color-background)">
                  <div
                    className="h-full rounded-full bg-(--color-accent)"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-between border-t border-(--color-border) pt-4 text-sm">
                <span className="text-(--color-text-secondary)">
                  {project.tasks} tasks
                </span>

                <span className="text-(--color-text-secondary)">
                  Due {project.dueDate}
                </span>
              </div>

              <Link
                to={`/projects/${project.id}/board`}
                className="mt-5 block rounded-(--radius-md) border border-(--color-border) px-4 py-2.5 text-center text-sm font-semibold transition hover:bg-(--color-background)"
              >
                Open project
              </Link>
            </article>
          ))}
        </div>
      </div>
      {isCreateProjectOpen && (
  <CreateProjectModal onClose={() => setIsCreateProjectOpen(false)} />
)}
    </AppLayout>
  );
}

export default ProjectsPage;