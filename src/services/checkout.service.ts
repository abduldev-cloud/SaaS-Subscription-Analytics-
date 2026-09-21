import { prisma } from "../db/prisma.js";
import { stripe } from "../config/stripe.js";

export async function createCheckoutSession(userId: number) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",

    customer_email: user.email,

    metadata: {
      userId: String(userId)
    },

    subscription_data: {
      metadata: {
        userId: String(userId),
      },
    },

    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Pro Monthly",
            description: "Monthly SaaS subscription",
          },
          unit_amount: 999,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],

    success_url: "http://localhost:5000/success",
    cancel_url: "http://localhost:5000/cancel",
  });

  return session;
}