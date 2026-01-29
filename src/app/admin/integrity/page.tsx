"use client";
import { 
  ShieldAlert, 
  AlertTriangle,
  RefreshCw,
  Search,
  Eye,
  Gavel,
  User as UserIcon,
  Clock,
  ExternalLink,
  Target,
  Trophy
} from "lucide-react";
import { toast } from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/PageHeader";

export default function IntegrityPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Filtering & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [tournamentFilter, setTournamentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchIntegrityData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/stats'); // We reused the main stats endpoint which now includes integrity data
      if (res.ok) {
        const data = await res.json();
        setStats(data.integrityStats);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      toast.error("Nem sikerült betölteni az integritási adatokat");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIntegrityData();
  }, []);

  const openMatchDetails = (match: any) => {
    setSelectedMatch(match);
    setIsDialogOpen(true);
  };

  // Filter & Sort Logic
  const filteredMatches = stats?.suspiciousMatches?.filter((match: any) => {
    const matchesSearch = match.tournamentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          match.player1?.playerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          match.player2?.playerId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTournament = tournamentFilter === "all" || match.tournamentCode === tournamentFilter;
    
    return matchesSearch && matchesTournament;
  }).sort((a: any, b: any) => {
    if (sortBy === "newest") return new Date(b.overrideTimestamp).getTime() - new Date(a.overrideTimestamp).getTime();
    if (sortBy === "oldest") return new Date(a.overrideTimestamp).getTime() - new Date(b.overrideTimestamp).getTime();
    return 0;
  });

  const uniqueTournaments = Array.from(new Set(stats?.suspiciousMatches?.map((m: any) => ({
    name: m.tournamentName,
    code: m.tournamentCode
  })) || [])).filter((t: any, index, self) => 
    self.findIndex((other: any) => (other as any).code === (t as any).code) === index
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Integritás és Fair Play"
        description="Manuális beavatkozások és gyanús mérkőzések felügyelete a tDarts rendszerben."
        icon={ShieldAlert}
        badge={{ count: stats?.totalFlagged || 0, label: "megjelölt", variant: "destructive" }}
      >
        <Button variant="outline" size="icon" onClick={fetchIntegrityData} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Offenders Card */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Legtöbb Beavatkozás (Versenyek)
                </CardTitle>
                <CardDescription>
                    Versenyek, ahol a legtöbb manuális eredményfelülírás történt.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/40 hover:bg-transparent">
                            <TableHead>Verseny Neve</TableHead>
                            <TableHead className="text-right">Felülírások</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stats?.topOffendingTournaments?.length > 0 ? (
                            stats.topOffendingTournaments.map((t: any) => (
                                <TableRow key={t.tournamentId} className="border-border/40 hover:bg-muted/20">
                                    <TableCell className="font-medium">{t.tournamentName}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="destructive">{t.overrideCount}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                                    Nincs gyanús aktivitás.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* Global Overview (Placeholder for now, could be more charts) */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 flex flex-col justify-center items-center text-center p-6">
            <Gavel className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">Felügyeleti Központ</h3>
            <p className="text-muted-foreground max-w-sm">
                A rendszer figyeli a manuális eredmény módosításokat. A magas számú beavatkozás versenyeken vagy ligákban csalásra utalhat.
            </p>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                  placeholder="Keresés játékos vagy verseny alapján..." 
                  className="pl-10 bg-card/40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <Select value={tournamentFilter} onValueChange={setTournamentFilter}>
              <SelectTrigger className="w-full md:w-[240px] bg-card/40">
                  <SelectValue placeholder="Minden verseny" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">Minden verseny</SelectItem>
                  {uniqueTournaments.map((t: any) => (
                      <SelectItem key={(t as any).code} value={(t as any).code}>{(t as any).name}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px] bg-card/40">
                  <SelectValue placeholder="Rendezés" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="newest">Legfrissebb elől</SelectItem>
                  <SelectItem value="oldest">Legrégebbi elől</SelectItem>
              </SelectContent>
          </Select>
      </div>

      {/* Recent Suspicious Matches Table */}
      <Card className="bg-card/40 backdrop-blur-sm border-border/50">
        <CardHeader>
            <CardTitle>Legutóbbi Manuális Felülírások</CardTitle>
            <CardDescription>
                Részletes lista a legutóbbi manuális eredmény módosításokról.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                        <TableHead>Időpont</TableHead>
                        <TableHead>Verseny</TableHead>
                        <TableHead>Mérkőzés (Játékosok)</TableHead>
                        <TableHead>Módosította</TableHead>
                        <TableHead>Típus</TableHead>
                        <TableHead className="text-right">Művelet</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredMatches?.length > 0 ? (
                        filteredMatches.map((match: any) => (
                            <TableRow key={match._id} className="border-border/40 hover:bg-muted/20">
                                <TableCell className="text-muted-foreground text-xs">
                                    {match.overrideTimestamp ? new Date(match.overrideTimestamp).toLocaleString('hu-HU') : '-'}
                                </TableCell>
                                <TableCell className="font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                    {match.tournamentName || 'Ismeretlen'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-sm">
                                        <span className="font-semibold">{match.player1?.playerId?.name || '?'}</span>
                                        <span className="text-muted-foreground mx-1">vs</span>
                                        <span className="font-semibold">{match.player2?.playerId?.name || '?'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {match.manualChangedBy?.name || 'Ismeretlen'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                        {match.manualChangeType || 'Egyéb'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-8 w-8 hover:text-warning"
                                        onClick={() => openMatchDetails(match)}
                                        title="Részletek megtekintése"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                             <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                Nincs megjeleníthető adat.
                             </TableCell>
                        </TableRow>
                    )}
                </TableBody>
             </Table>
        </CardContent>
      </Card>

      {/* Match Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-md border-border/40 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Mérkőzés Felülírás Részletei
            </DialogTitle>
            <DialogDescription>
              {selectedMatch?.tournamentName} • {selectedMatch?.type === 'group' ? 'Csoportkör' : 'Kieséses szakasz'}
            </DialogDescription>
          </DialogHeader>

          {selectedMatch && (
            <div className="space-y-6">
              {/* Match Header Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted/20 rounded-lg border border-border/20">
                   <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Módosította</p>
                   <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-primary" />
                      <span className="font-medium">{selectedMatch.manualChangedBy?.name || 'Admin'}</span>
                   </div>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg border border-border/20">
                   <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Időpont</p>
                   <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">
                        {new Date(selectedMatch.overrideTimestamp).toLocaleString('hu-HU')}
                      </span>
                   </div>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg border border-border/20">
                   <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Típus</p>
                   <Badge variant="outline" className="mt-1">{selectedMatch.manualChangeType || 'Egyéb'}</Badge>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg border border-border/20">
                   <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Írója</p>
                   <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-medium">{selectedMatch.scorer?.name || 'Digitális'}</span>
                   </div>
                </div>
              </div>

              {/* History / Changes Section */}
              {selectedMatch.previousState && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-destructive mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Végezett Változások
                    </h4>
                    <div className="flex items-center justify-around">
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Eredeti Állapot</p>
                            <span className="text-2xl font-mono text-muted-foreground line-through">
                                {selectedMatch.previousState.player1LegsWon} - {selectedMatch.previousState.player2LegsWon}
                            </span>
                        </div>
                        <div className="h-8 w-[1px] bg-border" />
                        <div className="text-center">
                            <p className="text-xs text-primary mb-1">Új Állapot</p>
                            <span className="text-3xl font-mono font-black text-primary">
                                {selectedMatch.player1?.legsWon || 0} - {selectedMatch.player2?.legsWon || 0}
                            </span>
                        </div>
                    </div>
                </div>
              )}

              {/* Players Comparison */}
              <div className="flex items-center justify-between p-6 bg-muted/10 rounded-xl border border-border/40">
                 <div className="text-center flex-1">
                    <p className="text-xl font-bold truncate">{selectedMatch.player1?.playerId?.name || 'Játékos 1'}</p>
                    <p className="text-5xl font-black mt-2 text-primary">{selectedMatch.player1?.legsWon || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Átlag: {selectedMatch.player1?.average?.toFixed(2) || '0.00'}</p>
                 </div>
                 
                 <div className="px-10 flex flex-col items-center">
                    <Badge className="mb-2" variant={selectedMatch.status === 'finished' ? 'default' : 'secondary'}>
                        {selectedMatch.status === 'finished' ? 'VÉGEREDMÉNY' : 'FOLYAMATBAN'}
                    </Badge>
                    <div className="h-16 w-[1px] bg-border/40" />
                 </div>

                 <div className="text-center flex-1">
                    <p className="text-xl font-bold truncate">{selectedMatch.player2?.playerId?.name || 'Játékos 2'}</p>
                    <p className="text-5xl font-black mt-2 text-warning">{selectedMatch.player2?.legsWon || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Átlag: {selectedMatch.player2?.average?.toFixed(2) || '0.00'}</p>
                 </div>
              </div>

              {/* Winner Info */}
              {selectedMatch.winnerId && (
                <div className="flex items-center justify-center gap-2 p-4 bg-warning/10 rounded-lg border border-warning/20">
                   <Trophy className="h-6 w-6 text-warning" />
                   <span className="text-lg font-bold">Győztes:</span>
                   <span className="text-lg text-warning font-black uppercase">
                      {(selectedMatch.winnerId._id === (selectedMatch.player1?.playerId?._id || selectedMatch.player1?.playerId) || selectedMatch.winnerId === (selectedMatch.player1?.playerId?._id || selectedMatch.player1?.playerId))
                        ? selectedMatch.player1?.playerId?.name 
                        : selectedMatch.player2?.playerId?.name}
                   </span>
                </div>
              )}

              {/* Meta information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 px-2">
                 <div className="flex justify-between text-sm py-1 border-b border-border/20">
                    <span className="text-muted-foreground">Mérkőzés ID:</span>
                    <span className="font-mono text-xs select-all bg-muted/30 px-1 rounded truncate max-w-[200px]">{selectedMatch._id}</span>
                 </div>
                 <div className="flex justify-between text-sm py-1 border-b border-border/20">
                    <span className="text-muted-foreground">Forduló:</span>
                    <span className="font-bold">{selectedMatch.round}. kör</span>
                 </div>
                 <div className="flex justify-between text-sm py-1 border-b border-border/20">
                    <span className="text-muted-foreground">Tábla száma:</span>
                    <span className="font-bold">{selectedMatch.boardReference}. tábla</span>
                 </div>
                 <div className="flex justify-between text-sm py-1 border-b border-border/20">
                    <span className="text-muted-foreground">Tournament Kód:</span>
                    <span className="font-mono text-xs">{selectedMatch.tournamentCode}</span>
                 </div>
              </div>

              <Separator />

              <DialogFooter className="gap-2 sm:justify-between flex-row">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Bezárás</Button>
                <Button 
                    className="gap-2 bg-amber-600 text-white hover:bg-amber-700 font-bold"
                    onClick={() => {
                        if (selectedMatch.tournamentCode) {
                            window.open(`https://tdarts.hu/tournaments/${selectedMatch.tournamentCode}`, '_blank');
                        }
                    }}
                >
                    <ExternalLink className="h-4 w-4" />
                    Megtekintés tDartson
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
