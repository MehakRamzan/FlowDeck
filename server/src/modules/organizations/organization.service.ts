import { prisma } from "../../config/prisma.js";
import type { CreateOrganizationInput, UpdateOrganizationInput } from "./organization.schema.js";

export async function createOrganization(
  userId: string,
  input: CreateOrganizationInput
) {
  const existingOrganization =
    await prisma.organization.findUnique({
      where: {
        slug: input.slug,
      },
    });

  if (existingOrganization) {
    throw new Error(
      "This workspace URL is already taken"
    );
  }

  const organization =
    await prisma.organization.create({
      data: {
        name: input.name,
        slug: input.slug,
        createdById: userId,

        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },

        teams: {
          create: {
            name: "General Team",

            members: {
              create: {
                userId,
              },
            },
          },
        },
      },

      include: {
        members: true,
        teams: true,
      },
    });

  return organization;
}

export async function getUserOrganizations(userId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: {
      userId,
    },

    select: {
      role: true,
      joinedAt: true,

      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
        },
      },
    },

    orderBy: {
      joinedAt: "desc",
    },
  });

  return memberships;
}

export async function getOrganizationForUser(
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

    select: {
      role: true,
      joinedAt: true,

      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!membership) {
    throw new Error("Workspace not found or access denied");
  }

  return membership;
}

export async function getOrganizationMembers(
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

  const members = await prisma.organizationMember.findMany({
    where: {
      organizationId,
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

    orderBy: {
      joinedAt: "asc",
    },
  });

  return members;
}

async function requireOrganizationAdmin(userId: string, organizationId: string, ownerOnly = false) {
  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  if (!membership || (ownerOnly ? membership.role !== "OWNER" : membership.role === "MEMBER")) {
    throw new Error("You do not have permission to manage this workspace");
  }
  return membership;
}

export async function updateOrganization(userId: string, organizationId: string, input: UpdateOrganizationInput) {
  await requireOrganizationAdmin(userId, organizationId);
  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization) throw new Error("Workspace not found");
  if (input.slug && input.slug !== organization.slug) {
    const duplicate = await prisma.organization.findUnique({ where: { slug: input.slug } });
    if (duplicate) throw new Error("This workspace URL is already taken");
  }
  const existingPreferences = (organization.preferences ?? {}) as Record<string, unknown>;
  return prisma.organization.update({
    where: { id: organizationId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.preferences !== undefined && { preferences: { ...existingPreferences, ...input.preferences } }),
    },
  });
}

export async function deleteOrganization(userId: string, organizationId: string) {
  await requireOrganizationAdmin(userId, organizationId, true);
  await prisma.organization.delete({ where: { id: organizationId } });
}

export async function transferOrganizationOwnership(userId: string, organizationId: string, targetUserId: string) {
  await requireOrganizationAdmin(userId, organizationId, true);
  if (targetUserId === userId) throw new Error("You already own this workspace");
  const target = await prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId, userId: targetUserId } } });
  if (!target) throw new Error("User is not a member of this workspace");
  await prisma.$transaction([
    prisma.organizationMember.update({ where: { organizationId_userId: { organizationId, userId } }, data: { role: "ADMIN" } }),
    prisma.organizationMember.update({ where: { organizationId_userId: { organizationId, userId: targetUserId } }, data: { role: "OWNER" } }),
    prisma.organization.update({ where: { id: organizationId }, data: { createdById: targetUserId } }),
  ]);
}

export async function updateOrganizationMemberRole(userId: string, organizationId: string, targetUserId: string, role: "ADMIN" | "MEMBER") {
  await requireOrganizationAdmin(userId, organizationId);
  const target = await prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId, userId: targetUserId } } });
  if (!target) throw new Error("Member not found");
  if (target.role === "OWNER") throw new Error("Transfer ownership before changing the owner's role");
  return prisma.organizationMember.update({ where: { organizationId_userId: { organizationId, userId: targetUserId } }, data: { role } });
}

export async function removeOrganizationMember(userId: string, organizationId: string, targetUserId: string) {
  await requireOrganizationAdmin(userId, organizationId);
  const target = await prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId, userId: targetUserId } } });
  if (!target) throw new Error("Member not found");
  if (target.role === "OWNER") throw new Error("The workspace owner cannot be removed");
  await prisma.$transaction([
    prisma.teamMember.deleteMany({ where: { userId: targetUserId, team: { organizationId } } }),
    prisma.organizationMember.delete({ where: { organizationId_userId: { organizationId, userId: targetUserId } } }),
  ]);
}
