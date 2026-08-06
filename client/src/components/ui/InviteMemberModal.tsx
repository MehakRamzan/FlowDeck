type InviteMemberModalProps = {
  onClose: () => void;
};

function InviteMemberModal({ onClose }: InviteMemberModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <section className="w-full max-w-md rounded-(--radius-xl) bg-white p-6 shadow-(--shadow-lg)">
        <header className="flex items-center justify-between">
          <h2 className="font-(--font-heading) text-2xl font-bold">
            Invite a member
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close invite modal"
            className="text-2xl text-(--color-text-secondary)"
          >
            ×
          </button>
        </header>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Invite someone to join your FlowDeck workspace.
        </p>

        <form className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="inviteEmail"
              className="mb-2 block text-sm font-semibold"
            >
              Email address
            </label>

            <input
              id="inviteEmail"
              name="inviteEmail"
              type="email"
              placeholder="name@company.com"
              className="w-full rounded-(--radius-md) border border-(--color-border) px-4 py-3 outline-none focus:border-(--color-accent)"
            />
          </div>

          <div>
            <label
              htmlFor="inviteRole"
              className="mb-2 block text-sm font-semibold"
            >
              Role
            </label>

            <select
              id="inviteRole"
              name="inviteRole"
              className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none focus:border-(--color-accent)"
            >
              <option>Member</option>
              <option>Admin</option>
            </select>
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
              Send invitation
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default InviteMemberModal;