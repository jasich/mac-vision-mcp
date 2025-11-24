# Product Requirements Document: mac-vision-mcp

## Overview

**Product Name:** mac-vision-mcp
**Version:** 1.0
**Date:** November 20, 2025
**Owner:** Jason (Product Owner)
**Status:** Draft

## Problem Statement

Developers using CLI-based AI coding agents face a clunky workflow when trying to show the AI what's on their screen. Current process:
1. Manually capture screenshot
2. Find screenshot file
3. Copy file reference
4. Paste into user message

This breaks flow and slows iteration.

## Solution

An MCP (Model Context Protocol) server that enables AI coding agents to capture screenshots of Mac windows on demand. Users describe what they're looking at in natural language, and the agent can retrieve the actual screenshot to "see" it.

## Value Proposition

- **Eliminates manual screenshot workflow** - No more hunting for files
- **Natural interaction** - Describe windows in plain language
- **Seamless integration** - Works with any MCP-compatible AI agent
- **Local & private** - Runs entirely on user's Mac

## Target Users

**Primary:** Developers and technical users building with AI coding agents (Claude Code, Cursor, etc.)

**Use Cases:**
- Debugging UI issues while coding
- Discussing design/layout with AI
- Analyzing error messages in other apps
- Referencing documentation in other windows

## Product Requirements

### Functional Requirements

#### FR1: Window Discovery
- **FR1.1:** List all open windows across all displays
- **FR1.2:** Return window metadata:
  - Window title
  - Application name
  - Unique window ID
  - Position and size (x, y, width, height)
  - Display/monitor information
- **FR1.3:** Provide via MCP tool callable by AI agent

#### FR2: Screenshot Capture
- **FR2.1:** Capture screenshot by window ID
- **FR2.2:** Support capture modes:
  - Full window (with title bar/chrome)
  - Content only (no decorations)
  - All displays at once
  - Specific display
- **FR2.3:** Return both:
  - File path to saved screenshot
  - Window metadata (title, app, dimensions)
- **FR2.4:** Save screenshots to temp directory

#### FR3: Natural Language Workflow
- **FR3.1:** Agent gets window list via MCP tool
- **FR3.2:** LLM interprets user's natural language description
- **FR3.3:** LLM selects appropriate window from list
- **FR3.4:** Agent requests screenshot by window ID

#### FR4: Permissions & Privacy
- **FR4.1:** Request macOS Screen Recording permission on first use
- **FR4.2:** Display clear permission instructions to user
- **FR4.3:** Handle permission denial gracefully

### Non-Functional Requirements

#### NFR1: Performance
- Window list retrieval: < 500ms
- Screenshot capture: < 2s for typical window

#### NFR2: Compatibility
- **Platform:** macOS 12.0+ (Monterey and later)
- **MCP Protocol:** Compatible with standard MCP implementations
- **Architecture:** Support Intel and Apple Silicon

#### NFR3: Distribution
- **Primary:** npm package (`npm install -g mac-vision-mcp`)
- **Alternative:** Homebrew if straightforward

#### NFR4: Reliability
- Handle edge cases:
  - Window closed between list and capture
  - Window minimized or hidden
  - Multi-monitor setups
  - Retina displays (handle DPI correctly)

## Technical Specification

### MCP Tools

#### Tool 1: `list_windows`
**Purpose:** Get all open windows with metadata

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

#### Tool 2: `capture_window`
**Purpose:** Capture screenshot of specific window

**Parameters:**
- `window_id` (required): Window ID from list_windows
- `mode` (optional): "full" | "content" | default: "full"
- `output_path` (optional): Custom save path

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

#### Tool 3: `capture_display`
**Purpose:** Capture entire display(s)

**Parameters:**
- `display_id` (optional): Specific display number, or "all"

**Returns:**
```json
{
  "success": true,
  "file_path": "/tmp/display_0.png",
  "display": 0
}
```

### Technology Stack

**Recommended:** TypeScript/Node.js for MCP server + native macOS APIs

**Options:**
1. **Pure Node.js/TypeScript** with `node-screenshots` or similar npm package
2. **TypeScript + Swift CLI** - Swift binary for screen capture called from TS
3. **Python** - Alternative if ecosystem better

**Decision criteria:**
- Easy npm distribution
- Good macOS API access for window management
- Active maintenance
- Cross-architecture support (Intel + M-series)

### Implementation Notes

- Use `CGWindowListCopyWindowInfo` API for window enumeration
- Use `CGWindowListCreateImage` for capture
- Store screenshots in OS temp directory with cleanup
- Include TypeScript types for MCP integration
- Provide example usage in README

## User Experience Flow

1. **Installation:**
   ```bash
   npm install -g mac-vision-mcp
   ```

2. **First run:** macOS prompts for Screen Recording permission

3. **Agent interaction:**
   ```
   User: "Look at my Chrome window showing the error"

   Agent: [calls list_windows tool]
   Agent: [selects window matching "Chrome" + "error"]
   Agent: [calls capture_window with window_id]
   Agent: [receives screenshot, views it]
   Agent: "I can see the 404 error in your browser..."
   ```

## Success Metrics

### Launch Criteria (v1.0)
- [ ] Successful window enumeration on macOS 12+
- [ ] Screenshot capture working in all modes
- [ ] MCP tools properly exposed and documented
- [ ] Published to npm
- [ ] README with setup/usage examples
- [ ] Handles permission requests correctly

### Future Enhancements (Post-v1.0)
- OCR text extraction from screenshots
- Window content change detection
- Video/screen recording support
- Cross-platform (Windows, Linux)
- Browser tab-specific capture (via browser extensions)

## Open Questions

1. **Tech stack decision:** Node.js pure vs Node.js + Swift hybrid?
2. **Screenshot format:** PNG default? Support JPEG/WebP?
3. **Temp file cleanup:** Auto-delete after N minutes? User-configurable?
4. **Error handling:** How verbose should error messages be?

## Timeline

**Phase 1 (MVP):** 2-3 weeks
- Week 1: Core window enumeration + basic capture
- Week 2: MCP integration + testing
- Week 3: Packaging + documentation

**Phase 2 (Polish):** 1 week
- npm publish
- User feedback
- Bug fixes

## Appendix

### References
- MCP Protocol: https://modelcontextprotocol.io
- macOS Screen Capture APIs: CGWindowListCreateImage
- Similar tools: screencapture CLI, screenshot utilities

### Assumptions
- Users have Node.js installed
- Users comfortable granting Screen Recording permission
- Primary use with Claude Code or similar MCP-compatible agents
