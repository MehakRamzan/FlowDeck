import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

type CreateActivityInput = {
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  projectId?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createActivity(
  input: CreateActivityInput
) {
  const activity =
    await prisma.activity.create({
      data: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        userId: input.userId,
        projectId: input.projectId,
        metadata: input.metadata,
      },
    });

  return activity;
}

export async function getProjectActivities(
  userId: string,
  projectId: string
) {
  const project =
    await prisma.project.findUnique({
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

  return prisma.activity.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });
}