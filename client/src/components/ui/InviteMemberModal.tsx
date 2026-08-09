import {
  useState,
  type FormEvent,
} from "react";

import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/useAuth";

type InviteMemberModalProps = {
  onClose: () => void;
  onInvited?: () => void | Promise<void>;
};

function InviteMemberModal({
  onClose,
  onInvited,
}: InviteMemberModalProps) {
  const { currentOrganization } = useAuth();

  const [email, setEmail] = useState("");
  const [role, setRole] =
    useState<"ADMIN" | "MEMBER">("MEMBER");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const organizationId =
    currentOrganization?.organization.id;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!organizationId) {
      setError("Workspace not found");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await apiRequest("/invitations", {
        method: "POST",
        body: JSON.stringify({
          email,
          organizationId,
          role,
        }),
      });

      await onInvited?.();

      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send invitation"
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
            Invite member
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-2xl text-(--color-text-secondary)"
          >
            ×
          </button>
        </header>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Invite someone to join your workspace.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="inviteEmail"
              className="mb-2 block text-sm font-semibold"
            >
              Email address
            </label>

            <input
              id="inviteEmail"
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
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
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value as
                    | "ADMIN"
                    | "MEMBER"
                )
              }
              className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none focus:border-(--color-accent)"
            >
              <option value="MEMBER">
                Member
              </option>

              <option value="ADMIN">
                Admin
              </option>
            </select>
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
              disabled={isSubmitting}
              className="rounded-(--radius-md) bg-(--color-primary) px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Sending..."
                : "Send invitation"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default InviteMemberModal;