import { prisma } from "../db/prisma.js";

interface CreateUserInput {
  email: string;
  name?: string;
}

export async function createUser(input: CreateUserInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      ...(input.name !== undefined && {
        name: input.name,
      }),
    },
  });

  return user;
}