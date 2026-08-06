import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma.js";
import jwt from "jsonwebtoken";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

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
      createdAt: true,
    },
  });

  return user;
}

export async function loginUser(input: LoginInput) {
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

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
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
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}