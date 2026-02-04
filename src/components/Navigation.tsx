import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconLogout, IconPhoneCall, IconUser, IconMenu2 } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navigation() {
  const router = useRouter();
  const { isAuthenticated, loading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Sikeresen kijelentkeztél");
        if (logout) logout(); // Update context
        window.location.href = "/";
        setIsOpen(false);
      } else {
        toast.error("Kijelentkezés sikertelen");
      }
    } catch {
      toast.error("Hiba történt a kijelentkezés során");
    }
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => {
    const links = [
      { href: "/#hero", label: "Főoldal" },
      { href: "https://tdarts.hu/search?isOac=true", label: "Felfedezés" },
      { href: "/#rules", label: "Szabályok" },
      { href: "/#apply", label: "Jelentkezés" },
    ];

    if (mobile) {
      return (
        <>
          {links.map((link) => (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              className="w-full justify-start h-12 text-base font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl"
              onClick={() => setIsOpen(false)}
            >
              <Link href={link.href}>
                {link.label}
              </Link>
            </Button>
          ))}
        </>
      );
    }

    return (
      <>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </>
    );
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
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-3">
          {/* Mobile Menu Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <IconMenu2 className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="text-left border-b border-border/10 pb-6 mb-6">
                <SheetTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    Menü
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-2 px-2">
                    <NavLinks mobile />
                </div>
                
                <div className="pt-6 border-t border-border/10 flex flex-col gap-4">
                    {loading ? (
                        <div className="h-10 w-full bg-muted animate-pulse rounded-xl" />
                    ) : isAuthenticated ? (
                        <div className="space-y-3 px-2">
                            <Button asChild variant="default" className="w-full justify-start h-12 text-base font-medium shadow-lg shadow-primary/20 rounded-xl" size="lg">
                                <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                    <IconUser className="w-5 h-5 mr-3" />
                                    Vezérlőpult
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start h-12 text-base font-medium border-border/50 bg-card/50 hover:bg-card rounded-xl" size="lg">
                                <Link href="/dashboard#support" onClick={() => setIsOpen(false)}>
                                    <IconPhoneCall className="w-5 h-5 mr-3" />
                                    Kapcsolat
                                </Link>
                            </Button>
                            <Button 
                                variant="ghost" 
                                className="w-full justify-start h-12 text-base font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                onClick={handleLogout}
                                size="lg"
                            >
                                <IconLogout className="w-5 h-5 mr-3" />
                                Kijelentkezés
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 px-2">
                            <Button asChild variant="default" className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 rounded-xl" size="lg">
                                <Link href="/login" onClick={() => setIsOpen(false)}>
                                    Bejelentkezés
                                </Link>
                            </Button>
                             <Button asChild variant="ghost" className="w-full h-12 text-base font-medium text-muted-foreground hover:text-primary rounded-xl" size="lg">
                                <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
                                    Admin Bejelentkezés
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
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
                <Button asChild variant="secondary" size="sm" className="shadow-lg shadow-primary/20">
                    <Link href="/dashboard#support" className="gap-2">
                        <IconPhoneCall className="w-4 h-4" />
                        Kapcsolat
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
      </div>
    </header>
  );
}
