# SaaS Subscription & Analytics Platform

A backend mini SaaS platform that handles subscription payments, webhook processing, invoice generation, email notifications, renewal reminders, Redis caching, and MCP-based platform analytics.

## Features

- Stripe Test/Sandbox subscription checkout
- Stripe webhook processing
- Idempotent webhook handling
- PostgreSQL database with Prisma ORM
- Subscription and payment management
- PDF invoice generation
- Invoice access through API
- Email notifications using Mailtrap + Nodemailer
- Scheduled subscription expiry checks
- Redis-backed background jobs using BullMQ
- Redis caching for platform metrics
- MCP server for AI clients such as Claude Desktop
- Docker Compose setup for PostgreSQL and Redis

---

## Tech Stack

### Backend
- Node.js
- TypeScript
- Express.js

### Database
- PostgreSQL
- Prisma ORM

### Payments
- Stripe Test/Sandbox

### Email
- Nodemailer
- Mailtrap SMTP

### Background Processing
- Redis
- BullMQ
- node-cron

### Invoice
- PDFKit

### AI Integration
- Model Context Protocol (MCP)
- Claude Desktop

### Infrastructure
- Docker
- Docker Compose

---

## Architecture

```text
                    ┌──────────────────┐
                    │  Claude Desktop  │
                    └────────┬─────────┘
                             │ MCP
                             ▼
                    ┌──────────────────┐
                    │   MCP Server     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Metrics Service  │
                    └───────┬──────────┘
                            │
                    ┌───────┴────────┐
                    ▼                ▼
                 Redis           PostgreSQL
                 Cache            Database


Customer
   │
   ▼
Stripe Checkout
   │
   ▼
Stripe Webhook
   │
   ▼
Express API
   │
   ├── User
   ├── Subscription
   ├── Payment
   └── Invoice
          │
          ├── PDF Invoice
          └── Mailtrap Email


Cron Job
   │
   ▼
Find Expiring Subscriptions
   │
   ▼
BullMQ
   │
   ▼
Redis
   │
   ▼
Renewal Worker
   │
   ▼
Mailtrap
