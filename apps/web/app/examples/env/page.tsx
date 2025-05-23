import { MapApiKeyExample } from '@/components/examples/EnvExample';
import ServerEnvExample from '@/components/examples/ServerEnvExample';

export const metadata = {
  title: 'Environment Variables Example',
};

export default function EnvExamplePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Example</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Client-Side Environment Variables</h2>
          <p className="mb-4 text-gray-700">
            These environment variables are available in both client and server components.
            They must be prefixed with <code className="bg-gray-100 px-1">NEXT_PUBLIC_</code>.
          </p>
          <MapApiKeyExample />
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Server-Side Environment Variables</h2>
          <p className="mb-4 text-gray-700">
            These environment variables are only available in server components and API routes.
            They are not exposed to the client.
          </p>
          <ServerEnvExample />
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="prose">
            <p>
              This project uses <a href="https://github.com/colinhacks/zod" className="text-blue-600 hover:underline">Zod</a> for 
              schema validation and <a href="https://github.com/t3-oss/env-nextjs" className="text-blue-600 hover:underline">@t3-oss/env-nextjs</a> for 
              Next.js integration.
            </p>
            <p>
              The environment schema is defined in <code>apps/web/src/env.mjs</code> and validated at build time and runtime.
            </p>
            <p>
              If any required environment variables are missing or invalid, the application will fail to build or start with a helpful error message.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}