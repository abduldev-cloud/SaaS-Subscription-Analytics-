# SaaS Subscription Platform

## Tech Stack
- Node.js + TypeScript
- Express
- PostgreSQL
- Prisma
- Redis
- BullMQ
- Stripe
- Mailtrap
- MCP

## Features
- Stripe subscription checkout
- Stripe webhook processing
- PostgreSQL subscription/payment storage
- PDF invoice generation
- Mailtrap confirmation emails
- Scheduled renewal reminders
- Redis background queue
- Redis metrics caching
- MCP platform metrics tool

## Run

### Start PostgreSQL and Redis
docker-compose up -d

### Install dependencies
npm install

### Run development server
npm run dev

### Build
npm run build

## MCP
Claude Desktop can connect to the MCP server and use:

get_platform_metrics

Example:
{
  "activeSubscribers": 6,
  "simulatedRevenue": 29.97
}