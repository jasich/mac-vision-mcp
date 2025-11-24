/**
 * Capture Display Tool
 *
 * Implements the capture_display MCP tool for capturing screenshots of entire displays.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { Monitor } from 'node-screenshots';
import { z } from 'zod';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { logger } from '../logger.js';

/**
 * Register the capture_display tool with the MCP server
 */
export function registerCaptureDisplay(server: McpServer): void {
  server.registerTool(
    'capture_display',
    {
      title: 'Capture Display',
      description: 'Capture screenshot of entire display(s)',
      inputSchema: {
        display_id: z.number().optional().describe('Specific display number (0-indexed), or omit to capture all displays'),
      },
      outputSchema: {
        success: z.boolean(),
        file_path: z.string().optional(),
        display: z.number().optional(),
        captures: z.array(
          z.object({
            display: z.number(),
            file_path: z.string(),
          })
        ).optional(),
      },
    },
    async (args: { display_id?: number }, _extra: any) => {
      try {
        const { display_id } = args;

        logger.debug(`capture_display: Capturing display(s)`, { display_id: display_id ?? 'all' });

        // Get all monitors
        const monitors = Monitor.all();

        if (monitors.length === 0) {
          logger.error('capture_display: No displays found');
          throw new McpError(
            ErrorCode.InternalError,
            'No displays found'
          );
        }

        logger.debug(`capture_display: Found ${monitors.length} display(s)`);

        if (display_id !== undefined) {
          // Capture specific display
          if (display_id < 0 || display_id >= monitors.length) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Invalid display ID ${display_id}. Available displays: 0-${monitors.length - 1}`
            );
          }

          const monitor = monitors[display_id];
          const image = monitor.captureImageSync();
          const outputFile = path.join(os.tmpdir(), `display_${display_id}.png`);

          const pngBuffer = await image.toPng();
          fs.writeFileSync(outputFile, pngBuffer);

          logger.info(`capture_display: Saved display screenshot`, { display_id, path: outputFile });

          const result = {
            success: true,
            file_path: outputFile,
            display: display_id,
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
        } else {
          // Capture all displays
          const captures = [];

          for (let i = 0; i < monitors.length; i++) {
            const monitor = monitors[i];
            const image = monitor.captureImageSync();
            const outputFile = path.join(os.tmpdir(), `display_${i}.png`);

            const pngBuffer = await image.toPng();
            fs.writeFileSync(outputFile, pngBuffer);

            captures.push({
              display: i,
              file_path: outputFile,
            });

            logger.debug(`capture_display: Saved display ${i}`, { path: outputFile });
          }

          logger.info(`capture_display: Saved all displays`, { count: captures.length });

          const result = {
            success: true,
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
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        logger.error('capture_display: Failed to capture display', error);
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to capture display: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  );

  logger.info('Tool registered: capture_display');
}
