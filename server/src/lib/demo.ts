export const DEMO_WORKSPACE_SLUG = "pixora-demo";

export const DEMO_ACCOUNTS = {
  owner: {
    name: "Pixora Demo Owner",
    email: "demo.owner@flowdeck.app",
  },
  admin: {
    name: "Alex Morgan",
    email: "demo.admin@flowdeck.app",
  },
  member: {
    name: "Jordan Lee",
    email: "demo.member@flowdeck.app",
  },
} as const;

const publicDemoEmails = new Set<string>([
  DEMO_ACCOUNTS.admin.email,
  DEMO_ACCOUNTS.member.email,
]);

export function isPublicDemoEmail(email: string): boolean {
  return publicDemoEmails.has(email.toLowerCase());
}
