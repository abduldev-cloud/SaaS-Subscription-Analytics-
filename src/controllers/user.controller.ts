import type { Request, Response } from "express";
import { createUser } from "../services/user.service.js";

export async function createUserController(
  req: Request,
  res: Response,
) {
  try {
    const { email, name } = req.body;

    if (typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({
        error: "Valid email is required",
      });
    }

    const user = await createUser({
      email: email.trim(),
      name: typeof name === "string" ? name.trim() : undefined,
    });

    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      error: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}