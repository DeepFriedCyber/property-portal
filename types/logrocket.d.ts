/**
 * Type definitions for LogRocket
 */

declare module 'logrocket' {
  interface LogRocketOptions {
    release?: string;
    console?: {
      isEnabled?: {
        log?: boolean;
        warn?: boolean;
        error?: boolean;
      };
    };
    network?: {
      isEnabled?: boolean;
      requestSanitizer?: (request: any) => any;
      responseSanitizer?: (response: any) => any;
    };
  }

  interface LogRocketInstance {
    init(appId: string, options?: LogRocketOptions): void;
    identify(userId: string, userInfo?: Record<string, any>): void;
    log(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: string, context?: Record<string, any>): void;
    captureException(error: Error, options?: { tags?: string[]; extra?: Record<string, any> }): void;
    getSessionURL(callback: (sessionURL: string) => void): void;
  }

  const LogRocket: LogRocketInstance;
  export default LogRocket;
}