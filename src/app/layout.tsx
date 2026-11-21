import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Report city problems, track every fix`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "CityFix connects citizens with their city: report potholes, broken street lights and missed garbage pickups, apply for paid municipal services, and follow every request against its SLA.",
  applicationName: SITE_NAME,
  keywords: ["city complaints", "municipal services", "civic tech", "SLA tracking", "Bangladesh"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Report city problems, track every fix`,
    description: "File complaints, pay for municipal services and track every request until it is resolved.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: SITE_NAME },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7fbfb" },
    { media: "(prefers-color-scheme: dark)", color: "#141b20" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
