"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Building2, 
  Users, 
  Settings,
  AlertTriangle,
  RefreshCw,
  Search,
  BarChart3 as ChartBar,
  ShieldAlert,
  Gauge
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { KpiStats } from "@/components/admin/KpiStats";
import { PageHeader } from "@/components/admin/PageHeader";
import { ActivityItem, ActivityFeed } from "@/components/admin/ActivityFeed";
import { VerifiedGrowthChart } from "@/components/admin/VerifiedGrowthChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Application {
  _id: string;
  clubName: string;
  status: string;
  submittedAt: string;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [growthData, setGrowthData] = useState<any>({ clubs: [], tournaments: [] });
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const statsRes = await fetch('/api/admin/stats');

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.globalStats);
        setRecentApps(data.pendingApplications || []);
        // Safely set activities, ensuring it's an array
        setActivities(Array.isArray(data.recentLogs) ? data.recentLogs : []);
        setGrowthData(data.growthStats || { clubs: [], tournaments: [] });
      } else {
        throw new Error('Stats fetch failed');
      }
    } catch (error) {
        // toast.error("Nem sikerült betölteni az adatokat");
        console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const kpiData = stats ? {
    clubCount: stats.verifiedClubCount || 0,
    playerCount: stats.totalPlayers || 0,
    tournamentCount: stats.totalTournaments || 0,
    pendingApplications: recentApps.length
  } : null;

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Vezérlőpult" 
        description={`Üdvözöljük, ${session?.user?.name || "Admin"}. Itt áttekintheti a rendszer állapotát.`}
        icon={Gauge}
      >
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchDashboardData()} disabled={refreshing} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Frissítés
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={async () => {
              try {
                const res = await fetch('/api/admin/stats/snapshot', { method: 'POST' });
                if (res.ok) {
                  toast.success('Statisztikai pillanatkép létrehozva!');
                  fetchDashboardData();
                } else {
                  throw new Error('Snapshot failed');
                }
              } catch (error) {
                toast.error('Nem sikerült létrehozni a pillanatképet');
              }
            }}
            className="gap-2"
          >
            <ChartBar className="h-4 w-4" />
            Pillanatkép
          </Button>
        </div>
      </PageHeader>

      <KpiStats stats={kpiData} loading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
             <VerifiedGrowthChart clubData={growthData.clubs} tournamentData={growthData.tournaments} />
             
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-6 flex flex-col gap-3 border-border/50 bg-card/40 hover:bg-card/60 hover:border-primary/50 transition-all group" asChild>
                    <Link href="/admin/users">
                        <div className="p-3 rounded-full bg-blue-500/10 group-hover:scale-110 transition-transform duration-300">
                            <Users className="h-6 w-6 text-blue-500" />
                        </div>
                        <span className="font-medium">Felhasználók</span>
                    </Link>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex flex-col gap-3 border-border/50 bg-card/40 hover:bg-card/60 hover:border-primary/50 transition-all group" asChild>
                    <Link href="/admin/clubs">
                        <div className="p-3 rounded-full bg-purple-500/10 group-hover:scale-110 transition-transform duration-300">
                             <Building2 className="h-6 w-6 text-purple-500" />
                        </div>
                        <span className="font-medium">Klubok</span>
                    </Link>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex flex-col gap-3 border-border/50 bg-card/40 hover:bg-card/60 hover:border-primary/50 transition-all group" asChild>
                    <Link href="/admin/stats">
                        <div className="p-3 rounded-full bg-green-500/10 group-hover:scale-110 transition-transform duration-300">
                            <ChartBar className="h-6 w-6 text-green-500" />
                        </div>
                        <span className="font-medium">Statisztikák</span>
                    </Link>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex flex-col gap-3 border-border/50 bg-card/40 hover:bg-card/60 hover:border-primary/50 transition-all group" asChild>
                    <Link href="/admin/integrity">
                        <div className="p-3 rounded-full bg-destructive/10 group-hover:scale-110 transition-transform duration-300">
                            <ShieldAlert className="h-6 w-6 text-destructive" />
                        </div>
                        <span className="font-medium">Integritás</span>
                    </Link>
                </Button>
             </div>
        </div>

        <div className="space-y-6">
             {recentApps.length > 0 && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 animate-pulse">
                    <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-semibold">Figyelem!</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {recentApps.length} új klub jelentkezés vár jóváhagyásra.
                    </p>
                    <Button variant="link" className="mt-2 h-auto p-0 text-orange-500" asChild>
                        <Link href="/admin/clubs">Megtekintés &rarr;</Link>
                    </Button>
                </div>
             )}
            <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}
