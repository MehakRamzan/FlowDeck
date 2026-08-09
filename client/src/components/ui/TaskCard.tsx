type TaskCardProps = {
  title: string;
  description?: string | null;
  assignee?: string | null;
  onClick?: () => void;
};

function TaskCard({
  title,
  description,
  assignee,
  onClick,
}: TaskCardProps) {
  return (
    <article
      onClick={onClick}
      className="cursor-pointer rounded-(--radius-md) border border-(--color-border) bg-white p-4 shadow-(--shadow-sm) transition hover:-translate-y-0.5 hover:shadow-(--shadow-md)"
    >
      <h3 className="font-semibold text-(--color-text-primary)">
        {title}
      </h3>

      {description && (
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-(--color-text-secondary)">
          {description}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        {assignee ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-highlight) text-xs font-semibold text-(--color-primary)">
            {assignee}
          </span>
        ) : (
          <span className="text-xs text-(--color-text-secondary)">
            Unassigned
          </span>
        )}
      </div>
    </article>
  );
}

export default TaskCard;