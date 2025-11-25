/**
 * Capture Windows Tool (Multi-Window)
 *
 * Implements the capture_windows MCP tool for capturing screenshots of multiple windows at once.
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
import type { WindowCaptureResult } from '../types.js';

/**
 * Register the capture_windows tool with the MCP server
 */
export function registerCaptureWindows(server: McpServer): void {
  server.registerTool(
    'capture_windows',
    {
      title: 'Capture Windows',
      description: 'Capture screenshots of multiple windows by their IDs. Use this when you need to see multiple windows at once.',
      inputSchema: {
        window_ids: z.array(z.string()).min(1).describe('Array of Window IDs from list_windows'),
        mode: z.enum(['full', 'content']).optional().describe('Capture mode: full window or content only (default: full)'),
        output_dir: z.string().optional().describe('Custom output directory (default: temp directory)'),
      },
      outputSchema: {
        success: z.boolean(),
        captures: z.array(
          z.object({
            window_id: z.string(),
            success: z.boolean(),
            file_path: z.string().optional(),
            error: z.string().optional(),
            window: z.object({
              id: z.string(),
              title: z.string(),
              app: z.string(),
            }).optional(),
          })
        ),
      },
    },
    async (args: { window_ids: string[]; mode?: 'full' | 'content'; output_dir?: string }, _extra: any) => {
      try {
        const { window_ids, mode = 'full', output_dir } = args;

        logger.debug(`capture_windows: Capturing ${window_ids.length} windows`, { window_ids, mode });

        // Validate we have at least one window ID
        if (!window_ids || window_ids.length === 0) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'At least one window_id is required'
          );
        }

        // Determine output directory
        let outputDirectory: string;
        if (output_dir) {
          const resolvedDir = path.resolve(output_dir);
          try {
            if (!fs.existsSync(resolvedDir)) {
              fs.mkdirSync(resolvedDir, { recursive: true });
            }
          } catch (err) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot create directory: ${resolvedDir}`
            );
          }
          outputDirectory = resolvedDir;
        } else {
          outputDirectory = os.tmpdir();
        }

        // Get all windows once for efficiency
        const allScreenshotWindows = Window.all();
        const allWindowsMeta = await openWindows();

        // Capture each window
        const captures: WindowCaptureResult[] = [];

        for (const window_id of window_ids) {
          try {
            // Find window in node-screenshots
            const targetWindow = allScreenshotWindows.find((w) => String(w.id) === window_id);

            if (!targetWindow) {
              logger.warn(`capture_windows: Window ${window_id} not found`);
              captures.push({
                window_id,
                success: false,
                error: `Window ${window_id} not found. It may have been closed.`,
              });
              continue;
            }

            // Capture screenshot
            const image = targetWindow.captureImageSync();

            // Generate output path
            const outputFile = path.join(outputDirectory, `screenshot_${window_id}.png`);

            // Save image as PNG
            const pngBuffer = await image.toPng();
            fs.writeFileSync(outputFile, pngBuffer);

            logger.info(`capture_windows: Saved screenshot`, { window_id, path: outputFile });

            // Get rich metadata from get-windows
            const windowMeta = allWindowsMeta.find((w) => String(w.id) === window_id);

            captures.push({
              window_id,
              success: true,
              file_path: outputFile,
              window: {
                id: window_id,
                title: windowMeta?.title || '(Unknown)',
                app: windowMeta?.owner.name || '(Unknown)',
              },
            });
          } catch (windowError) {
            logger.error(`capture_windows: Failed to capture window ${window_id}`, windowError);
            captures.push({
              window_id,
              success: false,
              error: windowError instanceof Error ? windowError.message : 'Unknown error',
            });
          }
        }

        // Overall success if at least one capture succeeded
        const overallSuccess = captures.some((c) => c.success);

        const result = {
          success: overallSuccess,
          captures,
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

        logger.error('capture_windows: Failed to capture windows', error);
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to capture windows: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  );

  logger.info('Tool registered: capture_windows');
}
