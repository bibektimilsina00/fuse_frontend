/**
 * Development Logger Utility
 * 
 * Provides structured logging that only outputs in development mode.
 * Use this instead of console.log for debugging.
 */

const isDev = process.env.NODE_ENV === 'development'

interface LogContext {
    [key: string]: any
}

class Logger {
    private prefix: string

    constructor(prefix: string = 'App') {
        this.prefix = prefix
    }

    private formatMessage(level: string, message: string): string {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
        return `[${timestamp}] [${this.prefix}] ${level}: ${message}`
    }

    /**
     * Debug log - only shows in development
     */
    debug(message: string, context?: LogContext): void {
        if (!isDev) return
        console.log(this.formatMessage('DEBUG', message), context || '')
    }

    /**
     * Info log - only shows in development
     */
    info(message: string, context?: LogContext): void {
        if (!isDev) return
        console.info(this.formatMessage('INFO', message), context || '')
    }

    /**
     * Warning log - always shows
     */
    warn(message: string, context?: LogContext): void {
        console.warn(this.formatMessage('WARN', message), context || '')
    }

    /**
     * Error log - always shows
     */
    error(message: string, error?: Error | unknown, context?: LogContext): void {
        console.error(this.formatMessage('ERROR', message), error, context || '')
    }

    /**
     * Create a child logger with a specific prefix
     */
    child(childPrefix: string): Logger {
        return new Logger(`${this.prefix}:${childPrefix}`)
    }
}

// Pre-configured loggers for different modules
export const logger = new Logger('Automation')
export const workflowLogger = logger.child('Workflow')
export const validationLogger = logger.child('Validation')
export const wsLogger = logger.child('WebSocket')

// Default export for general use
export default logger
