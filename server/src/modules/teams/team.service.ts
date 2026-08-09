import { prisma } from "../../config/prisma.js";
import type {
  AddTeamMemberInput,
  CreateTeamInput,
} from "./team.schema.js";

export async function createTeam(
  userId: string,
  input: CreateTeamInput
) {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: input.organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new Error("Workspace not found or access denied");
  }

  if (membership.role === "MEMBER") {
    throw new Error("You do not have permission to create teams");
  }

  const team = await prisma.team.create({
    data: {
      name: input.name,
      organizationId: input.organizationId,

      members: {
        create: {
          userId,
        },
      },
    },

    include: {
      members: true,
    },
  });

  return team;
}

export async function getTeamsByOrganization(
  userId: string,
  organizationId: string
) {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new Error("Workspace not found or access denied");
  }

  const teams = await prisma.team.findMany({
    where: {
      organizationId,
    },

    include: {
      members: {
        select: {
          userId: true,
          joinedAt: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return teams;
}

export async function getTeamById(
  userId: string,
  teamId: string
) {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },

    include: {
      members: {
        select: {
          userId: true,
          joinedAt: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
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
    throw new Error("Team not found or access denied");
  }

  return team;
}

export async function addTeamMember(
  currentUserId: string,
  teamId: string,
  input: AddTeamMemberInput
) {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    select: {
      id: true,
      organizationId: true,
    },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  const currentUserMembership =
    await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: team.organizationId,
          userId: currentUserId,
        },
      },
    });

  if (!currentUserMembership) {
    throw new Error("Team not found or access denied");
  }

  if (currentUserMembership.role === "MEMBER") {
    throw new Error("You do not have permission to add team members");
  }

  const targetUserMembership =
    await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: team.organizationId,
          userId: input.userId,
        },
      },
    });

  if (!targetUserMembership) {
    throw new Error("User is not a member of this workspace");
  }

  const existingTeamMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: input.userId,
      },
    },
  });

  if (existingTeamMember) {
    throw new Error("User is already a member of this team");
  }

  const teamMember = await prisma.teamMember.create({
    data: {
      teamId,
      userId: input.userId,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  return teamMember;
}

async function requireTeamAdmin(userId: string, teamId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new Error("Team not found");
  const membership = await prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId: team.organizationId, userId } } });
  if (!membership || membership.role === "MEMBER") throw new Error("You do not have permission to manage this team");
  return team;
}

export async function updateTeam(userId: string, teamId: string, name: string) {
  await requireTeamAdmin(userId, teamId);
  return prisma.team.update({ where: { id: teamId }, data: { name } });
}

export async function deleteTeam(userId: string, teamId: string) {
  await requireTeamAdmin(userId, teamId);
  await prisma.team.delete({ where: { id: teamId } });
}

export async function removeTeamMember(userId: string, teamId: string, targetUserId: string) {
  await requireTeamAdmin(userId, teamId);
  const result = await prisma.teamMember.deleteMany({ where: { teamId, userId: targetUserId } });
  if (!result.count) throw new Error("Team member not found");
}
