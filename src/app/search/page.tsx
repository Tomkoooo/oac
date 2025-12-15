"use client";

import { useState, useEffect } from "react";
import { Search, Building2, Trophy, Users, TrendingUp, Loader2, ExternalLink, CheckCircle2, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicData, Club, League, Tournament } from "@/lib/tdarts-api";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"clubs" | "leagues" | "tournaments" | "rankings">("leagues");
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

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
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <h1 className="text-4xl font-bold">
            <span className="text-gradient-red">Felfedezés</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fedezd fel az ellenőrzött klubokat, ligákat, versenyeket és nézd meg a globális ranglistát
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card p-6 flex-1">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Keresés név alapján..."
                className="w-full h-14 pl-12 pr-4 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
              />
            </div>
          </div>
          
          <div className="glass-card p-6 md:w-1/3">
             <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Szűrés városra..."
                className="w-full h-14 pl-12 pr-4 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {[
            { id: "clubs", label: "Klubok", icon: Building2, count: filteredClubs.length },
            { id: "leagues", label: "Ligák", icon: Trophy, count: filteredLeagues.length },
            { id: "tournaments", label: "Versenyek", icon: Users, count: filteredTournaments.length },
            { id: "rankings", label: "Ranglisták", icon: TrendingUp, count: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "border-2 border-border hover:border-primary hover:bg-primary/10"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-background/50 text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {loading ? (
            <div className="glass-card p-12 text-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
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
                        <div key={club._id} className="depth-card group">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <Building2 className="h-6 w-6 text-primary" />
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
                          <a
                            href={`https://tdarts.sironic.hu/clubs/${club._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors"
                          >
                            Megtekintés
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-card p-12 text-center">
                      <Building2 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "Nincs találat" : "Még nincsenek ellenőrzött klubok"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Leagues Tab */}
              {activeTab === "leagues" && (
                <div className="space-y-4">
                  {filteredLeagues.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      {filteredLeagues.map((league) => (
                        <div key={league._id} className="depth-card">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <Trophy className="h-6 w-6 text-primary" />
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
                            <p className="text-sm text-muted-foreground mb-4">{league.description}</p>
                          )}
                          {(league.startDate || league.endDate) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {league.startDate && new Date(league.startDate).toLocaleDateString('hu-HU')}
                                {league.startDate && league.endDate && " - "}
                                {league.endDate && new Date(league.endDate).toLocaleDateString('hu-HU')}
                              </span>
                            </div>
                          )}
                          <a
                            href={`https://tdarts.sironic.hu/leagues/${league._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors"
                          >
                            Megtekintés
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-card p-12 text-center">
                      <Trophy className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "Nincs találat" : "Még nincsenek ellenőrzött ligák"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tournaments Tab */}
              {activeTab === "tournaments" && (
                <div className="space-y-4">
                  {filteredTournaments.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredTournaments.map((tournament) => (
                        <div key={tournament._id} className="depth-card">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{tournament.tournamentSettings.name}</h3>
                              {tournament.clubId && typeof tournament.clubId === 'object' && (
                                <p className="text-xs text-muted-foreground">{tournament.clubId.name}</p>
                              )}
                            </div>
                          </div>
                          {tournament.league && typeof tournament.league === 'object' && (
                            <div className="flex flex-col gap-1 mb-3">
                              <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-primary" />
                                <span className="text-sm text-muted-foreground">{tournament.league.name}</span>
                                {tournament.league.verified && (
                                  <CheckCircle2 className="h-4 w-4 text-success" />
                                )}
                              </div>
                              {tournament.league.club && typeof tournament.league.club === 'object' && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-6">
                                  <Building2 className="h-3 w-3" />
                                  <span>{tournament.league.club.name}</span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="mr-1 h-4 w-4" />
                            <span>{tournament.tournamentSettings.location || (typeof tournament.clubId === 'object' && tournament.clubId?.location) || 'Unknown Location'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              ['active', 'group-stage', 'knockout'].includes(tournament.tournamentSettings.status)
                                ? "bg-green-100 text-green-700"
                                : tournament.tournamentSettings.status === 'finished'
                                ? "bg-gray-100 text-gray-700"
                                : "bg-blue-100 text-blue-700"
                            }`}>
                              {['active', 'group-stage', 'knockout'].includes(tournament.tournamentSettings.status) 
                                ? "Active" 
                                : tournament.tournamentSettings.status === 'finished' 
                                ? "Finished" 
                                : "Upcoming"}
                            </span>
                            
                            <Button variant="outline" size="sm" asChild>
                                <a href={`${process.env.NEXT_PUBLIC_TDARTS_API_URL || 'https://tdarts.sironic.hu'}/board/${tournament._id}`} target="_blank" rel="noopener noreferrer">
                                    View Details
                                </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-card p-12 text-center">
                      <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "Nincs találat" : "Még nincsenek versenyek"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Rankings Tab */}
              {activeTab === "rankings" && (
                <div className="glass-card p-12 text-center">
                  <TrendingUp className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Ranglisták hamarosan</h3>
                  <p className="text-muted-foreground mb-6">
                    A globális ranglisták funkció jelenleg fejlesztés alatt áll.
                  </p>
                  <a
                    href="https://tdarts.sironic.hu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 glass-button"
                  >
                    tDarts Platform
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

