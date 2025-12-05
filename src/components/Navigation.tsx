"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Navigation() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated by calling the API
    fetch("/api/user/clubs")
      .then((res) => {
        setIsAuthenticated(res.ok);
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Sikeresen kijelentkeztél");
        setIsAuthenticated(false);
        router.push("/");
      } else {
        toast.error("Kijelentkezés sikertelen");
      }
    } catch (error) {
      toast.error("Hiba történt a kijelentkezés során");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 backdrop-blur-xl bg-background/90 shadow-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
            <Trophy className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none">OAC Portál</span>
            <span className="text-xs text-muted-foreground">powered by tDarts</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/#about" className="transition-colors hover:text-primary">
            Rólunk
          </Link>
          <Link href="/search" className="transition-colors hover:text-primary">
            Felfedezés
          </Link>
          <Link href="/#rules" className="transition-colors hover:text-primary">
            Szabályok
          </Link>
          <Link href="/#apply" className="transition-colors hover:text-primary">
            Jelentkezés
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="px-6 py-2 rounded-xl font-semibold text-sm text-muted-foreground">
              ...
            </div>
          ) : isAuthenticated ? (
            <>
              <Link 
                href="/dashboard"
                className="px-6 py-2 rounded-xl font-semibold transition-all duration-300 bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 text-sm"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl font-semibold transition-all duration-300 border-2 border-primary/50 hover:border-primary hover:bg-primary/10 text-sm flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Kijelentkezés
              </button>
            </>
          ) : (
            <Link 
              href="/login"
              className="px-6 py-2 rounded-xl font-semibold transition-all duration-300 bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 text-sm"
            >
              Bejelentkezés
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
