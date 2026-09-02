import type { Metadata } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import "@/app/globals.css";
import { AppChrome } from "@/components/app-chrome";
import { JsonLd } from "@/components/json-ld";
import { SessionProvider } from "@/components/session-provider";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap"
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap"
});

export const metadata: Metadata = buildMetadata({
  title: "South Indian Kids Lehenga Choli",
  path: "/"
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <SessionProvider>
          <JsonLd data={organizationJsonLd()} />
          <AppChrome>{children}</AppChrome>
        </SessionProvider>
      </body>
    </html>
  );
}
