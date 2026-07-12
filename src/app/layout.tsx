import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/site/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Better Component",
  description: "A component library of animated, copy-paste React components.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* overflow-x-clip is a backstop: a single wide demo (a marquee, a code
          sample) must never make the whole page pan sideways on a phone. */}
      <body className="flex min-h-full flex-col overflow-x-clip">
        {/* Loaded here (not as a raw <html> child) with a precedence so React 19
            hoists + dedupes it into <head>. These families are referenced by
            literal name inside the Animate editor, so next/font isn't a fit. */}
        <link
          rel="stylesheet"
          precedence="default"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Instrument+Serif&family=Playfair+Display:wght@400;500;600;700&family=Pinyon+Script&display=swap"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
