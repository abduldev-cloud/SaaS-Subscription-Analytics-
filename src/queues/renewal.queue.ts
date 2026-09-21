import { Queue } from "bullmq";
import {Redis} from "ioredis";
import { env } from "../config/env.js";

const connection = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null,
});

export const renewalQueue = new Queue("renewal-reminders", {
  connection,
});