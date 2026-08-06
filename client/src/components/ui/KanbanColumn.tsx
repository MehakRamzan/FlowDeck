import type { ReactNode } from "react";

type KanbanColumnProps = {
  title: string;
  count: number;
  children: ReactNode;
};

function KanbanColumn({ title, count, children }: KanbanColumnProps) {
  return (
    <section className="w-72 shrink-0 rounded-(--radius-lg) bg-white/50 p-3">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-(--color-text-primary)">
            {title}
          </h2>

          <span className="rounded-full bg-white px-2 py-0.5 text-xs text-(--color-text-secondary)">
            {count}
          </span>
        </div>

        <button className="text-lg text-(--color-text-secondary)">•••</button>
      </header>

      <div className="mt-4 space-y-3">{children}</div>

      <button className="mt-3 w-full rounded-(--radius-md) px-3 py-2 text-left text-sm font-medium text-(--color-text-secondary) hover:bg-white">
        + Add task
      </button>
    </section>
  );
}

export default KanbanColumn;