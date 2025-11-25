# Implementation Plan: mac-vision-mcp

**Last Updated:** November 24, 2025
**Status:** Phase 8 Complete - Published to npm as mac-vision-mcp@0.1.0
**Architecture:** Pure TypeScript/Node.js with native addons

---

## Overview

Phased implementation plan for mac-vision-mcp MCP server. Each phase delivers testable functionality, enabling iterative development and validation.

**Tech Stack:**
- @modelcontextprotocol/sdk (^1.22.0)
- node-screenshots (^0.2.4)
- get-windows (^9.2.3)
- mac-screen-capture-permissions (^2.1.0)
- zod (^3.25.0)

---

## Phase 0: Project Setup & Scaffolding

**Objective:** Initialize TypeScript project with proper tooling and structure.

**Deliverable:** Buildable TypeScript project with all dependencies installed.

**Testing:** `npm run build` succeeds, dependencies resolve correctly.

### Tasks
- [x] Create GitHub repository
  - [x] Initialize git repo
  - [x] Create `.gitignore`
- [x] Initialize npm package
  - [x] Create `package.json` with metadata
  - [x] Set `bin` entry point to `./dist/index.js`
  - [x] Configure `engines: node >= 16.0.0`
  - [x] Set `os: ["darwin"]` and `cpu: ["x64", "arm64"]`
  - [x] Add `files` array for distribution
- [x] Install core dependencies
  - [x] `npm install @modelcontextprotocol/sdk zod`
  - [x] `npm install node-screenshots get-windows`
  - [x] `npm install mac-screen-capture-permissions`
- [x] Install dev dependencies
  - [x] `npm install -D typescript @types/node`
  - [x] `npm install -D tsx` (for development)
- [x] Configure TypeScript
  - [x] Create `tsconfig.json`
  - [x] Target ES2020, module ESNext
  - [x] Configure output to `dist/`
  - [x] Enable strict mode
  - [x] Set `moduleResolution: "bundler"`
- [x] Setup build scripts
  - [x] Add `build` script: `tsc`
  - [x] Add `dev` script: `tsx watch src/index.ts`
  - [x] Add `start` script: `node dist/index.js`
- [x] Create source structure
  - [x] `src/index.ts` (entry point)
  - [x] `src/server.ts` (MCP server setup)
  - [x] `src/permissions.ts` (permission checks)
  - [x] `src/tools/` (tool implementations)
  - [x] `src/types.ts` (shared types)
- [x] Add shebang to entry point
  - [x] `#!/usr/bin/env node` in compiled output

---

## Phase 1: Permission Handling & Basic MCP Server

**Objective:** Establish MCP server foundation with permission checks.

**Deliverable:** MCP server that starts via stdio, checks permissions, and responds to ping.

**Testing:**
- Manual: Run server via stdio, verify permission check
- Integration: Connect with Claude Code/Cursor, verify server appears

### Tasks

- [x] Implement permission checking (`src/permissions.ts`)
  - [x] Import `hasScreenCapturePermission`
  - [x] Check permission on startup
  - [x] Display helpful error message if denied
  - [x] Log success message to stderr
  - [x] Export `checkPermissions()` function
- [x] Implement MCP server setup (`src/server.ts`)
  - [x] Create `McpServer` instance
  - [x] Configure server name: `mac-vision-mcp`
  - [x] Set version from package.json
  - [x] Export `createServer()` function
- [x] Implement main entry point (`src/index.ts`)
  - [x] Import server creation and permissions
  - [x] Call `checkPermissions()` on startup
  - [x] Create server instance
  - [x] Setup `StdioServerTransport`
  - [x] Connect server to transport
  - [x] Handle SIGINT for clean shutdown
  - [x] Catch and log fatal errors
- [x] Test server startup
  - [x] Build project: `npm run build`
  - [x] Run directly: `node dist/index.js`
  - [x] Verify permission check executes
  - [x] Verify no permission errors if granted
