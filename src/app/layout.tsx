import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🤝 Mission Control - AI Command Center",
  description: "Your AI-powered command center for tasks, content, calendar, memory, team, and office automation. Built with Next.js and Supabase.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
