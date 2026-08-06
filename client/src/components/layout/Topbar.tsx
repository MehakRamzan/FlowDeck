type TopbarProps = {
  onMenuClick: () => void;
};

function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-(--color-border) bg-white px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="text-2xl text-(--color-primary) lg:hidden"
        >
          ☰
        </button>

        <div className="font-(--font-heading) text-xl font-bold text-(--color-primary) lg:hidden">
          FlowDeck
        </div>

        <div className="hidden text-sm text-(--color-text-secondary) sm:block lg:block">
          Search tasks and projects...
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-(--radius-md) bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white">
          + Create
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-highlight) font-semibold text-(--color-primary)">
          MR
        </div>
      </div>
    </header>
  );
}

export default Topbar;