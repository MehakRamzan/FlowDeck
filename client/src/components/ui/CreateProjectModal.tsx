type CreateProjectModalProps = {
  onClose: () => void;
};

function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <section className="w-full max-w-lg rounded-(--radius-xl) bg-white p-6 shadow-(--shadow-lg)">
        <header className="flex items-center justify-between">
          <h2 className="font-(--font-heading) text-2xl font-bold">
            Create project
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-2xl text-(--color-text-secondary)"
          >
            ×
          </button>
        </header>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Create a project and assign it to one of your teams.
        </p>

        <form className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="projectName"
              className="mb-2 block text-sm font-semibold"
            >
              Project name
            </label>

            <input
              id="projectName"
              type="text"
              placeholder="Website Redesign"
              className="w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none focus:border-(--color-accent)"
            />
          </div>

          <div>
            <label
              htmlFor="projectTeam"
              className="mb-2 block text-sm font-semibold"
            >
              Team
            </label>

            <select
              id="projectTeam"
              className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none focus:border-(--color-accent)"
            >
              <option>Design Team</option>
              <option>Development Team</option>
              <option>Marketing Team</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="projectDescription"
              className="mb-2 block text-sm font-semibold"
            >
              Description
            </label>

            <textarea
              id="projectDescription"
              placeholder="Describe the project..."
              className="min-h-24 w-full resize-none rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none focus:border-(--color-accent)"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="projectStartDate"
                className="mb-2 block text-sm font-semibold"
              >
                Start date
              </label>

              <input
                id="projectStartDate"
                type="date"
                className="w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="projectDueDate"
                className="mb-2 block text-sm font-semibold"
              >
                Due date
              </label>

              <input
                id="projectDueDate"
                type="date"
                className="w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-(--radius-md) border border-(--color-border) px-4 py-2 font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-(--radius-md) bg-(--color-primary) px-5 py-2 font-semibold text-white"
            >
              Create project
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CreateProjectModal;