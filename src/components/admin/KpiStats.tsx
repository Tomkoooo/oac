"use client";

import { 
  Building2, 
  Users, 
  Trophy, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiStatsProps {
  stats: {
    clubCount?: number;
    playerCount?: number;
    tournamentCount?: number;
    pendingApplications?: number;
  } | null;
  loading?: boolean;
}

export function KpiStats({ stats, loading }: KpiStatsProps) {
  const items = [
    {
      title: "Verifikált Klubok",
      value: stats?.clubCount ?? 0,
      icon: Building2,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Versenyzők",
      value: stats?.playerCount ?? 0,
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      title: "Összes Verseny",
      value: stats?.tournamentCount ?? 0,
      icon: Trophy,
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
    },
    {
      title: "Függő Jelentkezések",
      value: stats?.pendingApplications ?? 0,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      urgent: (stats?.pendingApplications ?? 0) > 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <Card key={index} className={cn(
          "relative overflow-hidden border bg-card/40 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-black/20 group",
          item.border
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {item.title}
            </CardTitle>
            <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110 duration-500", item.bg)}>
              <item.icon className={cn("h-4 w-4", item.color)} />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold tracking-tight">{item.value}</div>
                {item.urgent && (
                  <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                )}
              </div>
            )}
            <div className="mt-4 flex items-center text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
               Frissítve: Ma {new Date().getHours()}:00
            </div>
          </CardContent>
          
          {/* Subtle background glow */}
          <div className={cn(
            "absolute -right-4 -bottom-4 h-24 w-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
            item.bg
          )} />
        </Card>
      ))}
    </div>
  );
}
