import AppLayout from "../components/layout/AppLayout";
import { useState } from "react";
import InviteMemberModal from "../components/ui/InviteMemberModal";

const members = [
  {
    name: "Mehak Ramzan",
    email: "mehak@flowdeck.com",
    initials: "MR",
    role: "Owner",
  },
  {
    name: "Sara Khan",
    email: "sara@flowdeck.com",
    initials: "SK",
    role: "Admin",
  },
  {
    name: "Ali Ahmed",
    email: "ali@flowdeck.com",
    initials: "AA",
    role: "Member",
  },
];

function MembersPage() {

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  return (

 
    <AppLayout>
      <div className="p-6 lg:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-(--font-heading) text-3xl font-bold">
              Members
            </h1>

            <p className="mt-2 text-(--color-text-secondary)">
              Manage people and access in your workspace.
            </p>
          </div>

          <button
  type="button"
  onClick={() => setIsInviteModalOpen(true)}
  className="rounded-(--radius-md) bg-(--color-primary) px-4 py-3 text-sm font-semibold text-white"
>
  + Invite Member
</button>
        </header>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <input
            type="search"
            placeholder="Search members..."
            className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none focus:border-(--color-accent) sm:max-w-sm"
          />

          <select className="rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 outline-none">
            <option>All roles</option>
            <option>Owner</option>
            <option>Admin</option>
            <option>Member</option>
          </select>
        </div>

        <section className="mt-6 overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-white shadow-(--shadow-sm)">
          <div className="hidden grid-cols-[2fr_2fr_1fr_auto] gap-4 border-b border-(--color-border) px-6 py-4 text-sm font-semibold text-(--color-text-secondary) md:grid">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Actions</span>
          </div>

          {members.map((member) => (
            <article
              key={member.email}
              className="grid gap-4 border-b border-(--color-border) p-5 last:border-b-0 md:grid-cols-[2fr_2fr_1fr_auto] md:items-center md:px-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-highlight) text-sm font-semibold text-(--color-primary)">
                  {member.initials}
                </span>

                <span className="font-semibold">{member.name}</span>
              </div>

              <span className="text-sm text-(--color-text-secondary)">
                {member.email}
              </span>

              <span className="w-fit rounded-full bg-(--color-background) px-3 py-1 text-sm font-medium">
                {member.role}
              </span>

              <button className="w-fit text-xl text-(--color-text-secondary)">
                •••
              </button>
            </article>
          ))}
        </section>

        <section className="mt-8">
          <h2 className="font-(--font-heading) text-xl font-bold">
            Pending Invitations
          </h2>

          <div className="mt-4 rounded-(--radius-lg) border border-(--color-border) bg-white p-5 shadow-(--shadow-sm)">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">ahmad@example.com</p>
                <p className="mt-1 text-sm text-(--color-text-secondary)">
                  Member · Invitation sent recently
                </p>
              </div>

              <div className="flex gap-4">
                <button className="text-sm font-semibold text-(--color-accent)">
                  Resend
                </button>

                <button className="text-sm font-semibold text-(--color-danger)">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {isInviteModalOpen && (
  <InviteMemberModal onClose={() => setIsInviteModalOpen(false)} />
)}

    </AppLayout>
  );
}

export default MembersPage;