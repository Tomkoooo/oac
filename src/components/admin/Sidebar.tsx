"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  LogOut, 
  Menu, 
  Gauge, 
  BarChart3, 
  Users, 
  Building2, 
  Settings, 
  Mail, 
  ShieldAlert, 
  FileText 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Navigation structure
const adminNavigation = [
  { title: "Vezérlőpult", href: "/admin/dashboard", icon: Gauge },
  { title: "Statisztikák", href: "/admin/stats", icon: BarChart3 },
  { title: "Felhasználók", href: "/admin/users", icon: Users },
  { title: "Jelentkezések", href: "/admin/applications", icon: FileText, badge: "pending" },
  { title: "Klubok", href: "/admin/clubs", icon: Building2 },
  { title: "Hírlevél", href: "/admin/mailer", icon: Mail },
  { title: "Integritás", href: "/admin/integrity", icon: ShieldAlert, badge: "warning" },
  { title: "Beállítások", href: "/admin/settings", icon: Settings },
];

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [integrityCount, setIntegrityCount] = useState(0);

  // Fetch live counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.pendingApplications?.length || 0);
          setIntegrityCount(data.integrityStats?.totalFlagged || 0);
        }
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    };
    
    fetchCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30">
            <Shield className="h-6 w-6 text-warning" />
          </div>
          <div>
            <div className="font-bold text-lg leading-none">OAC</div>
            <div className="text-xs text-muted-foreground mt-0.5">ADMIN</div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/admin");
            const badgeCount = item.badge === "pending" ? pendingCount : item.badge === "warning" ? integrityCount : 0;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-gradient-to-r from-warning/15 to-warning/5 text-warning font-medium shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-warning rounded-r-full" />
                  )}
                  
                  {/* Icon */}
                  <item.icon className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-warning" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  
                  {/* Title */}
                  <span className="flex-1 text-sm">{item.title}</span>
                  
                  {/* Badge */}
                  {badgeCount > 0 && (
                    <Badge 
                      variant={item.badge === "warning" ? "destructive" : "secondary"}
                      className={cn(
                        "h-5 min-w-[20px] px-1.5 text-xs font-semibold",
                        item.badge === "warning" 
                          ? "bg-destructive/20 text-destructive border-destructive/30" 
                          : "bg-warning/20 text-warning border-warning/30"
                      )}
                    >
                      {badgeCount}
                    </Badge>
                  )}
                  
                  {/* Active dot */}
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* User Footer */}
      <div className="px-3 py-4 border-t border-border/40">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-warning/30 to-warning/10 flex items-center justify-center border border-warning/20">
            <span className="text-xs font-bold text-warning">
              {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email || "loading..."}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            title="Kijelentkezés"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Fixed */}
      <aside className={cn(
        "hidden lg:flex lg:flex-col w-64 fixed inset-y-0 left-0 border-r border-border/40 bg-card/50 backdrop-blur-xl z-30",
        className
      )}>
        {renderSidebarContent()}
      </aside>
      
      {/* Spacer div to push content to the right of fixed sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0" />

      {/* Mobile Sidebar Trigger & Sheet */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shadow-lg bg-background/95 backdrop-blur-sm border-border/40">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-border/40">
            {renderSidebarContent()}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