- [x] Test MCP integration
  - [x] Add to `.claude.json` or `mcp.json`
  - [x] Restart Claude Code/Cursor
  - [x] Verify server appears in MCP list
  - [x] Check stderr logs for startup messages

---

## Phase 2: Window Listing Tool

**Objective:** Implement `list_windows` tool with rich metadata.

**Deliverable:** Working tool that returns all open windows with title, app, bounds.

**Testing:**
- MCP: Call `list_windows` from Claude Code
- Verify: Returns window list with correct metadata
- Edge cases: Multiple displays, minimized windows

### Tasks

- [x] Define window types (`src/types.ts`)
  - [x] `WindowInfo` interface (id, title, app, bounds, display)
  - [x] `Bounds` interface (x, y, width, height)
  - [x] `ListWindowsResponse` interface
- [x] Implement list_windows tool (`src/tools/list-windows.ts`)
  - [x] Import `openWindows` from get-windows
  - [x] Define Zod schema (no parameters)
  - [x] Implement handler function
  - [x] Call `openWindows()` to get window list
  - [x] Filter out system windows (WindowManager, gesture overlays, small windows)
  - [x] Map to standard WindowInfo format
  - [x] Calculate display index from bounds (optional)
  - [x] Return JSON with windows array
  - [x] Wrap in try/catch with McpError
  - [x] Export `registerListWindows(server)` function
- [x] Register tool in server (`src/server.ts`)
  - [x] Import `registerListWindows`
  - [x] Call registration in `createServer()`
- [x] Test window listing
  - [x] Open multiple app windows (Chrome, Terminal, etc.)
  - [x] Call `list_windows` via MCP client
  - [x] Verify all windows returned
  - [x] Check metadata accuracy (title, app name)
  - [x] Verify bounds are reasonable
