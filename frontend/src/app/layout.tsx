import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "FutbolIA | Predicción de fútbol con Machine Learning",
  description: "Sistema de predicción de resultados de La Liga basado en modelos XGBoost, Expected Goals (xG) y clasificaciones Elo dinámicas. Probabilidades 1X2 calculadas a partir de datos reales.",
};

import { AuthProvider } from "@/context/AuthContext";
import CookieBanner from "@/components/CookieBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0D1117] text-white selection:bg-[#C8A252]/20`}
      >
        <AuthProvider>
          {children}
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
