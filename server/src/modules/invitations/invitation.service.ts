import { randomBytes } from "node:crypto";
import { prisma } from "../../config/prisma.js";
import { sendInvitationEmail } from "../../lib/email.js";
import type {
  AcceptInvitationInput,
  CreateInvitationInput,
} from "./invitation.schema.js";

function buildAcceptInviteUrl(token: string): string {
  const base = process.env.CLIENT_URL || "http://localhost:5173";
  const trimmed = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${trimmed}/accept-invitation/${token}`;
}

export async function previewInvitation(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      organization: { select: { id: true, name: true } },
      invitedBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!invitation) {
    return {
      exists: false,
      valid: false,
      accepted: false,
      expired: false,
      errorCode: "NOT_FOUND" as const,
    };
  }

  const now = new Date();
  const expired = invitation.expiresAt < now;
  const accepted = invitation.acceptedAt !== null;
  const valid = !expired && !accepted;

  return {
    exists: true,
    valid,
    accepted,
    expired,
    email: invitation.email,
    role: invitation.role,
    organizationName: invitation.organization?.name,
    organizationId: invitation.organization?.id,
    invitedByName: invitation.invitedBy?.name || null,
    invitedByEmail: invitation.invitedBy?.email || null,
  };
}

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

  const inviter = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { id: true, name: true, email: true },
  });

  if (!inviter) {
    throw new Error("Inviter not found");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: input.organizationId },
    select: { id: true, name: true },
  });

  if (!organization) {
    throw new Error("Workspace not found");
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

  const acceptUrl = buildAcceptInviteUrl(invitation.token);

  const delivery = await sendInvitationEmail({
    recipientEmail: invitation.email,
    recipientName: null,
    inviterName: inviter.name || inviter.email,
    inviterEmail: inviter.email,
    organizationName: organization.name,
    role: invitation.role,
    inviteToken: invitation.token,
    acceptInviteUrl: acceptUrl,
  });

  return { ...invitation, emailSent: delivery.sent };
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

async function requireInvitationAdmin(userId: string, organizationId: string) {
  const membership = await prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId, userId } } });
  if (!membership || membership.role === "MEMBER") throw new Error("You do not have permission to manage invitations");
}

export async function listInvitations(userId: string, organizationId: string) {
  await requireInvitationAdmin(userId, organizationId);
  return prisma.invitation.findMany({
    where: { organizationId, acceptedAt: null },
    select: { id: true, email: true, role: true, expiresAt: true, createdAt: true, invitedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeInvitation(userId: string, invitationId: string) {
  const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } });
  if (!invitation) throw new Error("Invitation not found");
  await requireInvitationAdmin(userId, invitation.organizationId);
  await prisma.invitation.delete({ where: { id: invitationId } });
}

export async function resendInvitation(userId: string, invitationId: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { organization: true, invitedBy: true },
  });
  if (!invitation) throw new Error("Invitation not found");
  await requireInvitationAdmin(userId, invitation.organizationId);
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const updated = await prisma.invitation.update({ where: { id: invitationId }, data: { token, expiresAt, invitedById: userId } });
  const sender = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const result = await sendInvitationEmail({
    recipientEmail: updated.email,
    inviterName: sender.name,
    inviterEmail: sender.email,
    organizationName: invitation.organization.name,
    role: updated.role,
    inviteToken: token,
    acceptInviteUrl: buildAcceptInviteUrl(token),
  });
  return { invitation: updated, emailSent: result.sent };
}
