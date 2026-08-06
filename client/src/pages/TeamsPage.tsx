import AppLayout from "../components/layout/AppLayout";
import { useState } from "react";
import CreateTeamModal from "../components/ui/CreateTeamModal";


const teams = [
  {
    name: "Design Team",
    description: "Handles product design and user experience.",
    members: 5,
    projects: 3,
    initials: "DT",
  },
  {
    name: "Development Team",
    description: "Builds and maintains FlowDeck projects.",
    members: 8,
    projects: 4,
    initials: "DV",
  },
  {
    name: "Marketing Team",
    description: "Manages campaigns and promotional activities.",
    members: 4,
    projects: 2,
    initials: "MT",
  },
];

function TeamsPage() {

    const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-(--font-heading) text-3xl font-bold">
              Teams
            </h1>

            <p className="mt-2 text-(--color-text-secondary)">
              Organize members and projects into focused teams.
            </p>
          </div>

          <button
  type="button"
  onClick={() => setIsCreateTeamOpen(true)}
  className="rounded-(--radius-md) bg-(--color-primary) px-4 py-3 text-sm font-semibold text-white"
>
  + Create Team
</button>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <article
              key={team.name}
              className="rounded-(--radius-lg) border border-(--color-border) bg-white p-6 shadow-(--shadow-sm)"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-(--radius-md) bg-(--color-highlight) font-semibold text-(--color-primary)">
                  {team.initials}
                </div>

                <button className="text-xl text-(--color-text-secondary)">
                  •••
                </button>
              </div>

              <h2 className="mt-5 font-(--font-heading) text-xl font-bold">
                {team.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-(--color-text-secondary)">
                {team.description}
              </p>

              <div className="mt-6 flex gap-6 border-t border-(--color-border) pt-4 text-sm">
                <div>
                  <p className="font-semibold">{team.members}</p>
                  <p className="text-(--color-text-secondary)">Members</p>
                </div>

                <div>
                  <p className="font-semibold">{team.projects}</p>
                  <p className="text-(--color-text-secondary)">Projects</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {isCreateTeamOpen && (
  <CreateTeamModal onClose={() => setIsCreateTeamOpen(false)} />
)}
    </AppLayout>
  );
}

export default TeamsPage;