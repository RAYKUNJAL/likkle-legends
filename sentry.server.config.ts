import * as Sentry from "@sentry/nextjs";
import { serverEnv } from "./lib/env/server";

Sentry.init({
    dsn: serverEnv.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    debug: false,
    environment: serverEnv.NODE_ENV,
});
