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

```

Prerequisites

Install the following:

Node.js 22+
Docker Desktop
Stripe CLI
A Stripe account
A Mailtrap account
Claude Desktop (only required for MCP demonstration)


Installation

Clone the repository:

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd saas-subscription-platform

Install dependencies:

npm install


Start PostgreSQL and Redis

Docker Compose starts both required infrastructure services.

docker-compose up -d

Check the containers:

docker-compose ps

The services are:

PostgreSQL → localhost:5432
Redis      → localhost:6379
Database Setup

Run Prisma migrations:

npx prisma migrate dev

Generate the Prisma client:

npx prisma generate

Prisma Studio can be used to inspect the database:

npx prisma studio
Run the Backend

Development mode:

npm run dev

The API runs at:

http://localhost:5000

Health check:

GET /health

Expected response:

{
  "status": "ok"
}



Stripe Setup

The application uses Stripe Test/Sandbox mode.

Start the Stripe webhook listener:

stripe listen \
  --events checkout.session.completed \
  --events invoice.paid \
  --forward-to localhost:5000/api/webhooks/stripe

Stripe CLI will provide a webhook signing secret.

Add that value to:

STRIPE_WEBHOOK_SECRET=
Payment Flow
Create Checkout Session
        ↓
Stripe Checkout
        ↓
Customer completes test payment
        ↓
checkout.session.completed
        ↓
User + Subscription saved
        ↓
invoice.paid
        ↓
Payment saved
        ↓
PDF Invoice generated
        ↓
Invoice saved
        ↓
Confirmation email sent
API Endpoints
Health
GET /health
Create User
POST /api/users

Example:

{
  "email": "customer@example.com",
  "name": "Customer"
}
Create Checkout Session
POST /api/checkout/:userId

Creates a Stripe subscription checkout session.

Get User Subscriptions
GET /api/subscriptions/user/:userId
Get Invoice
GET /api/invoices/:invoiceNumber

Returns the generated PDF invoice.

Platform Metrics
GET /api/metrics

Example response:

{
  "activeSubscribers": 6,
  "simulatedRevenue": 29.97
}

The metrics endpoint uses Redis caching with a short TTL to reduce repeated database queries.

Invoice Generation

After a successful payment:

Stripe sends invoice.paid.
The payment is stored in PostgreSQL.
A PDF invoice is generated using PDFKit.
Invoice metadata is stored in PostgreSQL.
The customer receives a confirmation email through Mailtrap.

Invoices are stored locally under:

storage/invoices/

They can be accessed through:

GET /api/invoices/:invoiceNumber
Email Notifications

Mailtrap is used as an SMTP sandbox.

This allows the application to test emails without sending messages to real customer inboxes.

The application sends:

Payment Confirmation

Contains:

Customer name
Subscription plan
Payment amount
Payment status
Invoice access link
Renewal Reminder

Subscriptions expiring within the configured renewal window are processed by the background worker and an email reminder is sent.

Renewal Reminder System

A scheduled cron job checks for active subscriptions that are approaching their expiry date.

Cron
 ↓
PostgreSQL
 ↓
Find expiring subscriptions
 ↓
BullMQ Queue
 ↓
Redis
 ↓
Renewal Worker
 ↓
Mailtrap

The cron currently runs every minute for demonstration purposes.

The BullMQ job uses a deterministic job ID to avoid repeatedly creating the same renewal job.

Redis Caching

Platform metrics are cached in Redis.

The flow is:

GET /api/metrics
       ↓
Check Redis
       ↓
Cache HIT ─────→ Return cached metrics
       │
       └─ Cache MISS
              ↓
          PostgreSQL
              ↓
          Store in Redis
              ↓
          Return metrics

The current cache TTL is 60 seconds.

MCP Integration

The project includes an MCP server that allows AI clients such as Claude Desktop to retrieve platform metrics.

MCP Tool
get_platform_metrics

The tool returns:

{
  "activeSubscribers": 6,
  "simulatedRevenue": 29.97
}

The MCP server uses the same metrics service as the REST API.

Claude Desktop
      ↓
MCP
      ↓
get_platform_metrics
      ↓
Metrics Service
      ↓
Redis / PostgreSQL

The AI client does not directly access the database.

Claude Desktop Configuration

After building the project:

npm run build

Configure Claude Desktop's MCP server using the generated file:

dist/mcp/index.js

Example configuration:

{
  "mcpServers": {
    "saas-platform": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "--env-file=D:\\Projects\\saas-subscription-platform\\.env",
        "D:\\Projects\\saas-subscription-platform\\dist\\mcp\\index.js"
      ]
    }
  }
}

Update the paths according to the local project location.

Restart Claude Desktop after changing the configuration.

Then ask Claude:

Get the current platform metrics.

Claude can call:

get_platform_metrics
Background Services

When the backend starts, the following services are initialized:

PostgreSQL connection
Redis connection
Express API
Renewal cron
BullMQ renewal worker

The MCP server separately initializes its required PostgreSQL and Redis connections when launched by the AI client.