/**
 * Shared Type Definitions
 *
 * Common types used across the MCP server.
 * Will be expanded in subsequent phases as tools are implemented.
 */

/**
 * Window bounds (position and size)
 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Window information metadata
 */
export interface WindowInfo {
  id: string;
  title: string;
  app: string;
  bounds: Bounds;
  display: number;
}

/**
 * Response for list_windows tool
 */
export interface ListWindowsResponse {
  windows: WindowInfo[];
}

/**
 * Capture mode for window screenshots
 */
export type CaptureMode = 'full' | 'content';

/**
 * Parameters for capture_window tool
 */
export interface CaptureWindowParams {
  window_id: string;
  mode?: CaptureMode;
  output_path?: string;
}

/**
 * Window metadata in capture response
 */
export interface WindowMetadata {
  id: string;
  title: string;
  app: string;
}

/**
 * Response for capture_window tool
 */
export interface CaptureWindowResponse {
  success: boolean;
  file_path: string;
  window: WindowMetadata;
}

/**
 * Parameters for capture_display tool
 */
export interface CaptureDisplayParams {
  display_id?: number;
}

/**
 * Response for single display capture
 */
export interface CaptureDisplayResponse {
  success: boolean;
  file_path: string;
  display: number;
}

/**
 * Capture result for multi-display capture
 */
export interface DisplayCapture {
  display: number;
  file_path: string;
}

/**
 * Response for multi-display capture
 */
export interface MultiDisplayResponse {
  success: boolean;
  captures: DisplayCapture[];
}

/**
 * Parameters for capture_windows tool (multi-window)
 */
export interface CaptureWindowsParams {
  window_ids: string[];
  mode?: CaptureMode;
  output_dir?: string;
}

/**
 * Individual window capture result
 */
export interface WindowCaptureResult {
  window_id: string;
  success: boolean;
  file_path?: string;
  error?: string;
  window?: WindowMetadata;
}

/**
 * Response for capture_windows tool (multi-window)
 */
export interface CaptureWindowsResponse {
  success: boolean;
  captures: WindowCaptureResult[];
}
