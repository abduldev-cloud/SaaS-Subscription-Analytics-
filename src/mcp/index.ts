import "dotenv/config";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { mcpServer } from "./server.js";
import { prisma } from "../db/prisma.js";
import { redis } from "../cache/redis.js";

await prisma.$connect();
await redis.connect();

console.error("MCP PostgreSQL connected");
console.error("MCP Redis connected");

const transport = new StdioServerTransport();

await mcpServer.connect(transport);