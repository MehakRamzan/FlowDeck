import "dotenv/config";
import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "../src/config/prisma.js";
import {
  DEMO_ACCOUNTS,
  DEMO_WORKSPACE_SLUG,
} from "../src/lib/demo.js";

const DEMO_PASSWORD = "FlowDeckDemo2026!";

type AccountKey = keyof typeof DEMO_ACCOUNTS;
type DemoStatus = "Backlog" | "To Do" | "In Progress" | "In Review" | "Done";

type DemoTask = {
  title: string;
  description: string;
  status: DemoStatus;
  assignee: AccountKey;
  dueInDays: number;
};

type DemoProject = {
  name: string;
  description: string;
  team: "Creative Studio" | "Growth Lab" | "Product Crew";
  tasks: DemoTask[];
};

const projects: DemoProject[] = [
  {
    name: "Website Redesign",
    team: "Creative Studio",
    description:
      "Redesign Pixora's website with a modern visual system, clearer positioning, and a conversion-focused experience.",
    tasks: [
      { title: "Audit the current website", description: "Review navigation, content hierarchy, performance, and conversion gaps across the existing website.", status: "Done", assignee: "admin", dueInDays: -5 },
      { title: "Create homepage wireframes", description: "Create desktop and mobile wireframes covering the hero, services, proof, process, and final CTA.", status: "Done", assignee: "member", dueInDays: -3 },
      { title: "Design hero section concepts", description: "Prepare three production-quality hero concepts with strong messaging, supporting visuals, and motion direction.", status: "In Review", assignee: "owner", dueInDays: 2 },
      { title: "Build responsive navigation", description: "Implement an accessible navigation system with responsive menus, active states, and smooth transitions.", status: "In Progress", assignee: "member", dueInDays: 4 },
      { title: "Write service page content", description: "Write clear, outcome-focused copy for design, development, and growth service pages.", status: "To Do", assignee: "admin", dueInDays: 7 },
      { title: "Complete mobile QA", description: "Review layouts across common mobile widths and document any remaining responsive issues.", status: "Backlog", assignee: "member", dueInDays: 11 },
    ],
  },
  {
    name: "Autumn Growth Campaign",
    team: "Growth Lab",
    description:
      "Launch a multi-channel campaign that generates qualified leads for Pixora's design and development services.",
    tasks: [
      { title: "Define campaign audience", description: "Document priority segments, decision-maker profiles, pain points, objections, and desired outcomes.", status: "Done", assignee: "admin", dueInDays: -4 },
      { title: "Prepare campaign messaging", description: "Create the central campaign narrative, value propositions, proof points, and CTA variations.", status: "In Review", assignee: "owner", dueInDays: 1 },
      { title: "Design social media assets", description: "Produce launch graphics, carousel templates, testimonial cards, and short-form video covers.", status: "In Progress", assignee: "member", dueInDays: 3 },
      { title: "Write five LinkedIn posts", description: "Write five educational posts covering process, results, lessons learned, and the campaign offer.", status: "In Progress", assignee: "admin", dueInDays: 5 },
      { title: "Build email nurture sequence", description: "Create four emails covering introduction, customer pain, Pixora's approach, and consultation CTA.", status: "To Do", assignee: "admin", dueInDays: 8 },
      { title: "Create performance report", description: "Build a report for reach, engagement, leads, conversion rate, and channel-level performance.", status: "Backlog", assignee: "owner", dueInDays: 15 },
    ],
  },
  {
    name: "Client Portal MVP",
    team: "Product Crew",
    description:
      "Build a client portal where customers can follow progress, review deliverables, and share contextual feedback.",
    tasks: [
      { title: "Finalize MVP requirements", description: "Confirm the release scope, core user journeys, exclusions, assumptions, and acceptance criteria.", status: "Done", assignee: "owner", dueInDays: -6 },
      { title: "Create database structure", description: "Model clients, projects, deliverables, revisions, feedback threads, and notification preferences.", status: "Done", assignee: "member", dueInDays: -2 },
      { title: "Design portal dashboard", description: "Design the project summary, milestone progress, recent activity, and pending review sections.", status: "In Review", assignee: "owner", dueInDays: 3 },
      { title: "Implement authentication", description: "Implement secure authentication, session handling, protected routes, and account recovery.", status: "In Progress", assignee: "member", dueInDays: 6 },
      { title: "Build feedback workflow", description: "Allow clients to review deliverables, add feedback, and track requested revisions through completion.", status: "In Progress", assignee: "admin", dueInDays: 9 },
      { title: "Perform release testing", description: "Test primary journeys, permissions, responsive layouts, empty states, and failure handling before launch.", status: "To Do", assignee: "admin", dueInDays: 13 },
    ],
  },
  {
    name: "Brand Identity Refresh",
    team: "Creative Studio",
    description:
      "Refresh Pixora's identity and create a consistent visual system for product, marketing, and social channels.",
    tasks: [
      { title: "Research competitor identities", description: "Review adjacent studios and document visual patterns, opportunities, and differentiation territories.", status: "Done", assignee: "member", dueInDays: -3 },
      { title: "Define visual direction", description: "Create moodboards for typography, color, composition, photography, illustration, and motion.", status: "In Review", assignee: "owner", dueInDays: 2 },
      { title: "Refine logo variations", description: "Prepare primary, compact, monochrome, and small-scale variations with clear-space guidance.", status: "In Progress", assignee: "member", dueInDays: 5 },
      { title: "Select typography system", description: "Choose display and body typefaces and define a responsive hierarchy for product and marketing use.", status: "In Progress", assignee: "owner", dueInDays: 7 },
      { title: "Create social templates", description: "Create reusable templates for launches, case studies, insights, testimonials, and hiring posts.", status: "To Do", assignee: "admin", dueInDays: 10 },
      { title: "Prepare brand guidelines", description: "Document logo, color, type, imagery, illustration, motion, and practical application examples.", status: "Backlog", assignee: "owner", dueInDays: 16 },
    ],
  },
];

