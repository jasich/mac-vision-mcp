/**
 * MCP Server Configuration
 *
 * Creates and configures the MCP server instance.
 * Tools will be registered here as they are implemented.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Read version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'mac-vision-mcp',
    version: packageJson.version,
  });

  // Tools will be registered here in subsequent phases
  // Phase 2: registerListWindows(server);
  // Phase 3: registerCaptureWindow(server);
  // Phase 4: registerCaptureDisplay(server);

  return server;
}
