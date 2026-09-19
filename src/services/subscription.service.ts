import { prisma } from "../db/prisma.js";

export async function getUserSubscriptions(userId: number) {
  return prisma.subscription.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}