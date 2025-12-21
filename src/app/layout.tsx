import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/auth/AuthContext";
import PublicLayoutWrapper from "@/components/layout/PublicLayoutWrapper";

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
        <link rel="icon" href="/tdarts_fav.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Toaster position="top-left" reverseOrder={false}/>
        <AuthProvider>
          <PublicLayoutWrapper>
            {children}
          </PublicLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
