import { prisma } from "../db/prisma.js";
import { redis } from "../cache/redis.js";

const CACHE_KEY = "platform:metrics";
const CACHE_TTL = 180;

export async function getPlatformMetrics() {
  const cached = await redis.get(CACHE_KEY);

  if (cached) {
    console.log("Metrics cache HIT");
    return JSON.parse(cached);
  }

  console.log("Metrics cache MISS");

  const activeSubscribers = await prisma.subscription.count({
    where: {
      status: "ACTIVE",
    },
  });

  const revenue = await prisma.payment.aggregate({
    where: {
      status: "SUCCEEDED",
    },
    _sum: {
      amount: true,
    },
  });

  const metrics = {
    activeSubscribers,
    simulatedRevenue: (revenue._sum.amount ?? 0) / 100,
  };

  await redis.set(CACHE_KEY, JSON.stringify(metrics), {
    EX: CACHE_TTL,
  });

  return metrics;
}