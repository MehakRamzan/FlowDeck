import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/useAuth";

type BoardColumn = {
  id: string;
  name: string;
  position: number;
  projectId: string;
};

type WorkspaceMember = {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";

  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  projectId: string;
  columnId: string;
  assigneeId: string | null;
  dueDate: string | null;

  column: {
    id: string;
    name: string;
  };

  assignee: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;

  project: {
    id: string;
    name: string;
    teamId: string;

    team: {
      id: string;
      name: string;
      organizationId: string;
    };
  };
};

type Comment = {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;

  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
};

type TaskDetailsDrawerProps = {
  taskId: string;
  columns: BoardColumn[];
  onClose: () => void;
  onUpdated?: () => void | Promise<void>;
};

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

function TaskDetailsDrawer({
  taskId,
  columns,
  onClose,
  onUpdated,
}: TaskDetailsDrawerProps) {
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);

  const [members, setMembers] = useState<
    WorkspaceMember[]
  >([]);

  const [comments, setComments] = useState<Comment[]>(
    []
  );

  const [commentText, setCommentText] =
    useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [isPostingComment, setIsPostingComment] =
    useState(false);

  const [error, setError] = useState("");

  const loadTaskDetails = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const taskResponse = await apiRequest(
        `/tasks/${taskId}`
      );

      const loadedTask =
        taskResponse.data.task as Task;

      setTask(loadedTask);

      const [
        commentsResponse,
        membersResponse,
      ] = await Promise.all([
        apiRequest(
          `/comments/tasks/${taskId}`
        ),

        apiRequest(
          `/organizations/${loadedTask.project.team.organizationId}/members`
        ),
      ]);

      setComments(
        commentsResponse.data.comments as Comment[]
      );

      setMembers(
        membersResponse.data
          .members as WorkspaceMember[]
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load task details"
      );
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTaskDetails();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadTaskDetails]);

  async function handleStatusChange(
    targetColumnId: string
  ) {
    if (!task) {
      return;
    }

    if (targetColumnId === task.columnId) {
      return;
    }

    setIsUpdating(true);
    setError("");

    try {
      const targetColumnTasksPosition = 0;

      await apiRequest(
        `/tasks/${task.id}/move`,
        {
          method: "PATCH",
          body: JSON.stringify({
            targetColumnId,
            targetPosition:
              targetColumnTasksPosition,
          }),
        }
      );

      await loadTaskDetails();
      await onUpdated?.();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to move task"
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleAssigneeChange(
    assigneeId: string
  ) {
    if (!task) {
      return;
    }

    setIsUpdating(true);
    setError("");

    try {
      await apiRequest(
        `/tasks/${task.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            assigneeId:
              assigneeId || null,
          }),
        }
      );

      await loadTaskDetails();
      await onUpdated?.();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update assignee"
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleCommentSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    setIsPostingComment(true);
    setError("");

    try {
      await apiRequest(
        `/comments/tasks/${taskId}`,
        {
          method: "POST",
          body: JSON.stringify({
            content: commentText.trim(),
          }),
        }
      );

      setCommentText("");

      await loadTaskDetails();
      await onUpdated?.();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to post comment"
      );
    } finally {
      setIsPostingComment(false);
    }
  }

  async function handleDueDateChange(dueDate: string) {
    if (!task) return;
    setIsUpdating(true);
    setError("");
    try {
      await apiRequest(`/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          dueDate: dueDate ? `${dueDate}T12:00:00.000Z` : null,
        }),
      });
      await loadTaskDetails();
      await onUpdated?.();
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Unable to update due date"
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function saveComment(commentId: string) {
    if (!editingCommentText.trim()) return;
    try { await apiRequest(`/comments/${commentId}`, { method: "PATCH", body: JSON.stringify({ content: editingCommentText.trim() }) }); setEditingCommentId(null); await loadTaskDetails(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to edit comment"); }
  }

  async function deleteComment(comment: Comment) {
    if (!window.confirm("Delete this comment?")) return;
    try { await apiRequest(`/comments/${comment.id}`, { method: "DELETE" }); await loadTaskDetails(); await onUpdated?.(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to delete comment"); }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close task details"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/30"
      />

      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-(--color-border) bg-white p-6 shadow-(--shadow-lg)">
        <header className="flex items-center justify-between">
          <span className="text-sm font-medium text-(--color-text-secondary)">
            Task details
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

        {isLoading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-sm text-(--color-text-secondary)">
              Loading task...
            </p>
          </div>
        ) : error && !task ? (
          <div className="mt-6 rounded-(--radius-md) border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : task ? (
          <>
            <h2 className="mt-5 font-(--font-heading) text-2xl font-bold">
              {task.title}
            </h2>

            <section className="mt-8">
              <h3 className="text-sm font-semibold">
                Description
              </h3>

              <p className="mt-2 text-sm leading-6 text-(--color-text-secondary)">
                {task.description ||
                  "No description has been added."}
              </p>
            </section>

            <div className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="taskStatus"
                  className="mb-2 block text-sm text-(--color-text-secondary)"
                >
                  Status
                </label>

                <select
                  id="taskStatus"
                  value={task.columnId}
                  disabled={isUpdating}
                  onChange={(event) =>
                    void handleStatusChange(
                      event.target.value
                    )
                  }
                  className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-(--color-accent) disabled:opacity-60"
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
                <label
                  htmlFor="taskAssignee"
                  className="mb-2 block text-sm text-(--color-text-secondary)"
                >
                  Assignee
                </label>

                <select
                  id="taskAssignee"
                  value={
                    task.assigneeId ?? ""
                  }
                  disabled={isUpdating}
                  onChange={(event) =>
                    void handleAssigneeChange(
                      event.target.value
                    )
                  }
                  className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-(--color-accent) disabled:opacity-60"
                >
                  <option value="">
                    Unassigned
                  </option>

                  {members.map((member) => (
                    <option
                      key={member.user.id}
                      value={member.user.id}
                    >
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="taskDueDate" className="mb-2 block text-sm text-(--color-text-secondary)">
                  Due date
                </label>
                <input
                  id="taskDueDate"
                  type="date"
                  value={task.dueDate ? task.dueDate.slice(0, 10) : ""}
                  disabled={isUpdating}
                  onChange={(event) => void handleDueDateChange(event.target.value)}
                  className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-(--color-accent) disabled:opacity-60"
                />
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-sm text-(--color-text-secondary)">
                  Project
                </span>

                <span className="text-sm font-semibold">
                  {task.project.name}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-sm text-(--color-text-secondary)">
                  Team
                </span>

                <span className="text-sm font-semibold">
                  {task.project.team.name}
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-(--radius-md) border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <section className="mt-10 border-t border-(--color-border) pt-6">
              <h3 className="font-(--font-heading) text-lg font-bold">
                Comments
              </h3>

              <form
                onSubmit={handleCommentSubmit}
                className="mt-4"
              >
                <textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(event) =>
                    setCommentText(
                      event.target.value
                    )
                  }
                  className="min-h-24 w-full resize-none rounded-(--radius-md) border border-(--color-border) p-3 outline-none focus:border-(--color-accent)"
                />

                <button
                  type="submit"
                  disabled={
                    isPostingComment ||
                    !commentText.trim()
                  }
                  className="mt-3 rounded-(--radius-md) bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPostingComment
                    ? "Posting..."
                    : "Post comment"}
                </button>
              </form>

              <div className="mt-6 space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-(--color-text-secondary)">
                    No comments yet.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <article
                      key={comment.id}
                      className="rounded-(--radius-md) bg-(--color-background) p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold">
                          {comment.author.name}
                        </span>

                        <span className="text-xs text-(--color-text-secondary)">
                          {formatDate(
                            comment.createdAt
                          )}
                        </span>
                      </div>

                      {editingCommentId === comment.id ? <div className="mt-3"><textarea value={editingCommentText} onChange={(event) => setEditingCommentText(event.target.value)} className="w-full rounded border border-(--color-border) p-2 text-sm" /><div className="mt-2 flex gap-3"><button type="button" onClick={() => void saveComment(comment.id)} className="text-sm font-semibold text-(--color-primary)">Save</button><button type="button" onClick={() => setEditingCommentId(null)} className="text-sm">Cancel</button></div></div> : <p className="mt-2 text-sm leading-6 text-(--color-text-secondary)">{comment.content}</p>}
                      {comment.authorId === user?.id && editingCommentId !== comment.id && <div className="mt-3 flex gap-3"><button type="button" onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.content); }} className="text-xs font-semibold text-(--color-primary)">Edit</button><button type="button" onClick={() => void deleteComment(comment)} className="text-xs font-semibold text-red-600">Delete</button></div>}
                    </article>
                  ))
                )}
              </div>
            </section>
          </>
        ) : null}
      </aside>
    </>
  );
}

export default TaskDetailsDrawer;
