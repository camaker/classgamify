// DO NOT DELETE THIS FILE!!!
// This file is a good smoke test to make sure the custom server entry is working
import handler from '@tanstack/react-start/server-entry';

function logServerEntryEnv(): void {
  console.log("[server-entry]: using custom server entry in 'src/server.ts'");

  console.log("import.meta.env.BASE_URL", import.meta.env.BASE_URL);
  console.log("import.meta.env.MODE", import.meta.env.MODE);
  console.log("import.meta.env.DEV", import.meta.env.DEV);
  console.log("import.meta.env.PROD", import.meta.env.PROD);
  console.log("import.meta.env.SSR", import.meta.env.SSR);
  
  console.log("process.env.VITE_BASE_URL", process.env.VITE_BASE_URL);
  console.log("process.env.GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID);
  console.log("process.env.GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET);
  console.log("process.env.BETTER_AUTH_SECRET", process.env.BETTER_AUTH_SECRET);
  console.log("process.env.RESEND_API_KEY", process.env.RESEND_API_KEY);
  console.log("process.env.STORAGE_PUBLIC_URL", process.env.STORAGE_PUBLIC_URL);
}

logServerEntryEnv();

export default {
  fetch(request: Request) {
    return handler.fetch(request, {
      context: {
        fromFetch: true,
      },
    });
  },
};
