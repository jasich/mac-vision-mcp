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
import { logger } from '../logger.js';

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

        logger.debug(`capture_window: Capturing window ${window_id}`, { mode });

        // Find window in node-screenshots
        const windows = Window.all();
        const targetWindow = windows.find((w) => String(w.id) === window_id);

        if (!targetWindow) {
          logger.warn(`capture_window: Window ${window_id} not found`);
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Window ${window_id} not found. It may have been closed.`
          );
        }

        logger.debug(`capture_window: Found window, capturing...`);

        // Capture screenshot
        // Note: node-screenshots doesn't distinguish between full/content modes
        // Both will capture the full window including decorations
        const image = targetWindow.captureImageSync();

        // Determine output path with sanitization
        let outputFile: string;
        if (output_path) {
          // Resolve to absolute path and normalize
          const resolvedPath = path.resolve(output_path);

          // Basic validation: must be a .png file
          if (!resolvedPath.endsWith('.png')) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              'Output path must end with .png'
            );
          }

          // Ensure directory exists
          const dir = path.dirname(resolvedPath);
          try {
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
          } catch (err) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot create directory: ${dir}`
            );
          }

          outputFile = resolvedPath;
        } else {
          outputFile = path.join(os.tmpdir(), `screenshot_${window_id}.png`);
        }

        // Save image as PNG
        const pngBuffer = await image.toPng();
        fs.writeFileSync(outputFile, pngBuffer);

        logger.info(`capture_window: Saved screenshot`, { window_id, path: outputFile });

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
        if (error instanceof McpError) {
          throw error;
        }

        logger.error('capture_window: Failed to capture window', error);
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to capture window: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  );

  logger.info('Tool registered: capture_window');
}
