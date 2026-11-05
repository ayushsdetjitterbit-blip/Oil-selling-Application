import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Natural Oil | Wooden kolhu pressed, unrefined oils", template: "%s | Natural Oil" },
  description: "Buy pure, unrefined oils made the traditional way in a wooden kolhu. Groundnut, sesame, coconut, mustard and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
