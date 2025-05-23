declare module '@t3-oss/env-nextjs' {
  import { z } from 'zod'

  export function createEnv<
    TServer extends Record<string, z.ZodType>,
    TClient extends Record<string, z.ZodType>,
    TRuntimeEnv extends Record<string, string | undefined>,
  >(options: {
    server: TServer
    client: TClient
    runtimeEnv: TRuntimeEnv
  }): {
    [K in keyof TServer | keyof TClient]: z.infer<
      K extends keyof TServer ? TServer[K] : K extends keyof TClient ? TClient[K] : never
    >
  }
}
