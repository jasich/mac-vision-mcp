/**
 * Capture Window Tool
 *
 * Implements the capture_window MCP tool for capturing screenshots of specific windows.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { Window } from 'node-screenshots';
import { openWindows } from 'get-windows';
import { z } from 'zod';
import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * Register the capture_window tool with the MCP server
 */
export function registerCaptureWindow(server: McpServer): void {
  server.registerTool(
    'capture_window',
    {
      title: 'Capture Window',
      description: 'Capture screenshot of a specific window by ID',
      inputSchema: {
        window_id: z.string().describe('Window ID from list_windows'),
        mode: z.enum(['full', 'content']).optional().describe('Capture mode: full window or content only (default: full)'),
        output_path: z.string().optional().describe('Custom output path (default: temp directory)'),
      },
      outputSchema: {
        success: z.boolean(),
        file_path: z.string(),
        window: z.object({
          id: z.string(),
          title: z.string(),
          app: z.string(),
        }),
      },
    },
    async (args: { window_id: string; mode?: 'full' | 'content'; output_path?: string }, _extra: any) => {
      try {
        const { window_id, mode = 'full', output_path } = args;

        console.error(`[capture_window] Capturing window ${window_id} (mode: ${mode})`);

        // Find window in node-screenshots
        const windows = Window.all();
        const targetWindow = windows.find((w) => String(w.id) === window_id);

        if (!targetWindow) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Window ${window_id} not found. It may have been closed.`
          );
        }

        console.error(`[capture_window] Found window, capturing...`);

        // Capture screenshot
        // Note: node-screenshots doesn't distinguish between full/content modes
        // Both will capture the full window including decorations
        const image = targetWindow.captureImageSync();

        // Determine output path
        const outputFile = output_path || path.join(os.tmpdir(), `screenshot_${window_id}.png`);

        // Ensure directory exists if custom path specified
        if (output_path) {
          const dir = path.dirname(output_path);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
        }

        // Save image as PNG
        const pngBuffer = await image.toPng();
        fs.writeFileSync(outputFile, pngBuffer);

        console.error(`[capture_window] Saved to ${outputFile}`);

        // Get rich metadata from get-windows
        const allWindows = await openWindows();
        const windowMeta = allWindows.find((w) => String(w.id) === window_id);

        const result = {
          success: true,
          file_path: outputFile,
          window: {
            id: window_id,
            title: windowMeta?.title || '(Unknown)',
            app: windowMeta?.owner.name || '(Unknown)',
          },
        };

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
        console.error('[capture_window] Error:', error);

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          `Failed to capture window: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  );

  console.error('[capture_window] Tool registered');
}
