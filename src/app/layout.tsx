import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "./components/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "unFilo - Next-Gen File Converter",
  description: "Convert files effortlessly with a futuristic experience.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <div className="min-h-screen flex flex-col">
          {/* MAIN CONTENT */}
          <main className="flex-grow container mx-auto p-4">{children}</main>

          {/* FOOTER */}
          <Footer />
        </div>
      </body>
    </html>
  );
}
