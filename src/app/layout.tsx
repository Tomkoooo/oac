import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { Toaster } from "react-hot-toast";
import Navigation from "@/components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "OAC Portál - Magyar Nemzeti Amatőr Liga",
    template: "%s | OAC Portál"
  },
  description: "Csatlakozz Magyarország vezető amatőr darts ligájához. Hivatalos jelentkezési portál a tDarts platformmal integrálva.",
  keywords: ["darts", "liga", "magyar", "amatőr", "nemzeti", "OAC", "tDarts"],
  authors: [{ name: "OAC & tDarts" }],
  creator: "OAC",
  publisher: "OAC",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3001"),
  themeColor: "#b62441",
  colorScheme: "dark",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "hu_HU",
    siteName: "OAC Portál",
    title: "OAC Portál - Magyar Nemzeti Amatőr Liga",
    description: "Csatlakozz Magyarország vezető amatőr darts ligájához",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#b62441" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Toaster position="top-left" reverseOrder={false}/>
        {/* Navigation */}
        <Navigation />

        {/* Main Content - Add padding for fixed header */}
        <main className="pt-16">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 py-8 md:py-12 bg-background/50 backdrop-blur-xl mt-16">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                  © 2024 OAC Portál. Minden jog fenntartva.
                </p>
              </div>
              <nav className="flex gap-6">
                <a 
                  href="https://tdarts.sironic.hu" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  tDarts Platform
                </a>
                <Link href="/search" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Felfedezés
                </Link>
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Admin
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
