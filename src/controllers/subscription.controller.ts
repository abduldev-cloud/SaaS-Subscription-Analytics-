import type { Request, Response } from "express";
import { getUserSubscriptions } from "../services/subscription.service.js";

export async function getUserSubscriptionsController(
  req: Request,
  res: Response,
) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: "User ID is required",
      });
    }

    const parsedUserId = Number(userId);

    if (!Number.isInteger(parsedUserId)) {
      return res.status(400).json({
        error: "User ID must be a valid number",
      });
    }

    const subscriptions = await getUserSubscriptions(parsedUserId);

    return res.status(200).json({
      subscriptions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to fetch subscriptions",
    });
  }
}