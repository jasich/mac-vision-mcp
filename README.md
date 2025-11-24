# mac-vision-mcp

A Model Context Protocol (MCP) server that enables AI coding agents to capture screenshots of macOS windows and displays on demand.

## Features

- **Window Discovery** - List all open windows with metadata (title, app, bounds, display)
- **Window Capture** - Capture screenshots of specific windows by ID
- **Display Capture** - Capture entire displays (single or all)
- **Smart Filtering** - Automatically filters out system overlays and utility windows
- **Natural Integration** - Works seamlessly with any MCP-compatible AI agent
- **Privacy First** - Runs entirely locally on your Mac
- **Professional Logging** - Structured logging with timestamps for debugging

## System Requirements

- **macOS**: 12.0+ (Monterey or later)
- **Architecture**: Intel (x64) or Apple Silicon (arm64)
- **Node.js**: 16.0.0 or higher
- **Permissions**: Screen Recording permission required

## Installation

### Global Installation (Recommended)

```bash
npm install -g mac-vision-mcp
```

### Using with npx (No Installation)

```bash
npx -y mac-vision-mcp
```

## Quick Start

### 1. Grant Screen Recording Permission

On first run, macOS will prompt you to grant Screen Recording permission:

1. Open **System Preferences**
2. Go to **Privacy & Security** > **Screen Recording**
3. Enable permission for the application running the MCP server
4. Restart the MCP server

### 2. Configure Your MCP Client

#### For Claude Code

Add to `.claude.json` in your project:

```json
{
  "mcpServers": {
    "mac-vision": {
      "command": "npx",
      "args": ["-y", "mac-vision-mcp"]
    }
  }
}
```

#### For Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mac-vision": {
      "command": "npx",
      "args": ["-y", "mac-vision-mcp"]
    }
  }
}
```

### 3. Use with Your AI Agent

Once configured, your AI agent can use natural language to capture screenshots:

```
User: "Show me my Chrome window with the error"

Agent: [calls list_windows]
Agent: [calls capture_window with the Chrome window ID]
Agent: "I can see the 404 error in your browser..."
```

## MCP Tools

### `list_windows`

Get all open windows with metadata.

**Parameters:** None

**Returns:**

```json
{
  "windows": [
    {
      "id": "12345",
      "title": "Chrome - Documentation",
      "app": "Google Chrome",
      "bounds": {
        "x": 0,
        "y": 23,
        "width": 1920,
        "height": 1057
      },
      "display": 0
    }
  ]
}
```

### `capture_window`

Capture a screenshot of a specific window.

**Parameters:**

- `window_id` (required, string) - Window ID from `list_windows`
- `mode` (optional, string) - Capture mode: `"full"` or `"content"` (default: `"full"`)
- `output_path` (optional, string) - Custom output path (must end with `.png`)

**Returns:**

```json
{
  "success": true,
  "file_path": "/tmp/screenshot_12345.png",
  "window": {
    "id": "12345",
    "title": "Chrome - Documentation",
    "app": "Google Chrome"
  }
}
```

### `capture_display`

Capture entire display(s).

**Parameters:**

- `display_id` (optional, number) - Specific display number (0-indexed), or omit to capture all

**Single Display Returns:**

```json
{
  "success": true,
  "file_path": "/tmp/display_0.png",
  "display": 0
}
```

**All Displays Returns:**

```json
{
  "success": true,
  "captures": [
    {
      "display": 0,
      "file_path": "/tmp/display_0.png"
    },
    {
      "display": 1,
      "file_path": "/tmp/display_1.png"
    }
  ]
}
```

## Usage Examples

### Example 1: List All Windows

```javascript
// AI agent calls list_windows
// Returns array of all open windows with metadata
```

### Example 2: Capture Specific Window

```javascript
// 1. AI agent calls list_windows
// 2. AI agent identifies target window (e.g., Chrome with "error" in title)
// 3. AI agent calls capture_window with window_id
// 4. Screenshot saved to temp directory
```

### Example 3: Capture Primary Display

```javascript
// AI agent calls capture_display with display_id: 0
// Full screen screenshot saved to temp directory
```

### Example 4: Capture All Displays

```javascript
// AI agent calls capture_display without parameters
// All displays captured and saved separately
```

## Troubleshooting

### Permission Denied Errors

**Error:** `Screen Recording permission required`

**Solution:**

1. Open System Preferences > Privacy & Security > Screen Recording
2. Enable permission for your terminal or application
3. Restart the MCP server

### Window Not Found

**Error:** `Window {id} not found. It may have been closed.`

**Cause:** The window was closed between listing and capturing.

**Solution:** Call `list_windows` again to get current window IDs.

### Invalid Output Path

**Error:** `Output path must end with .png`

**Solution:** Ensure custom output paths have a `.png` extension.

### Native Module Issues

**Error:** Native module compilation errors

**Solution:**

1. Ensure you're on macOS 12.0+
2. Verify Node.js version is 16.0.0+
3. Try reinstalling: `npm install -g mac-vision-mcp --force`

### No Windows Listed

**Issue:** `list_windows` returns empty array or missing windows

**Cause:** Screen Recording permission not granted or windows filtered out

**Solution:**

1. Verify Screen Recording permission is enabled
2. Note: System windows and gesture overlays are automatically filtered
3. Windows smaller than 50x50 pixels are excluded

## Architecture

- **Language**: TypeScript/Node.js with ESM modules
- **MCP SDK**: @modelcontextprotocol/sdk (v1.22.0)
- **Screenshot Library**: node-screenshots (v0.2.4) with native N-API bindings
- **Window Metadata**: get-windows (v9.2.3)
- **Permissions**: mac-screen-capture-permissions (v2.1.0)
- **Validation**: Zod (v3.25.0)

## Development

### Local Setup

```bash
# Clone repository
git clone <repository-url>
cd mac-vision-mcp

# Install dependencies
npm install

# Build
npm run build

# Run locally
node dist/index.js
```

### Using Local Build in Another Project

To test your local development build with Claude Code or another MCP client:

1. **Build the project** (if not already done):
   ```bash
   cd /path/to/mac-vision-mcp
   npm run build
   ```

2. **Configure your other project's `.claude.json`** with the absolute path:
   ```json
   {
     "mcpServers": {
       "mac-vision": {
         "command": "node",
         "args": ["/Users/jason/code/personal/mac-vision-mcp/dist/index.js"]
       }
     }
   }
   ```

3. **Restart Claude Code** to load the local build

4. **Make changes and rebuild** as needed:
   ```bash
   npm run build  # Rebuild after code changes
   ```

**Note:** Replace `/Users/jason/code/personal/mac-vision-mcp` with your actual absolute path to the project.

### Testing with MCP Inspector

```bash
# Run with MCP Inspector for debugging
npx @modelcontextprotocol/inspector node ./dist/index.js
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built on the [Model Context Protocol](https://modelcontextprotocol.io)
- Uses [node-screenshots](https://github.com/nashaofu/node-screenshots) for native screenshot capture
- Uses [get-windows](https://github.com/sindresorhus/get-windows) by Sindre Sorhus for window metadata

## Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Documentation**: [Model Context Protocol Docs](https://modelcontextprotocol.io/docs)
- **MCP Inspector**: Use for testing and debugging MCP tools
