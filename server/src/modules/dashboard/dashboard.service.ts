import { prisma } from "../../config/prisma.js";

export async function getProjectDashboard(
  userId: string,
  projectId: string
) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      team: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const membership =
    await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId:
            project.team.organizationId,
          userId,
        },
      },
    });

  if (!membership) {
    throw new Error(
      "You do not belong to this workspace"
    );
  }

  const [
    totalTasks,
    totalComments,
    totalActivities,
    completedTasks,
  ] = await Promise.all([
    prisma.task.count({
      where: {
        projectId,
      },
    }),

    prisma.comment.count({
      where: {
        task: {
          projectId,
        },
      },
    }),

    prisma.activity.count({
      where: {
        projectId,
      },
    }),

    prisma.task.count({
      where: {
        projectId,
        column: {
          name: {
            equals: "Done",
            mode: "insensitive",
          },
        },
      },
    }),
  ]);

  return {
    projectId,
    totalTasks,
    completedTasks,
    totalComments,
    totalActivities,
  };
}