import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";
import { redis } from "./cache/redis.js";
import { renewalWorker } from "./workers/renewal.worker.js";
import { startRenewalCron } from "./jobs/renewal.cron.js";

async function startServer() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected");

    await redis.connect();
    console.log("Redis connected");

    startRenewalCron();
    console.log("Renewal cron started");

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();