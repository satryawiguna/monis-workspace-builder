import type { Metadata } from "next";
import { Hanken_Grotesk, Young_Serif } from "next/font/google";
import "./globals.css";

// Variable font: one file covers the 400–700 weights DESIGN.md uses.
const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

const youngSerif = Young_Serif({
  variable: "--font-young-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monis Rent — Workspace Configurator",
  description:
    "Build a workspace visually from desks, chairs and extras, review the setup and send a simulated rental request. A concept demo, not a Monis booking.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${youngSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
