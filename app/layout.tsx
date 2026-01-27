import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Veta | Descubre Oportunidades",
  description: "Encuentra problemas reales que puedes resolver. Analiza el mercado con IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[var(--background)] text-[var(--foreground)] antialiased`}>
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-62L3KYMF35" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-62L3KYMF35');
        `}
      </Script>
    </html>
  );
}
