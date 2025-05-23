/**
 * Create the Winston logger
 */
export declare const winstonLogger: any;
/**
 * Add request context to log entries
 * @param req Express request object
 * @returns Logger with request context
 */
export declare function loggerWithRequest(req: any): {
    debug: (message: string, meta?: Record<string, any>) => any;
    info: (message: string, meta?: Record<string, any>) => any;
    warn: (message: string, meta?: Record<string, any>) => any;
    error: (message: string, error?: Error, meta?: Record<string, any>) => any;
};
export default winstonLogger;
//# sourceMappingURL=winston-logger.d.ts.map