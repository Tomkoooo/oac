"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, ChevronLeft, Menu, Gauge, BarChart3, Users, Building2, Settings, Mail, ShieldAlert, FileText } from "lucide-react";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Inline navigation config
const adminNavigation = [
  {
    title: "Áttekintés",
    items: [
      { title: "Vezérlőpult", href: "/admin/dashboard", icon: Gauge },
      { title: "Statisztikák", href: "/admin/stats", icon: BarChart3 },
    ],
  },
  {
    title: "Kezelés",
    items: [
      { title: "Felhasználók", href: "/admin/users", icon: Users },
      { title: "Jelentkezések", href: "/admin/applications", icon: FileText },
      { title: "Klubok", href: "/admin/clubs", icon: Building2 },
      { title: "Hírlevél", href: "/admin/mailer", icon: Mail },
    ],
  },

  {
    title: "Rendszer",
    items: [
      { title: "Integritás", href: "/admin/integrity", icon: ShieldAlert },
      { title: "Beállítások", href: "/admin/settings", icon: Settings },
    ],
  },
];

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileOpen(false);
  }, [pathname]);

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full py-4">
      <div className="px-6 py-2">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20 border border-warning/50">
            <Shield className="h-5 w-5 text-warning" />
          </div>
          <span>OAC Admin</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-4 mt-6">
        <div className="space-y-6">
          {adminNavigation.map((group, i) => (
            <div key={i} className="py-2">
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item, j) => {
                   const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                   return (
                    <Button
                      key={j}
                      asChild
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-2", 
                        isActive && "bg-secondary/80 font-medium"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="px-6 mt-auto pt-4 border-t border-border/50">
         <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || "A"}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{session?.user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email || "loading..."}</p>
            </div>
         </div>
         <Button variant="ghost" className="w-full justify-start gap-2 mt-2 text-muted-foreground hover:text-destructive" asChild>
             <Link href="/api/auth/signout">
                 <ChevronLeft className="h-4 w-4" />
                 Kijelentkezés
             </Link>
         </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Fixed */}
      <aside className={cn("hidden lg:flex lg:flex-col w-64 fixed inset-y-0 left-0 border-r border-border/40 bg-card/30 backdrop-blur-xl z-30", className)}>
        {renderSidebarContent()}
      </aside>
      
      {/* Spacer div to push content to the right of fixed sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0" />

      {/* Mobile Sidebar Trigger & Sheet */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shadow-lg bg-background/80 backdrop-blur-sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            {renderSidebarContent()}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