function dueDate(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function main() {
  const publicPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const ownerPasswordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
  const verifiedAt = new Date();

  const accountEntries = await Promise.all(
    (Object.entries(DEMO_ACCOUNTS) as [AccountKey, (typeof DEMO_ACCOUNTS)[AccountKey]][]).map(
      async ([key, account]) => {
        const user = await prisma.user.upsert({
          where: { email: account.email },
          update: {
            name: account.name,
            passwordHash: key === "owner" ? ownerPasswordHash : publicPasswordHash,
            emailVerifiedAt: verifiedAt,
          },
          create: {
            name: account.name,
            email: account.email,
            passwordHash: key === "owner" ? ownerPasswordHash : publicPasswordHash,
            emailVerifiedAt: verifiedAt,
          },
        });
        return [key, user] as const;
      }
    )
  );

  const users = Object.fromEntries(accountEntries) as Record<
    AccountKey,
    (typeof accountEntries)[number][1]
  >;

  await prisma.session.deleteMany({
    where: { userId: { in: Object.values(users).map((user) => user.id) } },
  });
  await prisma.organization.deleteMany({
    where: { slug: DEMO_WORKSPACE_SLUG },
  });

  const organization = await prisma.organization.create({
    data: {
      name: "Pixora Demo",
      slug: DEMO_WORKSPACE_SLUG,
      createdById: users.owner.id,
      preferences: {
        description:
          "A digital product studio managing creative, growth, and product delivery in one collaborative workspace.",
      },
      members: {
        create: [
          { userId: users.owner.id, role: "OWNER" },
          { userId: users.admin.id, role: "ADMIN" },
          { userId: users.member.id, role: "MEMBER" },
        ],
      },
    },
  });

  const teamDefinitions = [
    { name: "Creative Studio", members: [users.owner.id, users.member.id] },
    { name: "Growth Lab", members: [users.admin.id, users.member.id] },
    { name: "Product Crew", members: [users.owner.id, users.admin.id, users.member.id] },
  ];

  const teamEntries = await Promise.all(
    teamDefinitions.map(async (team) => {
      const created = await prisma.team.create({
        data: {
          name: team.name,
          organizationId: organization.id,
          members: {
            create: team.members.map((userId) => ({ userId })),
          },
        },
      });
      return [team.name, created] as const;
    })
  );
  const teams = Object.fromEntries(teamEntries);

  const createdTasks: Array<{
    id: string;
    title: string;
    projectId: string;
    assigneeId: string | null;
  }> = [];

  for (const projectDefinition of projects) {
    const project = await prisma.project.create({
      data: {
        name: projectDefinition.name,
        description: projectDefinition.description,
        teamId: teams[projectDefinition.team].id,
      },
    });

    const statusNames: DemoStatus[] = [
      "Backlog",
      "To Do",
      "In Progress",
      "In Review",
      "Done",
    ];
    await prisma.boardColumn.createMany({
      data: statusNames.map((name, position) => ({
        name,
        position,
        projectId: project.id,
      })),
    });
    const columns = await prisma.boardColumn.findMany({
      where: { projectId: project.id },
    });
    const columnIds = Object.fromEntries(
      columns.map((column) => [column.name, column.id])
    );

    for (const [position, taskDefinition] of projectDefinition.tasks.entries()) {
      const task = await prisma.task.create({
        data: {
          title: taskDefinition.title,
          description: taskDefinition.description,
          position,
          projectId: project.id,
          columnId: columnIds[taskDefinition.status],
          creatorId: users.owner.id,
          assigneeId: users[taskDefinition.assignee].id,
          dueDate: dueDate(taskDefinition.dueInDays),
        },
      });
      createdTasks.push(task);
      await prisma.activity.create({
        data: {
          action: taskDefinition.status === "Done" ? "COMPLETED" : "UPDATED",
          entity: "TASK",
          entityId: task.id,
          userId: users[taskDefinition.assignee].id,
          projectId: project.id,
          metadata: { status: taskDefinition.status },
        },
      });
    }
  }

  const commentSamples = [
    "The direction looks strong. Let's simplify the mobile version before final approval.",
    "Copy is ready for review. I included two CTA variations for the team to compare.",
    "The primary flow is working. I'll move this to review after responsive QA.",
    "Please use the updated coral accent from the latest visual direction.",
    "Great progress. The final polish should focus on spacing and empty states.",
  ];

  for (const [index, task] of createdTasks.slice(2, 7).entries()) {
    await prisma.comment.create({
      data: {
        content: commentSamples[index],
        taskId: task.id,
        authorId: index % 2 === 0 ? users.admin.id : users.member.id,
      },
    });
  }

  await prisma.notification.createMany({
    data: [
      {
        type: "TASK_ASSIGNED",
        title: "New task assigned",
        message: "You were assigned to Build feedback workflow in Client Portal MVP.",
        link: "/my-tasks",
        userId: users.admin.id,
      },
      {
        type: "COMMENT_ADDED",
        title: "New feedback received",
        message: "Jordan left feedback on the website hero concepts.",
        link: "/my-tasks",
        userId: users.admin.id,
      },
      {
        type: "TASK_ASSIGNED",
        title: "New task assigned",
        message: "You were assigned to Implement authentication in Client Portal MVP.",
        link: "/my-tasks",
        userId: users.member.id,
      },
    ],
  });

  console.log("Pixora Demo workspace is ready.");
  console.log(`Admin:  ${DEMO_ACCOUNTS.admin.email} / ${DEMO_PASSWORD}`);
  console.log(`Member: ${DEMO_ACCOUNTS.member.email} / ${DEMO_PASSWORD}`);
  console.log(`Workspace: ${organization.name} (${organization.slug})`);
  console.log(`Projects: ${projects.length}; Tasks: ${createdTasks.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
