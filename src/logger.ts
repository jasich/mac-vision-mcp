/**
 * Logging Utility
 *
 * Provides structured logging to stderr with timestamps and log levels.
 * All output goes to stderr to avoid interfering with MCP stdio protocol.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private prefix = '[mac-vision-mcp]';

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `${timestamp} ${this.prefix} ${level} ${message}${contextStr}`;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    console.error(this.formatMessage(LogLevel.DEBUG, message, context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.error(this.formatMessage(LogLevel.INFO, message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.error(this.formatMessage(LogLevel.WARN, message, context));
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorContext = error instanceof Error
      ? { error: error.message, stack: error.stack, ...context }
      : { error: String(error), ...context };
    console.error(this.formatMessage(LogLevel.ERROR, message, errorContext));
  }
}

export const logger = new Logger();
