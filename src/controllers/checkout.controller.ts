import type { Request, Response } from "express";
import { createCheckoutSession } from "../services/checkout.service.js";

export async function createCheckoutController(
  req: Request,
  res: Response,
) {
  try {
    const { userId } = req.body;

    if (
      typeof userId !== "number" ||
      !Number.isInteger(userId)
    ) {
      return res.status(400).json({
        error: "Valid numeric userId is required",
      });
    }

    const session = await createCheckoutSession(userId);

    return res.status(201).json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to create checkout session",
    });
  }
}