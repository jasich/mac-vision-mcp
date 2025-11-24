/**
 * Permission Handling
 *
 * Checks for macOS Screen Recording permission required for window capture.
 */

import { hasScreenCapturePermission } from 'mac-screen-capture-permissions';
import { logger } from './logger.js';

export async function checkPermissions(): Promise<void> {
  if (!hasScreenCapturePermission()) {
    console.error('\n❌ Screen Recording permission required.\n');
    console.error('📋 To enable:');
    console.error('  1. Open System Preferences');
    console.error('  2. Go to Privacy & Security > Screen Recording');
    console.error('  3. Enable permission for this app');
    console.error('  4. Restart the MCP server\n');
    logger.error('Screen Recording permission not granted');
    throw new Error('Screen Recording permission not granted');
  }

  logger.info('Screen Recording permission granted');
}
