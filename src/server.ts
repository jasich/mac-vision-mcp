/**
 * MCP Server Configuration
 *
 * Creates and configures the MCP server instance.
 * Tools will be registered here as they are implemented.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'mac-vision-mcp',
    version: '0.1.0',
  });

  // Tools will be registered here in subsequent phases
  // Phase 2: registerListWindows(server);
  // Phase 3: registerCaptureWindow(server);
  // Phase 4: registerCaptureDisplay(server);

  return server;
}
