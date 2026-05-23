import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "PKMM.ONLINE - Phạm Khánh Minh Mẫn | E-commerce API Developer",
  description: "Trang thông tin cá nhân và tài liệu hướng dẫn sử dụng các thư viện Shopee API, TikTok Shop API, Lazada API và giải pháp e-commerce.",
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
    <html lang="vi" className={`${inter.variable} ${lora.variable} antialiased`}>
      <body className="bg-[#faf9f6] text-[#1a1a1a] min-h-screen">
        {children}
      </body>
    </html>
  );
}
