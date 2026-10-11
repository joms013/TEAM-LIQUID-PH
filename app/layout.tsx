import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sign in | Hope ERP",
  description: "Sign in to the Hope, Inc. team workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}