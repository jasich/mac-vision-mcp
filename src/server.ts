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
import { registerListWindows } from './tools/list-windows.js';
import { registerCaptureWindow } from './tools/capture-window.js';
import { registerCaptureDisplay } from './tools/capture-display.js';

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

  // Register tools
  registerListWindows(server);
  registerCaptureWindow(server);
  registerCaptureDisplay(server);

  return server;
}
