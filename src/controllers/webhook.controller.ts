import type { Request, Response } from "express";
import { stripe } from "../config/stripe.js";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { generateInvoicePdf } from "../services/invoice.service.js";
import { sendInvoiceEmail } from "../services/email.service.js";

export async function stripeWebhookController(
  req: Request,
  res: Response,
) {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).json({
      error: "Missing Stripe signature",
    });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.stripeWebhookSecret,
    );

    console.log("Stripe event received:", event.type);

    // Prevent duplicate processing
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: {
        stripeEventId: event.id,
      },
    });

    if (existingEvent) {
      console.log("Webhook already processed:", event.id);

      return res.status(200).json({
        received: true,
      });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = Number(session.metadata?.userId);

      if (!Number.isInteger(userId)) {
        throw new Error("Invalid userId in Stripe metadata");
      }

      if (typeof session.subscription !== "string") {
        throw new Error("Stripe subscription ID is missing");
      }

      const subscriptionResponse = await stripe.subscriptions.retrieve(
        session.subscription,
    );

      const subscription = await stripe.subscriptions.retrieve(
    session.subscription,
    );

    const subscriptionItem = subscription.items.data[0];

    if (!subscriptionItem) {
    throw new Error("Stripe subscription item is missing");
    }

      const stripeCustomerId =
        typeof session.customer === "string"
          ? session.customer
          : null;

      await prisma.subscription.upsert({
        where: {
          stripeSubscriptionId: subscription.id,
        },
        update: {
          stripeCustomerId,
          plan: "Pro Monthly",
          status: "ACTIVE",
        startDate: new Date(subscriptionItem.current_period_start * 1000),
        endDate: new Date(subscriptionItem.current_period_end * 1000),
        },
        create: {
          userId,
          stripeCustomerId,
          stripeSubscriptionId: subscription.id,
          plan: "Pro Monthly",
          status: "ACTIVE",
          startDate: new Date(subscriptionItem.current_period_start * 1000),
          endDate: new Date(subscriptionItem.current_period_end * 1000),
        },
      });

      console.log(
        "Subscription saved:",
        subscription.id,
      );
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object;

      const stripeSubscriptionId =
    invoice.parent?.subscription_details?.subscription;

  if (typeof stripeSubscriptionId !== "string") {
    throw new Error("Invoice subscription ID is missing");
  }

  let subscription = await prisma.subscription.findUnique({
      where: {
        stripeSubscriptionId,
      },
    });

    if (!subscription) {
      console.log(
        "Subscription not found yet. Waiting for checkout webhook...",
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      subscription = await prisma.subscription.findUnique({
        where: {
          stripeSubscriptionId,
        },
      });
    }

    if (!subscription) {
      throw new Error(
        `Subscription not found after retry: ${stripeSubscriptionId}`,
      );
    }

      await prisma.payment.upsert({
        where: {
          stripePaymentId: invoice.id,
        },
        update: {
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: "SUCCEEDED",
          paidAt: new Date(),
        },
        create: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          stripePaymentId: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: "SUCCEEDED",
          paidAt: new Date(),
        },
      });

      console.log("Payment saved:", invoice.id);




      const user = await prisma.user.findUnique({
      where: {
        id: subscription.userId,
        },
      });

      if (!user) {
        throw new Error(`User not found: ${subscription.userId}`);
      }

      const invoiceNumber = `INV-${invoice.id}`;

      const filePath = await generateInvoicePdf({
        invoiceNumber,
        customerName: user.name ?? "Customer",
        customerEmail: user.email,
        plan: subscription.plan,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        paidAt: new Date(),
      });

      await prisma.invoice.upsert({
        where: {
          invoiceNumber,
        },
        update: {
          amount: invoice.amount_paid,
          currency: invoice.currency,
          filePath,
        },
        create: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          invoiceNumber,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          filePath,
        },
      });

      console.log("Invoice generated:", invoiceNumber);



        
        await sendInvoiceEmail({
        to: user.email,
        customerName: user.name ?? "Customer",
        plan: subscription.plan,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        invoiceNumber,
      });

      console.log("Invoice email sent:", user.email);
    }

    await prisma.webhookEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
      },
    });

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("Webhook processing failed:", error);

    return res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : "Webhook processing failed",
    });
  }
}