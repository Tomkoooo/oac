"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import Image from "next/image";

export default function PublicLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRequest = pathname?.startsWith("/admin");

  if (isAdminRequest) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation />
      <main className="pt-16">
        {children}
      </main>
      <footer className="border-t border-border/40 py-8 md:py-12 bg-background/50 backdrop-blur-xl mt-16">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Image src="/tdarts_fav.svg" alt="OAC" width={20} height={20} />
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
    </>
  );
}
