import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "배당 계산기",
  description: "몇 주 사면 매달 얼마 받을까?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
