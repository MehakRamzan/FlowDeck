type CreateTaskModalProps = {
  onClose: () => void;
};

function CreateTaskModal({ onClose }: CreateTaskModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <section className="w-full max-w-lg rounded-(--radius-xl) bg-white p-6 shadow-(--shadow-lg)">
        <header className="flex items-center justify-between">
          <h2 className="font-(--font-heading) text-2xl font-bold">
            Create new task
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-(--color-text-secondary)"
          >
            ×
          </button>
        </header>

        <form className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="taskTitle"
              className="mb-2 block text-sm font-semibold"
            >
              Task title
            </label>

            <input
              id="taskTitle"
              type="text"
              placeholder="Enter task title"
              className="w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none focus:border-(--color-accent)"
            />
          </div>

          <div>
            <label
              htmlFor="taskDescription"
              className="mb-2 block text-sm font-semibold"
            >
              Description
            </label>

            <textarea
              id="taskDescription"
              placeholder="Add task details"
              className="min-h-24 w-full resize-none rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none focus:border-(--color-accent)"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="taskStatus"
                className="mb-2 block text-sm font-semibold"
              >
                Status
              </label>

              <select
                id="taskStatus"
                className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none"
              >
                <option>Backlog</option>
                <option>To Do</option>
                <option>In Progress</option>
                <option>Review</option>
                <option>Done</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="taskPriority"
                className="mb-2 block text-sm font-semibold"
              >
                Priority
              </label>

              <select
                id="taskPriority"
                className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="taskDueDate"
              className="mb-2 block text-sm font-semibold"
            >
              Due date
            </label>

            <input
              id="taskDueDate"
              type="date"
              className="w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none"
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
              Create task
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CreateTaskModal;