import {
  useState,
  type FormEvent,
} from "react";

import { apiRequest } from "../../lib/api";

type BoardColumn = {
  id: string;
  name: string;
  position: number;
  projectId: string;
};

type CreateTaskModalProps = {
  projectId: string;
  columns: BoardColumn[];
  defaultColumnId?: string;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
};

function CreateTaskModal({
  projectId,
  columns,
  defaultColumnId,
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [dueDate, setDueDate] = useState("");

  const [columnId, setColumnId] =
    useState(
      defaultColumnId ||
        columns[0]?.id ||
        ""
    );

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!columnId) {
      setError("Please select a board column.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await apiRequest(
        `/tasks/projects/${projectId}/columns/${columnId}`,
        {
          method: "POST",
          body: JSON.stringify({
            title,
            description:
              description.trim() || undefined,
            dueDate: dueDate ? `${dueDate}T12:00:00.000Z` : undefined,
          }),
        }
      );

      await onCreated?.();

      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create task"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
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

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
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
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              required
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
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              className="min-h-24 w-full resize-none rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none focus:border-(--color-accent)"
            />
          </div>

          <div>
            <label
              htmlFor="taskStatus"
              className="mb-2 block text-sm font-semibold"
            >
              Status
            </label>

            <select
              id="taskStatus"
              value={columnId}
              onChange={(event) =>
                setColumnId(event.target.value)
              }
              className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none"
            >
              {columns.map((column) => (
                <option
                  key={column.id}
                  value={column.id}
                >
                  {column.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="taskDueDate" className="mb-2 block text-sm font-semibold">
              Due date <span className="font-normal text-(--color-text-secondary)">(optional)</span>
            </label>
            <input
              id="taskDueDate"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none focus:border-(--color-accent)"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-(--radius-md) border border-(--color-border) px-4 py-2 font-semibold disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                columns.length === 0
              }
              className="rounded-(--radius-md) bg-(--color-primary) px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Creating..."
                : "Create task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CreateTaskModal;
