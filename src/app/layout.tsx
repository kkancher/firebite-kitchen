import type { Metadata } from "next";
import { Mulish, Prata } from "next/font/google";
import "./globals.css";

const bodyFont = Mulish({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const displayFont = Prata({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "FireBite Kitchen",
    template: "%s | FireBite Kitchen",
  },
  description: "Flame-grilled favorites, handcrafted comfort food, and desserts made with heart.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}