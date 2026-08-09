import { prisma } from "../../config/prisma.js";
import { createActivity } from "../activities/activity.service.js";

type CreateProjectInput = {
  name: string;
  description?: string;
};

type UpdateProjectInput = {
  name?: string;
  description?: string | null;
  teamId?: string;
};

export async function createProject(
  userId: string,
  teamId: string,
  input: CreateProjectInput
) {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    include: {
      organization: true,
    },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: team.organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new Error("You do not belong to this workspace");
  }

  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      teamId,
    },
  });

  await prisma.boardColumn.createMany({
  data: [
    {
      name: "To Do",
      position: 0,
      projectId: project.id,
    },
    {
      name: "In Progress",
      position: 1,
      projectId: project.id,
    },
    {
      name: "Done",
      position: 2,
      projectId: project.id,
    },
  ],
});

  await createActivity({
  action: "CREATED",
  entity: "PROJECT",
  entityId: project.id,
  userId,
  projectId: project.id,
});

  return project;
}

export async function getTeamProjects(
  userId: string,
  teamId: string
) {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: team.organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new Error("You do not belong to this workspace");
  }

  const projects = await prisma.project.findMany({
    where: {
      teamId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects;
}

export async function getProjectById(
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

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: project.team.organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new Error("You do not belong to this workspace");
  }

  return project;
}

export async function updateProject(
  userId: string,
  projectId: string,
  input: UpdateProjectInput
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

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: project.team.organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new Error("You do not belong to this workspace");
  }

  if (input.teamId && input.teamId !== project.teamId) {
    const targetTeam = await prisma.team.findUnique({ where: { id: input.teamId } });
    if (!targetTeam || targetTeam.organizationId !== project.team.organizationId) {
      throw new Error("Target team must belong to the same workspace");
    }
  }

  const updatedProject = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      ...(input.name !== undefined && {
        name: input.name,
      }),

      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.teamId !== undefined && { teamId: input.teamId }),
    },
  });

  await createActivity({
  action: "UPDATED",
  entity: "PROJECT",
  entityId: updatedProject.id,
  userId,
  projectId: updatedProject.id,
});

  return updatedProject;
}

export async function deleteProject(
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

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: project.team.organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new Error("You do not belong to this workspace");
  }

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  await createActivity({
  action: "DELETED",
  entity: "PROJECT",
  entityId: projectId,
  userId,
  projectId,
});
}
