import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import KanbanColumn from "../components/ui/KanbanColumn";
import TaskCard from "../components/ui/TaskCard";
import TaskDetailsDrawer from "../components/ui/TaskDetailsDrawer";
import CreateTaskModal from "../components/ui/CreateTaskModal";


function ProjectBoardPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-(--color-text-secondary)">
              Design Team
            </p>

            <h1 className="mt-1 font-(--font-heading) text-3xl font-bold text-(--color-text-primary)">
              Website Redesign
            </h1>
          </div>

          <button
  type="button"
  onClick={() => setIsCreateTaskOpen(true)}
  className="rounded-(--radius-md) bg-(--color-primary) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
>
  + New Task
</button>
        </header>

        <nav className="mt-8 flex gap-6 border-b border-(--color-border)">
          <button className="pb-3 text-sm font-medium text-(--color-text-secondary)">
            Overview
          </button>

          <button className="border-b-2 border-(--color-accent) pb-3 text-sm font-semibold text-(--color-primary)">
            Board
          </button>

          <button className="pb-3 text-sm font-medium text-(--color-text-secondary)">
            List
          </button>

          <button className="pb-3 text-sm font-medium text-(--color-text-secondary)">
            Calendar
          </button>
        </nav>

        <div className="mt-6 flex gap-5 overflow-x-auto pb-5">
          <KanbanColumn title="Backlog" count={2}>
            <TaskCard
              taskKey="FD-21"
              title="Research competitor dashboards"
              priority="Medium"
              dueDate="Aug 10"
              assignee="AA"
            />

            <TaskCard
              taskKey="FD-22"
              title="Prepare design requirements"
              priority="Low"
              dueDate="Aug 11"
              assignee="MR"
            />
          </KanbanColumn>

          <KanbanColumn title="To Do" count={1}>
           
            <TaskCard
  taskKey="FD-24"
  title="Design dashboard layout"
  priority="High"
  dueDate="Aug 12"
  assignee="SK"
  onClick={() => setIsDrawerOpen(true)}
/>
          </KanbanColumn>

          <KanbanColumn title="In Progress" count={1}>
            <TaskCard
              taskKey="FD-25"
              title="Build reusable UI components"
              priority="High"
              dueDate="Aug 14"
              assignee="MR"
            />
          </KanbanColumn>

          <KanbanColumn title="Review" count={1}>
            <TaskCard
              taskKey="FD-26"
              title="Review login page design"
              priority="Medium"
              dueDate="Aug 15"
              assignee="AA"
            />
          </KanbanColumn>

          <KanbanColumn title="Done" count={1}>
            <TaskCard
              taskKey="FD-20"
              title="Create project wireframes"
              priority="Low"
              dueDate="Aug 6"
              assignee="MR"
            />
          </KanbanColumn>
        </div>
      </div>

           {isDrawerOpen && (
        <TaskDetailsDrawer onClose={() => setIsDrawerOpen(false)} />
      )}

      {isCreateTaskOpen && (
        <CreateTaskModal onClose={() => setIsCreateTaskOpen(false)} />
      )}
    </AppLayout>
  );
}

export default ProjectBoardPage;