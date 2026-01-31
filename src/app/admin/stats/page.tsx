"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3 as ChartBar, 
  Download, 
  Trophy, 
  Users, 
  Building2, 
  Loader2,
  Calendar,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (error) {
      toast.error("Nem sikerült betölteni a statisztikákat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const exportData = () => {
    if (!stats || !stats.playerStats) return;
    const dataStr = JSON.stringify(stats.playerStats, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `oac_player_stats_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPlayers = async () => {
    try {
      const res = await fetch('/api/admin/players/export');
      if (!res.ok) throw new Error('Export failed');
      
      const data = await res.json();
      const dataStr = JSON.stringify(data.players, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `oac_players_full_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${data.totalCount} játékos exportálva`);
    } catch (error) {
      toast.error("Export sikertelen");
    }
  };

  if (loading) {
     return (
       <div className="flex items-center justify-center min-h-[400px]">
         <Loader2 className="h-8 w-8 animate-spin text-warning" />
       </div>
     );
  }

  return (
    <div className="space-y-6 m-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statisztikák</h1>
          <p className="text-muted-foreground">Részletes adatok és jelentések az OAC Ligáról</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportData} className="gap-2 border-border/40 hover:bg-muted/20" variant="outline">
            <Download className="h-4 w-4" />
            Export Stats (JSON)
          </Button>
          <Button onClick={exportPlayers} className="gap-2 bg-warning text-warning-foreground hover:bg-warning/90">
            <Download className="h-4 w-4" />
            Export All Players
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Verseny Összesítő</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold">{stats?.globalStats?.totalTournaments || 0}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Összes Verseny</p>
              </div>
              <Trophy className="h-10 w-10 text-warning/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Klub Aktivitás</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold">{stats?.globalStats?.verifiedClubCount || 0}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Aktív OAC Klub</p>
              </div>
              <Building2 className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Játékos Bázis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold">{stats?.globalStats?.totalPlayers || 0}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Nyilvántartott Játékos</p>
              </div>
              <Users className="h-10 w-10 text-purple-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/40">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-warning" />
            Országos Ranglista (OAC MMR)
          </CardTitle>
          <CardDescription>A teljes OAC játékos rangsor MMR alapján</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-[100px]">Helyezés</TableHead>
                <TableHead>Játékos</TableHead>
                <TableHead className="text-center">MMR</TableHead>
                <TableHead className="text-center">Tornák</TableHead>
                <TableHead className="text-center">Átlag</TableHead>
                <TableHead className="text-center">Max Átlag</TableHead>
                <TableHead className="text-center">Kiszálló</TableHead>
                <TableHead className="text-center">180</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.playerStats?.map((player: any, index: number) => (
                <TableRow key={index} className="border-border/40 hover:bg-muted/30">
                  <TableCell className="font-bold">
                     <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                       index < 3 ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground"
                     }`}>
                       {index + 1}
                     </span>
                  </TableCell>
                  <TableCell className="font-semibold">{player.name}</TableCell>
                  <TableCell className="text-center font-bold text-primary">{player.oacMmr || 800}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{player.tournamentsPlayed}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono">{player.average.toFixed(2)}</TableCell>
                  <TableCell className="text-center font-mono text-muted-foreground">{player.maxAverage.toFixed(2)}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{player.highestCheckout || 0}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{player.oneEighties || 0}</TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground text-sm">Nincs adat</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
