const nextEnv = require('@next/env'); 

nextEnv.loadEnvConfig('./')

const requiredEnvs = ["NEXT_PUBLIC_BACKEND_URL", "NEXT_PUBLIC_SOCKET_URL", "NEXT_PUBLIC_FRONTEND_URL","API_TOKEN", "NEXT_PUBLIC_GOOGLE_ANALYTICS_ID", "NEXT_PUBLIC_COOKIE_EXPIRATION_TIME", "NEXT_PUBLIC_GCP_BUCKET"];

const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);

if (missingEnvs.length > 0) {
  console.error("Fatal Error: Missing required environment variables:");
  missingEnvs.forEach((env) => {
    console.error(`- ${env}`);
  });
  process.exit(1);
} else {
  console.log("All environment variables are present.")
}
