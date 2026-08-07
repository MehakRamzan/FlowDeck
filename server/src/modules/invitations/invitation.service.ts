import { randomBytes } from "node:crypto";
import { prisma } from "../../config/prisma.js";
import type {
  AcceptInvitationInput,
  CreateInvitationInput,
} from "./invitation.schema.js";


export async function createInvitation(
  currentUserId: string,
  input: CreateInvitationInput
) {
  const email = input.email.toLowerCase();

  const currentUserMembership =
    await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: input.organizationId,
          userId: currentUserId,
        },
      },
    });

  if (!currentUserMembership) {
    throw new Error("Workspace not found or access denied");
  }

  if (currentUserMembership.role === "MEMBER") {
    throw new Error("You do not have permission to invite members");
  }

  const existingMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId: input.organizationId,
      user: {
        email,
      },
    },
  });

  if (existingMember) {
    throw new Error("User is already a member of this workspace");
  }

  const existingInvitation = await prisma.invitation.findFirst({
    where: {
      organizationId: input.organizationId,
      email,
      acceptedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (existingInvitation) {
    throw new Error("An active invitation already exists for this email");
  }

  const token = randomBytes(32).toString("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await prisma.invitation.create({
    data: {
      email,
      organizationId: input.organizationId,
      invitedById: currentUserId,
      role: input.role,
      token,
      expiresAt,
    },

    select: {
      id: true,
      email: true,
      role: true,
      token: true,
      expiresAt: true,
      createdAt: true,
      organizationId: true,
    },
  });

  return invitation;
}


export async function acceptInvitation(
  currentUserId: string,
  input: AcceptInvitationInput
) {
  const invitation = await prisma.invitation.findUnique({
    where: {
      token: input.token,
    },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.acceptedAt) {
    throw new Error("Invitation has already been accepted");
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error("Invitation has expired");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: currentUserId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new Error("This invitation belongs to a different email");
  }

  const existingMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: invitation.organizationId,
        userId: currentUserId,
      },
    },
  });

  if (existingMembership) {
    throw new Error("You are already a member of this workspace");
  }

  const result = await prisma.$transaction(async (tx) => {
    const membership = await tx.organizationMember.create({
      data: {
        organizationId: invitation.organizationId,
        userId: currentUserId,
        role: invitation.role,
      },
    });

    await tx.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        acceptedAt: new Date(),
      },
    });

    return membership;
  });

  return result;
}