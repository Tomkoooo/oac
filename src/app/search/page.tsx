"use client";

import { useState, useEffect } from "react";
import { Search, Building2, Trophy, Users, TrendingUp, Loader2, ExternalLink, CheckCircle2, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPublicData, getOacRankings, Club, League, Tournament, RankingPlayer } from "@/lib/tdarts-api";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"clubs" | "leagues" | "tournaments" | "rankings">("leagues");
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [rankings, setRankings] = useState<RankingPlayer[]>([]);
  const [rankingTotal, setRankingTotal] = useState(0);
  const [rankingPage, setRankingPage] = useState(0);
  const [rankingLoading, setRankingLoading] = useState(false);
  const RANKING_LIMIT = 20;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setRankingPage(0);
  }, [searchQuery]);

  useEffect(() => {
    if (activeTab === "rankings") {
        fetchRankings();
    }
  }, [activeTab, rankingPage, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPublicData('all');
      setLeagues(data.leagues || []);
      setTournaments(data.tournaments || []);
      setClubs(data.clubs || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async () => {
    setRankingLoading(true);
    try {
        const data = await getOacRankings({
            search: searchQuery,
            limit: RANKING_LIMIT,
            skip: rankingPage * RANKING_LIMIT
        });
        setRankings(data.rankings);
        setRankingTotal(data.total);
    } catch (error) {
        console.error("Error fetching rankings:", error);
    } finally {
        setRankingLoading(false);
    }
  };

  const matchesCity = (location?: string) => {
    if (!cityFilter) return true;
    return location?.toLowerCase().includes(cityFilter.toLowerCase());
  };

  const combinedSearch = (text: string) => {
      if (!searchQuery) return true;
      return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const filteredClubs = clubs.filter(club =>
    (combinedSearch(club.name)) &&
    matchesCity(club.location)
  );

  const filteredLeagues = leagues.filter(league =>
    league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (typeof league.club === 'object' && league.club?.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTournaments = tournaments.filter(tournament =>
    tournament.tournamentSettings.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (typeof tournament.clubId === 'object' && tournament.clubId?.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Felfedezés
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fedezd fel az ellenőrzött klubokat, ligákat, versenyeket és nézd meg a globális ranglistát
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Keresés név alapján..."
                className="pl-9 h-12 text-base"
              />
          </div>
          
          <div className="relative md:w-1/3">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Szűrés városra..."
                className="pl-9 h-12 text-base"
              />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "clubs", label: "Klubok", icon: Building2, count: filteredClubs.length },
            { id: "leagues", label: "Ligák", icon: Trophy, count: filteredLeagues.length },
            { id: "tournaments", label: "Versenyek", icon: Users, count: filteredTournaments.length },
            { id: "rankings", label: "Ranglisták", icon: TrendingUp, count: rankingTotal },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant={activeTab === tab.id ? "default" : "outline"}
              className="h-11 gap-2 rounded-xl"
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 h-5 min-w-[1.25rem] bg-background/20 text-current hover:bg-background/30">
                  {tab.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Adatok betöltése...</p>
            </div>
          ) : (
            <>
              {/* Clubs Tab */}
              {activeTab === "clubs" && (
                <div className="space-y-4">
                  {filteredClubs.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredClubs.map((club) => (
                        <Card key={club._id} className="group hover:border-primary/50 transition-colors">
                          <CardContent className="p-6">
                             <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Building2 className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-lg">{club.name}</h3>
                                    {club.location && (
                                      <p className="text-sm text-muted-foreground">{club.location}</p>
                                    )}
                                  </div>
                                </div>
                                {club.verified && (
                                  <CheckCircle2 className="h-5 w-5 text-success" />
                                )}
                              </div>
                              <Button variant="link" className="px-0 h-auto text-primary hover:text-primary/80" asChild>
                                  <a
                                    href={`https://tdarts.sironic.hu/clubs/${club._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="gap-2"
                                  >
                                    Megtekintés
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                              </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                     <EmptyState 
                        icon={Building2} 
                        message={searchQuery ? "Nincs találat" : "Még nincsenek ellenőrzött klubok"} 
                     />
                  )}
                </div>
              )}

              {/* Leagues Tab */}
              {activeTab === "leagues" && (
                <div className="space-y-4">
                  {filteredLeagues.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      {filteredLeagues.map((league) => (
                        <Card key={league._id} className="hover:border-primary/50 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                  <Trophy className="h-6 w-6" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{league.name}</h3>
                                  {league.club && typeof league.club === 'object' && (
                                    <p className="text-sm text-muted-foreground">{league.club.name}</p>
                                  )}
                                </div>
                              </div>
                              {league.verified && (
                                <CheckCircle2 className="h-5 w-5 text-success" />
                              )}
                            </div>
                            {league.description && (
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{league.description}</p>
                            )}
                            <div className="flex items-center justify-between mt-auto">
                                {(league.startDate || league.endDate) && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {league.startDate && new Date(league.startDate).toLocaleDateString('hu-HU')}
                                    </span>
                                    </div>
                                )}
                                <Button variant="ghost" size="sm" className="gap-2 ml-auto" asChild>
                                    <a
                                        href={`https://tdarts.sironic.hu/leagues/${league._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Megtekintés
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                        icon={Trophy} 
                        message={searchQuery ? "Nincs találat" : "Még nincsenek ellenőrzött ligák"} 
                    />
                  )}
                </div>
              )}

              {/* Tournaments Tab */}
              {activeTab === "tournaments" && (
                <div className="space-y-4">
                  {filteredTournaments.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredTournaments.map((tournament) => (
                        <Card key={tournament._id} className="hover:border-primary/50 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Users className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold line-clamp-1" title={tournament.tournamentSettings.name}>{tournament.tournamentSettings.name}</h3>
                                {tournament.clubId && typeof tournament.clubId === 'object' && (
                                  <p className="text-xs text-muted-foreground">{tournament.clubId.name}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-3 mb-4">
                                {tournament.league && typeof tournament.league === 'object' && (
                                    <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
                                        <Trophy className="h-4 w-4 text-primary shrink-0" />
                                        <span className="truncate">{tournament.league.name}</span>
                                    </div>
                                )}
                                
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">{tournament.tournamentSettings.location || (typeof tournament.clubId === 'object' && tournament.clubId?.location) || 'Ismeretlen helyszín'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                              <Badge variant={
                                ['active', 'group-stage', 'knockout'].includes(tournament.tournamentSettings.status) ? "outline" :
                                tournament.tournamentSettings.status === 'finished' ? "secondary" : "default"
                              } className={
                                ['active', 'group-stage', 'knockout'].includes(tournament.tournamentSettings.status) ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" :
                                tournament.tournamentSettings.status === 'finished' ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200" :
                                "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                              }>
                                {['active', 'group-stage', 'knockout'].includes(tournament.tournamentSettings.status) 
                                  ? "Élő" 
                                  : tournament.tournamentSettings.status === 'finished' 
                                  ? "Lezárt" 
                                  : "Közelgő"}
                              </Badge>
                              
                              <Button variant="outline" size="sm" asChild>
                                  <a href={`${process.env.NEXT_PUBLIC_TDARTS_API_URL || 'https://tdarts.sironic.hu'}/board/${tournament._id}`} target="_blank" rel="noopener noreferrer">
                                      Megnyitás
                                  </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                        icon={Users} 
                        message={searchQuery ? "Nincs találat" : "Még nincsenek versenyek"} 
                    />
                  )}
                </div>
              )}

              {/* Rankings Tab */}
              {activeTab === "rankings" && (
                <div className="space-y-6">
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border/50">
                          <tr>
                            <th className="px-6 py-4 text-sm font-semibold w-16">#</th>
                            <th className="px-6 py-4 text-sm font-semibold">Játékos</th>
                            <th className="px-6 py-4 text-sm font-semibold text-center">OAC MMR</th>
                            <th className="px-6 py-4 text-sm font-semibold text-center">Forduló Átlag</th>
                            <th className="px-6 py-4 text-sm font-semibold text-center">Max Átlag</th>
                            <th className="px-6 py-4 text-sm font-semibold text-center">Kiszálló</th>
                            <th className="px-6 py-4 text-sm font-semibold text-center">180</th>
                            <th className="px-6 py-4 text-sm font-semibold text-center">Fordulók</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {rankingLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                              <tr key={i} className="animate-pulse">
                                <td colSpan={8} className="px-6 py-4 text-center text-muted-foreground">Betöltés...</td>
                              </tr>
                            ))
                          ) : rankings.length > 0 ? (
                            rankings.map((player, index) => (
                              <tr key={player._id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 font-bold text-muted-foreground">
                                  {rankingPage * RANKING_LIMIT + index + 1}.
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                      {player.name.slice(0, 2)}
                                    </div>
                                    <span className="font-medium">{player.name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-primary">
                                  {player.oacMmr}
                                </td>
                                <td className="px-6 py-4 text-center font-mono">
                                  {player.avg.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-center text-muted-foreground">
                                  {player.maxAvg.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-center text-muted-foreground">
                                  {player.maxCheckout}
                                </td>
                                <td className="px-6 py-4 text-center text-muted-foreground">
                                  {player.total180s}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <Badge variant="secondary">{player.tournamentsPlayed}</Badge>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Nem található rangsorolt játékos</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {rankingTotal > RANKING_LIMIT && (
                    <div className="flex items-center justify-between px-2">
                        <p className="text-sm text-muted-foreground">
                            Összesen <span className="font-medium text-foreground">{rankingTotal}</span> játékos
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRankingPage(p => Math.max(0, p - 1))}
                                disabled={rankingPage === 0 || rankingLoading}
                            >
                                Előző
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRankingPage(p => p + 1)}
                                disabled={(rankingPage + 1) * RANKING_LIMIT >= rankingTotal || rankingLoading}
                            >
                                Következő
                            </Button>
                        </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
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
