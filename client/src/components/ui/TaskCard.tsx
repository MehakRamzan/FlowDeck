type TaskCardProps = {
  taskKey: string;
  title: string;
  priority: string;
  dueDate: string;
  assignee: string;
 onClick?: () => void;
};


function TaskCard({
  taskKey,
  title,
  priority,
  dueDate,
  assignee,
  onClick,
}: TaskCardProps) {
  return (
    <article
    onClick={onClick}
    className="rounded-(--radius-lg) border border-(--color-border) bg-white p-4 shadow-(--shadow-sm)">
      <p className="text-xs font-medium text-(--color-text-secondary)">
        {taskKey}
      </p>

      <h3 className="mt-2 font-semibold text-(--color-text-primary)">
        {title}
      </h3>

      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
          {priority}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-xs text-(--color-text-secondary)">
            {dueDate}
          </span>

          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-(--color-highlight) text-xs font-semibold text-(--color-primary)">
            {assignee}
          </span>
        </div>
      </div>
    </article>
  );
}

export default TaskCard;