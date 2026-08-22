import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import ToastContainer from "@/components/ToastContainer";

export const metadata: Metadata = {
  title: "GlobeTrotter - Empowering Personalized Travel Planning",
  description: "End-to-end intelligent travel planning tool for multi-city itineraries, budget estimation, interactive timelines, and discovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 antialiased selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AuthModal />
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
