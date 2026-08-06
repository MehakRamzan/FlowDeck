type TaskDetailsDrawerProps = {
  onClose: () => void;
};

function TaskDetailsDrawer({ onClose }: TaskDetailsDrawerProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close task details"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/25"
      />

      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-(--color-border) bg-white p-6 shadow-(--shadow-lg)">
        <header className="flex items-center justify-between">
          <span className="text-sm font-medium text-(--color-text-secondary)">
            FD-24
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close task details"
            className="text-2xl text-(--color-text-secondary)"
          >
            ×
          </button>
        </header>

        <h2 className="mt-5 font-(--font-heading) text-2xl font-bold">
          Design dashboard layout
        </h2>

        <section className="mt-8">
          <h3 className="text-sm font-semibold">Description</h3>

          <p className="mt-2 text-sm leading-6 text-(--color-text-secondary)">
            Create the main dashboard layout for the FlowDeck application.
          </p>
        </section>

        <div className="mt-8 space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-(--color-text-secondary)">Status</span>
            <span className="text-sm font-semibold">To Do</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-(--color-text-secondary)">
              Priority
            </span>
            <span className="text-sm font-semibold">High</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-(--color-text-secondary)">
              Assignee
            </span>
            <span className="text-sm font-semibold">Sara Khan</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-(--color-text-secondary)">
              Due date
            </span>
            <span className="text-sm font-semibold">Aug 12</span>
          </div>
        </div>

        <section className="mt-10 border-t border-(--color-border) pt-6">
          <h3 className="font-(--font-heading) text-lg font-bold">Comments</h3>

          <textarea
            placeholder="Write a comment..."
            className="mt-4 min-h-24 w-full resize-none rounded-(--radius-md) border border-(--color-border) p-3 outline-none focus:border-(--color-accent)"
          />

          <button className="mt-3 rounded-(--radius-md) bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white">
            Post comment
          </button>
        </section>
      </aside>
    </>
  );
}

export default TaskDetailsDrawer;