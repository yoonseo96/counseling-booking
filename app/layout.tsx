import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "상담 예약",
  description: "상담 예약 확인",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
