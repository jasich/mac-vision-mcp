/**
 * List Windows Tool
 *
 * Implements the list_windows MCP tool for enumerating all open windows
 * with metadata including title, app name, bounds, and display.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { openWindows } from 'get-windows';
import { z } from 'zod';
import type { WindowInfo } from '../types.js';

/**
 * Register the list_windows tool with the MCP server
 */
export function registerListWindows(server: McpServer): void {
  server.registerTool(
    'list_windows',
    {
      title: 'List Windows',
      description: 'Get all open windows with metadata (title, app, bounds, display)',
      // No input parameters required - omit inputSchema
      outputSchema: {
        windows: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            app: z.string(),
            bounds: z.object({
              x: z.number(),
              y: z.number(),
              width: z.number(),
              height: z.number(),
            }),
            display: z.number(),
          })
        ),
      },
    },
    async (_args: {}, _extra: any) => {
      try {
        console.error('[list_windows] Fetching window list...');

        // Get all windows using get-windows
        const windows = await openWindows();

        console.error(`[list_windows] Found ${windows.length} windows`);

        // Filter out system windows and overlays, then map to our WindowInfo format
        const windowList: WindowInfo[] = windows
          .filter((window) => {
            // Skip WindowManager system windows
            if (window.owner.name === 'WindowManager') return false;

            // Skip gesture blocking overlays
            if (window.title?.includes('Gesture Blocking Overlay')) return false;

            // Skip very small windows (likely menu bar items or utility overlays)
            if (window.bounds.width < 50 || window.bounds.height < 50) return false;

            return true;
          })
          .map((window) => ({
            id: String(window.id),
            title: window.title || '(Untitled)',
            app: window.owner.name || 'Unknown',
            bounds: {
              x: window.bounds.x,
              y: window.bounds.y,
              width: window.bounds.width,
              height: window.bounds.height,
            },
            // Simple display detection: display 0 if x >= 0, otherwise secondary display
            // More sophisticated logic could be added later
            display: window.bounds.x >= 0 ? 0 : 1,
          }));

        console.error(`[list_windows] Filtered to ${windowList.length} user windows`);

        const result = { windows: windowList };

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
          structuredContent: result,
        };
      } catch (error) {
        console.error('[list_windows] Error:', error);
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to list windows: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  );

  console.error('[list_windows] Tool registered');
}
