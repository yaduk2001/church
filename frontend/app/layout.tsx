import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HtmlLangSetter from "./components/HtmlLangSetter";
import { LanguageProvider } from "./contexts/LanguageContext";

export const metadata: Metadata = {
  title: "St Mary's Jacobite Syrian Church, Malayidomthuruth",
  description: "Welcome to St Mary's Jacobite Syrian Church, Malayidomthuruth. Join us for mass, prayer requests, events, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;700&family=Manjari:wght@400;700&family=Noto+Sans+Malayalam:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider>
          <HtmlLangSetter />
          <Navbar />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
