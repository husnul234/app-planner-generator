import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AppPlanner AI - Generator Blueprint & Arsitektur Terstandarisasi",
  description:
    "Rancang 11 dokumen blueprint perangkat lunak terstandarisasi dengan integrasi penuh infrastruktur serverless Neon Postgres, Object Storage, Auth, dan Functions.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090d16",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
