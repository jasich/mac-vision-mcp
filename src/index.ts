#!/usr/bin/env node

/**
 * mac-vision-mcp - MCP Server Entry Point
 *
 * Entry point for the macOS Vision MCP server.
 * Handles permission checks, server initialization, and stdio transport.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { checkPermissions } from './permissions.js';

async function main() {
  try {
    // Check screen recording permissions on startup
    await checkPermissions();

    // Create MCP server instance
    const server = createServer();

    // Setup stdio transport for MCP communication
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('[mac-vision-mcp] Server started successfully');
  } catch (error) {
    console.error('[mac-vision-mcp] Fatal error:', error);
    process.exit(1);
  }
}

// Handle clean shutdown
process.on('SIGINT', () => {
  console.error('[mac-vision-mcp] Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('[mac-vision-mcp] Shutting down...');
  process.exit(0);
});

main();
