# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-24

### Added

#### Core Features
- **Window Listing** (`list_windows` tool) - Enumerate all open windows with metadata
  - Returns window ID, title, app name, bounds, and display number
  - Automatically filters out system overlays (WindowManager, gesture blocking overlays)
  - Excludes small utility windows (< 50x50 pixels)
- **Window Capture** (`capture_window` tool) - Capture screenshots of specific windows
  - Capture by window ID
  - Save to temp directory or custom path
  - Full window capture including decorations
- **Display Capture** (`capture_display` tool) - Capture entire displays
  - Capture specific display by ID
  - Capture all displays at once
  - Multi-monitor support

#### Infrastructure
- **Structured Logging** - Professional logging system with timestamps
  - Log levels: DEBUG, INFO, WARN, ERROR
  - All output to stderr (doesn't interfere with MCP stdio)
  - Contextual logging with JSON metadata
- **Error Handling** - Comprehensive error handling and validation
  - Clear, actionable error messages
  - Proper MCP error codes (InvalidRequest, InternalError)
  - Path sanitization and validation
- **Permission Management** - macOS Screen Recording permission handling
  - Permission check on startup
  - Clear instructions for enabling permissions
  - Graceful error handling when permissions denied

#### Developer Experience
- TypeScript with strict mode
- ESM module system
- Zod schema validation for all tool inputs/outputs
- MCP SDK v1.22.0 integration
- Prebuilt native binaries for Intel + Apple Silicon

### Technical Details

**Dependencies:**
- `@modelcontextprotocol/sdk` v1.22.0 - MCP protocol implementation
- `node-screenshots` v0.2.4 - Native screenshot capture
- `get-windows` v9.2.3 - Window metadata retrieval
- `mac-screen-capture-permissions` v2.1.0 - Permission handling
- `zod` v3.25.0 - Schema validation

**System Requirements:**
- macOS 12.0+ (Monterey or later)
- Node.js 16.0.0+
- Intel (x64) or Apple Silicon (arm64)

### Known Limitations

- Window capture mode parameter (`full` vs `content`) currently captures full window in both modes
- Display detection uses simple heuristic (x >= 0 for primary display)
- No timeout protection for capture operations (may hang on very large captures)
- Screenshots saved as PNG only (no JPEG/WebP support)

### Notes

- All screenshots saved to system temp directory by default
- macOS automatically cleans temp files periodically
- Custom output paths must end with `.png` extension
- Server uses stdio transport for MCP communication
