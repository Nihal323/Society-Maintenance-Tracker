import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Society Maintenance Tracker | Smart Residential Management",
  description: "Comprehensive maintenance complaint tracking, automated overdue detection, history audit trails, and instant resident notice board.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
