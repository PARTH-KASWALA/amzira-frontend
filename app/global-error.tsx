"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main style={{ fontFamily: "Arial, sans-serif", margin: "4rem auto", maxWidth: 640, padding: "0 1.5rem" }}>
          <h1>We could not finish that stitch.</h1>
          <p>Please refresh the page. Your cart and selections are still safe.</p>
        </main>
      </body>
    </html>
  );
}
