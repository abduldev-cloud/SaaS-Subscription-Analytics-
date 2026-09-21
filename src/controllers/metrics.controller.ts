import type { Request, Response } from "express";
import { getPlatformMetrics } from "../services/metrics.service.js";

export async function getMetrics(
  _req: Request,
  res: Response,
) {
  const metrics = await getPlatformMetrics();

  return res.json(metrics);
}