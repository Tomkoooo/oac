"use client";

import Link from "next/link";
import Image from "next/image";
import { IconLogout, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const router = useRouter();
  const { isAuthenticated, loading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Sikeresen kijelentkeztél");
        logout(); // Update context
        router.push("/");
      } else {
        toast.error("Kijelentkezés sikertelen");
      }
    } catch {
      toast.error("Hiba történt a kijelentkezés során");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
          <div className="relative h-8 w-8">
             <Image src="/tdarts_fav.svg" alt="OAC Logo" fill className="object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none tracking-tight">OAC Portál</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">powered by tDarts</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/#hero" className="text-muted-foreground hover:text-primary transition-colors">
            Főoldal
          </Link>
          <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors">
            Felfedezés
          </Link>
          <Link href="/#rules" className="text-muted-foreground hover:text-primary transition-colors">
            Szabályok
          </Link>
          <Link href="/#apply" className="text-muted-foreground hover:text-primary transition-colors">
            Jelentkezés
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
          ) : isAuthenticated ? (
            <>
              <Button asChild variant="default" size="sm" className="shadow-lg shadow-primary/20">
                <Link href="/dashboard" className="gap-2">
                    <IconUser className="w-4 h-4" />
                    Dashboard
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <IconLogout className="w-4 h-4" />
                <span className="sr-only">Kijelentkezés</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                   <Link href="/admin/dashboard" className="transition-colors">
                      Admin
                   </Link>
                </Button>
                <Button asChild variant="default" size="sm" className="shadow-lg shadow-primary/20">
                  <Link href="/login">
                      Bejelentkezés
                  </Link>
                </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
