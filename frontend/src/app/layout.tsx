import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "ThesiBook | Κλείσε τη θέση σου εύκολα",
  description:
    "Η πλατφόρμα online κρατήσεων για σεμινάρια και εκπαιδευτικές επιχειρήσεις στην Ελλάδα.",
  openGraph: {
    title: "ThesiBook | Κλείσε τη θέση σου εύκολα",
    description:
      "Online κρατήσεις για σεμινάρια, workshops, ακαδημίες και training businesses στην Ελλάδα.",
    type: "website",
    locale: "el_GR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el">
      <body className={`${plusJakartaSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
