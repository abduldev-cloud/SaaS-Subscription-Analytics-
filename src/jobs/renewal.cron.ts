import cron from "node-cron";
import { prisma } from "../db/prisma.js";
import { renewalQueue } from "../queues/renewal.queue.js";

export function startRenewalCron() {
  cron.schedule("* * * * *", async () => {
    console.log("Checking expiring subscriptions...");

    const now = new Date();

    const threeDaysLater = new Date(
      now.getTime() + 3 * 24 * 60 * 60 * 1000,
    );

    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: now,
          lte: threeDaysLater,
        },
      },
    });

    for (const subscription of subscriptions) {
      await renewalQueue.add(
        "renewal-reminder",
        {
          subscriptionId: subscription.id,
        },
        {
          jobId: `renewal-${subscription.id}`,
        },
      );
    }

    console.log(
      `Found ${subscriptions.length} expiring subscription(s)`,
    );
  });
}