"use client";

import { useState, useEffect } from "react";
import { Search, Building2, Trophy, Users, TrendingUp, Loader2, ExternalLink, CheckCircle2, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPublicData, getOacRankings, Club, League, Tournament, RankingPlayer } from "@/lib/tdarts-api";

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<"clubs" | "leagues" | "tournaments" | "rankings">("leagues");
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [rankings, setRankings] = useState<RankingPlayer[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPublicData('all');
      setLeagues(data.leagues || []);
      setTournaments(data.tournaments || []);
      setClubs(data.clubs || []);
      setRankings(data.rankings || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log(tournaments)

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Közösség</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ellenőrzött közösségi adatok és ranglisták
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: "leagues", label: "Ligák", icon: Trophy, count: leagues.length },
            { id: "tournaments", label: "Versenyek", icon: Users, count: tournaments.length },
            { id: "clubs", label: "Klubok", icon: Building2, count: clubs.length },
            { id: "rankings", label: "OAC Ranglista", icon: TrendingUp, count: rankings.length },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant={activeTab === tab.id ? "default" : "secondary"}
              className="h-10 gap-2 rounded-lg"
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              <Badge variant="secondary" className="ml-1 px-1.5 h-5 min-w-[1.25rem] bg-background/20 text-current">
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Adatok betöltése...</p>
          </div>
        ) : (
          <div className="min-h-[400px]">
             
              {/* Leagues Tab */}
              {activeTab === "leagues" && (
                <div className="grid gap-6 md:grid-cols-2">
                  {leagues.length > 0 ? leagues.map((league) => (
                    <Card key={league._id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                              <Trophy className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{league.name}</h3>
                              {league.club && typeof league.club === 'object' && (
                                <p className="text-sm text-muted-foreground">{league.club.name}</p>
                              )}
                            </div>
                          </div>
                          {league.verified && <CheckCircle2 className="h-5 w-5 text-success" />}
                        </div>
                        {league.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{league.description}</p>
                        )}
                        <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                            <a href={`https://tdarts.sironic.hu/leagues/${league._id}`} target="_blank" rel="noopener noreferrer">
                                Megtekintés <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                        </Button>
                      </CardContent>
                    </Card>
                  )) : <EmptyState icon={Trophy} message="Nincsenek ellenőrzött ligák" />}
                </div>
              )}

              {/* Tournaments Tab */}
              {activeTab === "tournaments" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {tournaments.length > 0 ? tournaments.map((tournament) => (
                    <Card key={tournament._id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold line-clamp-1">{tournament.tournamentSettings.name}</h3>
                            <div className="flex items-center text-xs text-muted-foreground gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(tournament.tournamentSettings.startDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Állapot:</span>
                                <Badge variant={['active', 'group-stage', 'knockout'].includes(tournament.tournamentSettings.status) ? 'default' : 'secondary'}>
                                    {tournament.tournamentSettings.status === 'finished' ? 'Lezárt' : 'Aktív'}
                                </Badge>
                            </div>
                             <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Játékosok:</span>
                                <span>{tournament.playerCount}</span>
                            </div>
                            {tournament.tournamentSettings.location && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground pt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{tournament.tournamentSettings.location}</span>
                                </div>
                            )}
                        </div>

                        <Button variant="outline" size="sm" className="w-full" asChild>
                            <a href={`https://tdarts.hu/tournaments/${tournament._id}`} target="_blank" rel="noopener noreferrer">
                                Verseny megnyitása
                            </a>
                        </Button>
                      </CardContent>
                    </Card>
                  )) : <EmptyState icon={Users} message="Nincsenek versenyek" />}
                </div>
              )}

              {/* Clubs Tab */}
              {activeTab === "clubs" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {clubs.length > 0 ? clubs.map((club) => (
                    <Card key={club._id} className="group hover:border-primary/50 transition-colors">
                      <CardContent className="p-6">
                         <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
                                <Building2 className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{club.name}</h3>
                                {club.location && (
                                  <p className="text-sm text-muted-foreground">{club.location}</p>
                                )}
                              </div>
                            </div>
                            {club.verified && <CheckCircle2 className="h-5 w-5 text-success" />}
                          </div>
                          <Button variant="link" className="px-0 h-auto text-primary" asChild>
                              <a href={`https://tdarts.sironic.hu/clubs/${club._id}`} target="_blank" className="gap-2">
                                Adatlap <ExternalLink className="h-4 w-4" />
                              </a>
                          </Button>
                      </CardContent>
                    </Card>
                  )) : <EmptyState icon={Building2} message="Nincsenek ellenőrzött klubok" />}
                </div>
              )}

              {/* Rankings Tab */}
              {activeTab === "rankings" && (
                <div className="space-y-6">
                  <div className="glass-card overflow-hidden rounded-xl border border-border/50">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-muted/30 border-b border-border/50">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-16">#</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Játékos</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">OAC MMR</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Átlag</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Max Checkout</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">180s</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Tornák</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {rankings.length > 0 ? rankings.map((player, index) => (
                            <tr key={player._id} className="hover:bg-muted/20 transition-colors">
                              <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                                {index + 1}.
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                    {player.name.slice(0, 2)}
                                  </div>
                                  <span className="font-medium">{player.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Badge variant="outline" className="font-mono bg-primary/5 border-primary/20 text-primary">
                                    {player.oacMmr}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-center font-mono text-sm">
                                {player.avg?.toFixed(2) || '0.00'}
                              </td>
                              <td className="px-6 py-4 text-center text-muted-foreground text-sm">
                                {player.maxCheckout}
                              </td>
                              <td className="px-6 py-4 text-center text-muted-foreground text-sm">
                                {player.total180s}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                                    {player.tournamentsPlayed}
                                </span>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={7} className="px-6 py-12 text-center">
                                <EmptyState icon={TrendingUp} message="Nincs rangsorolt játékos (MMR != 800)" />
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any, message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/10 rounded-2xl border border-dashed">
            <div className="p-4 bg-background rounded-full mb-4">
                <Icon className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">{message}</p>
        </div>
    )
}
