import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#08080c",
};

export const metadata: Metadata = {
  title: {
    default: "EmailForge — AI Email Sequence Builder",
    template: "%s | EmailForge",
  },
  description:
    "Generate complete, high-converting email sequences with AI. Cold outreach, welcome drips, follow-ups, re-engagement — crafted by Claude in seconds.",
  metadataBase: new URL("https://emailforge-ai.vercel.app"),
  openGraph: {
    title: "EmailForge — AI Email Sequence Builder",
    description:
      "Generate complete, high-converting email sequences with AI in seconds.",
    type: "website",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#0f0f16",
              color: "#f1f0ff",
              border: "1px solid #1e1e2e",
              borderRadius: "10px",
              fontSize: "13px",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              padding: "10px 14px",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#0f0f16" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#0f0f16" },
            },
          }}
        />
      </body>
    </html>
  );
}
