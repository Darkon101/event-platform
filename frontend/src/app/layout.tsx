import type { Metadata } from "next";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Event Platform",
  description: "Community events platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        <ClientWrapper>
          <Navigation/>
          <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        </ClientWrapper>
      </body>
    </html>
  );
}
