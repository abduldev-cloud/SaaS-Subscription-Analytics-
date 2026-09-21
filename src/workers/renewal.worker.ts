import { Worker } from "bullmq";
import {Redis} from "ioredis";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { sendInvoiceEmail } from "../services/email.service.js";
  
const connection = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null,
});

export const renewalWorker = new Worker(
  "renewal-reminders",
  async (job) => {
    const { subscriptionId } = job.data;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    await sendInvoiceEmail({
      to: subscription.user.email,
      customerName: subscription.user.name ?? "Customer",
      plan: subscription.plan,
      amount: 999,
      currency: "usd",
      invoiceNumber: `RENEWAL-${subscription.id}`,
    });

    console.log(
      `Renewal reminder sent: ${subscription.user.email}`,
    );
  },
  {
    connection: {
      url: env.redisUrl,
    },
  },
);

renewalWorker.on("completed", (job) => {
  console.log(`Renewal job completed: ${job.id}`);
});

renewalWorker.on("failed", (job, error) => {
  console.error(`Renewal job failed: ${job?.id}`, error);
});