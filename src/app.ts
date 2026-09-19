import express from "express";
import userRoutes from "./routes/user.routes.js";
import subscription from "./routes/subscription.routes.js";


export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscription);