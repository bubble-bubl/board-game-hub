import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoardHub - 보드게임 허브",
  description: "마이티 카드게임을 온라인으로 즐기세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-background text-text">
        {children}
      </body>
    </html>
  );
}
