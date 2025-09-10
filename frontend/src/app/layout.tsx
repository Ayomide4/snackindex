import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "The Snack Index - Track Snack Food Popularity",
  description: "Track, analyze, and discover the search performance of your favorite snacks with real-time data and insights from Google Trends, Reddit, and news sources.",
  keywords: ["snacks", "food trends", "analytics", "Google Trends", "Reddit", "sentiment analysis"],
  authors: [{ name: "Snack Index Team" }],
  openGraph: {
    title: "The Snack Index",
    description: "Track snack food popularity with real-time data and insights",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Snack Index",
    description: "Track snack food popularity with real-time data and insights",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
