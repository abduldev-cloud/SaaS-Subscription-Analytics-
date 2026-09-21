import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPlatformMetrics } from "../services/metrics.service.js";

export const mcpServer = new McpServer({
  name: "saas-platform-mcp",
  version: "1.0.0",
});

mcpServer.tool(
  "get_platform_metrics",
  "Get current platform metrics including active subscribers and simulated revenue.",
  {},
  async () => {
    const metrics = await getPlatformMetrics();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(metrics, null, 2),
        },
      ],
    };
  },
);