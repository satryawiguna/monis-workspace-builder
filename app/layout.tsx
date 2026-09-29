import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monis Rent — Workspace Configurator",
  description:
    "Build a workspace visually from desks, chairs and extras, review the setup and send a simulated rental request. A concept demo, not a Monis booking.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
