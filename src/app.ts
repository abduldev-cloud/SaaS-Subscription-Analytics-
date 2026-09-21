import express from "express";
import userRoutes from "./routes/user.routes.js";
import subscription from "./routes/subscription.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import { stripeWebhookController } from "./controllers/webhook.controller.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import metricsRoutes from "./routes/metrics.routes.js";



export const app = express();


app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookController,
);


app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscription);
app.use("/api/checkout",checkoutRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/metrics", metricsRoutes);