- [x] Test edge cases
  - [x] Minimized windows (should/shouldn't appear?)
  - [x] Hidden windows
  - [x] Multiple monitors (negative x/y values)
  - [x] Windows without titles

---

## Phase 3: Window Capture Tool

**Objective:** Implement `capture_window` tool for individual window screenshots.

**Deliverable:** Working tool that captures window by ID, saves to temp directory.

**Testing:**
- MCP: List windows, then capture specific window
- Verify: Screenshot file created, matches window
- Edge cases: Window closed, minimized, moved

### Tasks

- [x] Define capture types (`src/types.ts`)
  - [x] `CaptureWindowParams` (window_id, mode, output_path)
  - [x] `CaptureWindowResponse` (success, file_path, window)
  - [x] `CaptureMode` enum/type ('full' | 'content')
- [x] Implement capture_window tool (`src/tools/capture-window.ts`)
  - [x] Import `Window` from node-screenshots
  - [x] Import `openWindows` from get-windows (for metadata)
  - [x] Define Zod schema with parameters
  - [x] Implement handler function
  - [x] Find window by ID in `Window.all()`
  - [x] Handle window not found error
  - [x] Capture image with `captureImageSync()`
  - [x] Determine output path (temp dir if not specified)
  - [x] Save PNG with `fs.writeFileSync()` (awaited toPng())
  - [x] Get rich metadata from get-windows
  - [x] Return success response with file path
  - [x] Wrap in try/catch with McpError
  - [x] Export `registerCaptureWindow(server)` function
- [x] Register tool in server (`src/server.ts`)
  - [x] Import `registerCaptureWindow`
  - [x] Call registration in `createServer()`
- [x] Test window capture
  - [x] List windows to get valid window ID
  - [x] Capture specific window
  - [x] Verify file created at returned path
  - [x] Open image and verify it matches window
  - [x] Check image dimensions match window bounds
- [x] Test error handling
  - [x] Capture with invalid window ID
  - [x] Close window between list and capture
  - [x] Capture minimized window
  - [x] Custom output path (valid and invalid)
- [x] Test Retina displays
  - [x] Verify image resolution (2x physical pixels)
  - [x] Check `scaleFactor` handling
  - [x] Ensure image quality acceptable

---

## Phase 4: Display Capture Tool

**Objective:** Implement `capture_display` tool for full screen captures.

**Deliverable:** Working tool that captures entire display(s).

**Testing:**
- MCP: Capture display 0, capture all displays
- Verify: Screenshot files created for correct displays
- Multi-monitor: Test with 2+ displays

### Tasks

- [x] Define display types (`src/types.ts`)
  - [x] `CaptureDisplayParams` (display_id optional)
  - [x] `CaptureDisplayResponse` (success, file_path, display)
  - [x] `MultiDisplayResponse` (success, captures array)
- [x] Implement capture_display tool (`src/tools/capture-display.ts`)
  - [x] Import `Monitor` from node-screenshots
  - [x] Define Zod schema with optional display_id
  - [x] Implement handler function
  - [x] Get all monitors with `Monitor.all()`
  - [x] Handle single display case
  - [x] Handle all displays case (default)
  - [x] Capture each display with `captureImageSync()` and await toPng()
  - [x] Save to temp directory with display index
  - [x] Return appropriate response format
  - [x] Wrap in try/catch with McpError
  - [x] Export `registerCaptureDisplay(server)` function
- [x] Register tool in server (`src/server.ts`)
  - [x] Import `registerCaptureDisplay`
  - [x] Call registration in `createServer()`
- [x] Test single display capture
  - [x] Capture display 0
  - [x] Verify file created
  - [x] Check image matches primary display
- [x] Test all displays capture
  - [x] Capture without display_id parameter
  - [x] Verify one file per display
  - [x] Check each image matches correct display
- [x] Test multi-monitor setup
  - [x] Test with 2+ displays connected
  - [x] Verify display numbering
  - [x] Check negative coordinates handled
  - [x] Test with different orientations

---

## Phase 5: Error Handling & Polish

**Objective:** Robust error handling, logging, and edge case coverage.

**Deliverable:** Production-ready error handling with clear user feedback.

**Testing:**
- Trigger various error conditions
- Verify clear, actionable error messages
- Check stderr logging useful for debugging

### Tasks

- [x] Enhance error handling
  - [x] Add custom error types/codes (using McpError with ErrorCode)
  - [x] Improve error messages for common issues
  - [x] Add error context (window ID, display ID via logger)
  - [x] Ensure all errors logged to stderr
  - [x] Return user-friendly messages via MCP
- [x] Add logging utility (`src/logger.ts`)
  - [x] Structured logging to stderr
  - [x] Log levels (info, error, debug, warn)
  - [x] Prefix with `[mac-vision-mcp]`
  - [x] Include timestamps (ISO format)
- [x] Improve permission handling
  - [x] Better first-run messaging (already implemented)
  - [x] Detect permission state without triggering (hasScreenCapturePermission)
  - [x] Provide System Preferences instructions
  - [x] Handle permission revoked during runtime (via error handling)
- [x] Add input validation
  - [x] Validate window_id format (via Zod schema)
  - [x] Validate display_id range (bounds checking)
  - [x] Validate output_path permissions (path sanitization)
  - [x] Sanitize file paths (path.resolve, .png validation)
- [x] Handle edge cases
  - [x] Window closed between operations (McpError thrown)
  - [x] Window moved/resized during capture (captured as-is)
  - [x] Insufficient disk space (fs errors caught)
  - [x] Invalid temp directory (fs errors caught)
  - [x] Zero-size windows (filtered in list_windows)
  - [x] Offscreen windows (captured if possible)
- [ ] Add timeout protection
  - [ ] Set reasonable timeouts for capture operations
  - [ ] Handle hung capture gracefully
- [x] Test error scenarios systematically
  - [x] Document each error case (via logger)
  - [x] Verify error messages clear (improved messages)
  - [x] Check recovery behavior (McpError handling)

---

## Phase 6: Testing & Validation ~~(SKIPPED)~~

**Objective:** ~~Comprehensive testing across macOS versions and architectures.~~

**Deliverable:** ~~Validated functionality on target platforms.~~

**Testing:**
- ~~macOS 12, 13, 14, 15~~
- ~~Intel and Apple Silicon~~
- ~~Various window managers and apps~~
- ~~Multi-monitor configurations~~

### Tasks

- ~~[ ] Platform testing matrix~~
  - ~~[ ] Test on macOS 12 (Monterey)~~
  - ~~[ ] Test on macOS 13 (Ventura)~~
  - ~~[ ] Test on macOS 14 (Sonoma)~~
  - ~~[ ] Test on macOS 15 (Sequoia)~~
  - ~~[ ] Test on Intel Mac~~
  - ~~[ ] Test on Apple Silicon Mac~~
- ~~[ ] Application compatibility testing~~
  - ~~[ ] Chrome/Chromium windows~~
  - ~~[ ] Safari windows~~
  - ~~[ ] Terminal/iTerm windows~~
  - ~~[ ] Electron apps (VS Code, etc.)~~
  - ~~[ ] Native macOS apps~~
  - ~~[ ] Full-screen apps~~
- ~~[ ] MCP client testing~~
  - ~~[ ] Test with Claude Code~~
  - ~~[ ] Test with Cursor~~
  - ~~[ ] Test with custom MCP client~~
  - ~~[ ] Verify tool discovery~~
  - ~~[ ] Check parameter passing~~
  - ~~[ ] Validate response format~~
- ~~[ ] Performance testing~~
  - ~~[ ] Window listing < 500ms~~
  - ~~[ ] Window capture < 2s~~
  - ~~[ ] Display capture < 3s~~
  - ~~[ ] Memory usage reasonable~~
  - ~~[ ] No memory leaks~~
- ~~[ ] Stress testing~~
  - ~~[ ] 50+ windows open~~
  - ~~[ ] Rapid consecutive captures~~
  - ~~[ ] Very large displays (5K+)~~
  - ~~[ ] Multiple displays (3+)~~
- ~~[ ] Document test results~~
  - ~~[ ] Create test matrix spreadsheet~~
  - ~~[ ] Note any platform-specific issues~~
  - ~~[ ] Document workarounds~~

---

## Phase 7: Documentation & Examples

**Objective:** Complete documentation for users and developers.

**Deliverable:** README, usage examples, troubleshooting guide.

**Testing:**
- Follow documentation as new user
- Verify all examples work
- Check links valid

### Tasks

- [x] Write README.md
  - [x] Project description
  - [x] Features list
  - [x] Installation instructions (`npm install -g`)
  - [x] Quick start guide
  - [x] MCP client configuration (Claude Code, Cursor)
  - [x] Tool documentation (list_windows, capture_window, capture_display)
  - [x] Parameter descriptions
  - [x] Response format examples
  - [x] System requirements
  - [x] Permission setup instructions
  - [x] Troubleshooting section
  - [x] Contributing guidelines
  - [x] License (MIT)
- [x] Create usage examples
  - [x] Example: List all windows
  - [x] Example: Capture Chrome window
  - [x] Example: Capture display
  - [x] Example: Natural language workflow
  - [x] Example: Error handling
- [x] Write troubleshooting guide
  - [x] Permission denied errors
  - [x] Window not found errors
  - [x] Native module issues
  - [x] macOS version compatibility
  - [x] Multi-monitor issues
  - [x] Retina display problems
- [ ] Add inline code documentation
  - [ ] JSDoc comments for public APIs
  - [ ] Document complex functions
  - [ ] Add usage examples in comments
- [x] Create CHANGELOG.md
  - [x] Version 0.1.0 initial release notes
  - [x] Feature list
  - [x] Known issues
- [x] Add LICENSE file
  - [x] MIT license text
- [x] Add .gitignore
  - [x] node_modules
  - [x] dist/
  - [x] *.log
  - [x] .DS_Store

---

## Phase 8: Publishing & Distribution

**Objective:** Publish to npm, create release.

**Deliverable:** Published npm package, GitHub release.

**Status:** ✅ Complete (November 24, 2025)

**Published Package:** https://www.npmjs.com/package/mac-vision-mcp

**Testing:**
- Install from npm in clean environment
- Verify all features work
- Check package size reasonable

### Tasks

#### 8.1 npm Account Setup (First Time Only)
- [x] Create npm account at https://www.npmjs.com/signup
- [x] Verify email address
- [x] Enable 2FA (required for publishing)
  - Used passkey 2FA with granular access token for publishing
- [x] Login from terminal:
  ```bash
  npm login
  npm whoami  # verify: should print your username
  ```

#### 8.2 Pre-Publish Checklist
- [x] Version number set appropriately
  - [x] Version 0.1.0 (early release)
- [x] package.json metadata complete:
  - [x] `name` - unique on npm ✓
  - [x] `description` - clear and searchable ✓
  - [x] `keywords` - relevant terms ✓
  - [x] `license` - MIT ✓
  - [x] `repository` - GitHub URL added
  - [x] `homepage` - GitHub URL added
  - [x] `bugs` - issues URL added
- [x] LICENSE file present ✓
- [x] README.md polished ✓
- [x] CHANGELOG.md updated ✓
- [x] Clean build succeeds: `rm -rf dist && npm run build`

#### 8.3 Test Package Locally
- [x] Create tarball without publishing:
  ```bash
  npm pack
  # Created: mac-vision-mcp-0.1.0.tgz (13.7 kB)
  ```
- [x] Inspect contents:
  ```bash
  tar -tzf mac-vision-mcp-*.tgz
  # Shows: package/dist/*, package/README.md, package/LICENSE (35 files total)
  ```
- [x] Check package size (13.7 kB compressed, 49.1 kB unpacked) ✓
- [x] Test local install:
  ```bash
  npm install -g ./mac-vision-mcp-*.tgz
  mac-vision-mcp  # runs correctly, shows permission prompt
  npm uninstall -g mac-vision-mcp
  rm mac-vision-mcp-*.tgz
  ```

#### 8.4 Publish to npm
- [x] Final clean build:
  ```bash
  rm -rf dist && npm run build
  ```
- [x] Publish using granular access token (passkey 2FA):
  ```bash
  NPM_TOKEN=<token> npm publish
  ```
- [x] Verify on npm: https://www.npmjs.com/package/mac-vision-mcp

#### 8.5 Post-Publish Verification
- [x] Test fresh global install:
  ```bash
  npm install -g mac-vision-mcp
  mac-vision-mcp  # verify runs
  ```
- [x] Test via npx (no install):
  ```bash
  npx -y mac-vision-mcp
  ```
- [ ] Test MCP integration with Claude Code:
  - Update config to use `npx -y mac-vision-mcp`
  - Restart Claude Code
  - Test list_windows tool

#### 8.6 GitHub Repository Setup
- [x] GitHub repository exists: https://github.com/jasich/mac-vision-mcp
- [x] Remote configured and pushed
- [ ] Add repository metadata (optional):
  - Description: "MCP server for macOS screenshot capture"
  - Topics: mcp, macos, screenshot, typescript, claude
  - Website: npm package URL

#### 8.7 Create GitHub Release
- [x] Tag the release:
  ```bash
  git tag -a v0.1.0 -m "Initial release"
  git push --tags
  ```
- [ ] Create release on GitHub (optional):
  - Go to https://github.com/jasich/mac-vision-mcp/releases/new
  - Choose tag: v0.1.0
  - Title: "v0.1.0 - Initial Release"
  - Description: Copy from CHANGELOG.md
  - Publish

#### 8.8 Update package.json with GitHub URLs
- [x] Add repository info:
  ```json
  "repository": {
    "type": "git",
    "url": "git+https://github.com/jasich/mac-vision-mcp.git"
  },
  "homepage": "https://github.com/jasich/mac-vision-mcp#readme",
  "bugs": {
    "url": "https://github.com/jasich/mac-vision-mcp/issues"
  }
  ```
- [x] Committed and pushed to GitHub
- Note: URLs included in initial 0.1.0 publish, no patch version needed

---

## Optional: Phase 9: Future Enhancements

**Objective:** Post-v1.0 improvements based on feedback.

**Deliverable:** Enhanced features and optimizations.

### Potential Tasks

- [ ] Advanced features
  - [ ] OCR text extraction from screenshots
  - [ ] Window content change detection
  - [ ] Screen recording support
  - [ ] Browser tab-specific capture
  - [ ] Active window capture shortcut
  - [ ] Clipboard integration
- [ ] Configuration options
  - [ ] Config file support (.mac-vision-mcp.json)
  - [ ] Custom temp directory
  - [ ] Screenshot format options (JPEG, WebP)
  - [ ] Quality settings
  - [ ] Auto-cleanup settings
- [ ] Performance optimizations
  - [ ] Cache window list briefly
  - [ ] Async capture with promises
  - [ ] Parallel display capture
  - [ ] Image compression options
- [ ] Cross-platform support
  - [ ] Windows support (if feasible)
  - [ ] Linux support (Wayland/X11)
- [ ] Developer tools
  - [ ] Debug mode flag
  - [ ] Verbose logging option
  - [ ] Performance metrics
  - [ ] Health check endpoint
- [ ] Alternative distribution
  - [ ] Homebrew formula
  - [ ] Standalone binary (pkg)
  - [ ] Docker container (for testing)

---

## Development Guidelines

### Code Standards
- TypeScript strict mode
- ESM modules
- Async/await for I/O
- Descriptive variable names
- Single responsibility functions
- Comprehensive error handling

### Logging Standards
- All logging to stderr only
- Never write to stdout (reserved for MCP)
- Prefix: `[mac-vision-mcp]`
- Include context in errors (window ID, file path)

### Testing Standards
- Test after each phase
- Document test results
- Keep test notes in TESTING.md
- Real-world scenarios over mocks

### Git Workflow
- Commit after each completed phase
- Descriptive commit messages
- Tag releases with semantic versions

---

## Success Criteria

### Phase Completion
Each phase complete when:
- All tasks checked off
- Testing completed successfully
- No blocking bugs
- Documentation updated

### v1.0 Release Criteria
- All Phase 0-8 tasks complete
- Works on macOS 12+
- Works on Intel and Apple Silicon
- Published to npm
- Documentation complete
- At least 3 successful test installations

---

## Timeline Estimate

| Phase | Estimated Time | Dependencies |
|-------|---------------|--------------|
| Phase 0 | 2-3 hours | None |
| Phase 1 | 3-4 hours | Phase 0 |
| Phase 2 | 4-5 hours | Phase 1 |
| Phase 3 | 5-6 hours | Phase 2 |
| Phase 4 | 3-4 hours | Phase 3 |
| Phase 5 | 4-5 hours | Phases 2-4 |
| Phase 6 | 6-8 hours | All above |
| Phase 7 | 4-5 hours | Phase 6 |
| Phase 8 | 2-3 hours | Phase 7 |
| **Total** | **33-43 hours** | ~1-2 weeks full-time |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| node-screenshots issues | Test early, have fallback plan |
| Permission UX confusion | Excellent error messages, clear docs |
| Native addon build problems | Use prebuilt binaries, document requirements |
| macOS API deprecation | Monitor Apple docs, plan migration path |
| MCP protocol changes | Pin SDK version, monitor updates |

---

## Notes

- Prioritize iterative testing over big-bang release
- Get user feedback early (alpha testers)
- Document unexpected issues immediately
- Keep RESEARCH.md updated with new findings
- Consider security implications of screenshot access
- Plan for maintenance and updates

---

**Ready for Phase 0 implementation.**
