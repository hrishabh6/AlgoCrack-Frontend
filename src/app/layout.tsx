import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider, DevErrorSilencer, ProblemLibrarySync } from "@/components/providers";
import { Header, Footer } from "@/components/layout";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlgoCrack — Practice coding interview problems",
  description:
    "Practice coding problems, prepare for technical interviews, and improve your programming skills with AlgoCrack.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Script
          id="dev-error-silencer-early"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                if (typeof window === "undefined") return;
                if ("${process.env.NODE_ENV}" !== "development") return;
                var isPlainObject = function (v) {
                  return typeof v === "object" && v !== null && Object.prototype.toString.call(v) === "[object Object]";
                };
                var shouldSilence = function (r) {
                  if (r === "[object Object]") return true;
                  if (r instanceof Error) return r.message === "[object Object]";
                  if (isPlainObject(r)) {
                    if (r.message === "[object Object]") return true;
                    return Object.keys(r).length > 0;
                  }
                  return false;
                };
                window.addEventListener("error", function (e) {
                  if (e.message === "[object Object]" || shouldSilence(e.error)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                  }
                }, { capture: true });
                window.addEventListener("unhandledrejection", function (e) {
                  if (shouldSilence(e.reason)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                  }
                }, { capture: true });
              })();
            `,
          }}
        />
        <ThemeProvider>
          <DevErrorSilencer />
          <AuthProvider>
            <ProblemLibrarySync />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
