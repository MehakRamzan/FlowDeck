import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma.js";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import { sendAccountEmail } from "../../lib/email.js";
import type { LoginInput, RegisterInput, UpdateProfileInput } from "./auth.schema.js";

export async function registerUser(input: RegisterInput) {
  const email = input.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      emailVerifiedAt: true,
      createdAt: true,
    },
  });

  await sendVerificationEmail(user.id, user.email);
  return user;
}

export async function loginUser(input: LoginInput, device?: { userAgent?: string; ipAddress?: string }) {
  const email = input.email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const session = await prisma.session.create({ data: { userId: user.id, userAgent: device?.userAgent, ipAddress: device?.ipAddress, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      sessionId: session.id,
    },
    jwtSecret,
    {
      expiresIn: "7d",
    }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      emailVerifiedAt: user.emailVerifiedAt,
    },
    token,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      emailVerifiedAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput
) {
  const email = input.email?.toLowerCase();

  if (email) {
    const existingUser = await prisma.user.findFirst({
      where: { email, id: { not: userId } },
      select: { id: true },
    });

    if (existingUser) {
      throw new Error("An account with this email already exists");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(email !== undefined && { email }),
      ...(email !== undefined && { emailVerifiedAt: null }),
      ...(input.avatarUrl !== undefined && {
        avatarUrl: input.avatarUrl || null,
      }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (email !== undefined) await sendVerificationEmail(userId, email);
  return updatedUser;
}

function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
function clientUrl(path: string) { return `${(process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "")}${path}`; }

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return;
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 3600000) } });
  return sendAccountEmail({ to: user.email, subject: "Reset your FlowDeck password", heading: "Reset your password", message: "We received a request to reset your FlowDeck password. This secure link expires in one hour.", actionLabel: "Reset password", actionUrl: clientUrl(`/reset-password?token=${token}`) });
}

export async function resetPassword(token: string, password: string) {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) throw new Error("Invalid or expired reset link");
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.$transaction([prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }), prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }), prisma.session.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } })]);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string, currentSessionId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!await bcrypt.compare(currentPassword, user.passwordHash)) throw new Error("Current password is incorrect");
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([prisma.user.update({ where: { id: userId }, data: { passwordHash } }), prisma.session.updateMany({ where: { userId, id: { not: currentSessionId }, revokedAt: null }, data: { revokedAt: new Date() } })]);
}

export async function sendVerificationEmail(userId: string, email: string) {
  await prisma.emailVerificationToken.deleteMany({ where: { userId, usedAt: null } });
  const token = randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.create({ data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 86400000) } });
  return sendAccountEmail({ to: email, subject: "Verify your FlowDeck email", heading: "Verify your email", message: "Confirm this email address for your FlowDeck account. This link expires in 24 hours.", actionLabel: "Verify email", actionUrl: clientUrl(`/verify-email?token=${token}`) });
}

export async function verifyEmail(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) throw new Error("Invalid or expired verification link");
  await prisma.$transaction([prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }), prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })]);
}

export async function getSessions(userId: string) { return prisma.session.findMany({ where: { userId, revokedAt: null, expiresAt: { gt: new Date() } }, orderBy: { lastSeenAt: "desc" } }); }
export async function revokeSession(userId: string, sessionId: string) { const result = await prisma.session.updateMany({ where: { id: sessionId, userId }, data: { revokedAt: new Date() } }); if (!result.count) throw new Error("Session not found"); }
