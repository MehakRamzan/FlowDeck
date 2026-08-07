import { prisma } from "../../config/prisma.js";
import type { CreateOrganizationInput } from "./organization.schema.js";

export async function createOrganization(
  userId: string,
  input: CreateOrganizationInput
) {
  const existingOrganization = await prisma.organization.findUnique({
    where: {
      slug: input.slug,
    },
  });

  if (existingOrganization) {
    throw new Error("This workspace URL is already taken");
  }

  const organization = await prisma.organization.create({
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
    },

    include: {
      members: true,
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