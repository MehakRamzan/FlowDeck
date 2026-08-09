import type { ReactNode } from "react";

type Props = { title: string; count: number; children: ReactNode; onAddTask?: () => void; onManage?: () => void; onMoveLeft?: () => void; onMoveRight?: () => void };

function KanbanColumn({ title, count, children, onAddTask, onManage, onMoveLeft, onMoveRight }: Props) {
  return <section className="w-80 shrink-0 rounded-(--radius-lg) bg-(--color-background) p-4">
    <header className="flex items-center justify-between"><div className="flex items-center gap-2"><h2 className="font-semibold text-(--color-text-primary)">{title}</h2><span className="rounded-full bg-white px-2 py-0.5 text-xs text-(--color-text-secondary)">{count}</span></div><div className="flex items-center gap-2"><button type="button" aria-label="Move column left" disabled={!onMoveLeft} onClick={onMoveLeft} className="disabled:opacity-30">←</button><button type="button" aria-label="Move column right" disabled={!onMoveRight} onClick={onMoveRight} className="disabled:opacity-30">→</button><button type="button" aria-label="Manage column" onClick={onManage} className="text-lg text-(--color-text-secondary)">•••</button></div></header>
    <div className="mt-4 space-y-3">{children}</div>
    <button type="button" onClick={onAddTask} className="mt-3 w-full rounded-(--radius-md) px-3 py-2 text-left text-sm font-medium text-(--color-text-secondary) hover:bg-white">+ Add task</button>
  </section>;
}

export default KanbanColumn;
