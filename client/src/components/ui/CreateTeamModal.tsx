type CreateTeamModalProps = {
  onClose: () => void;
};

function CreateTeamModal({ onClose }: CreateTeamModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <section className="w-full max-w-md rounded-(--radius-xl) bg-white p-6 shadow-(--shadow-lg)">
        <header className="flex items-center justify-between">
          <h2 className="font-(--font-heading) text-2xl font-bold">
            Create team
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
          Create a team for organizing members and projects.
        </p>

        <form className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="teamName"
              className="mb-2 block text-sm font-semibold"
            >
              Team name
            </label>

            <input
              id="teamName"
              type="text"
              placeholder="Design Team"
              className="w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none focus:border-(--color-accent)"
            />
          </div>

          <div>
            <label
              htmlFor="teamDescription"
              className="mb-2 block text-sm font-semibold"
            >
              Description
            </label>

            <textarea
              id="teamDescription"
              placeholder="What does this team work on?"
              className="min-h-24 w-full resize-none rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none focus:border-(--color-accent)"
            />
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
              Create team
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CreateTeamModal;