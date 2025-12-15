"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Calendar, Trophy } from "lucide-react";
import { getPublicData, League, Tournament } from "@/lib/tdarts-api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SearchSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<{ leagues: League[]; tournaments: Tournament[] }>({ leagues: [], tournaments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getPublicData();
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredLeagues = data.leagues.filter((l) => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTournaments = data.tournaments.filter((t) => t.tournamentSettings.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Find Leagues & Tournaments</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Search for upcoming tournaments and active leagues across the country.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            <div className="flex space-x-2">
              <Input
                className="max-w-lg flex-1 bg-background"
                placeholder="Search..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl items-start gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          {/* Leagues Column */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" /> Active Leagues
            </h3>
            {loading ? (
              <p>Loading leagues...</p>
            ) : filteredLeagues.length > 0 ? (
              filteredLeagues.map((league) => (
                <Card key={league._id}>
                  <CardHeader>
                    <CardTitle>{league.name}</CardTitle>
                    <CardDescription>National League</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-1 h-4 w-4" />
                      <span>View details for team info</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" size="sm" className="w-full">View Details</Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No leagues found.</p>
            )}
          </div>

          {/* Tournaments Column */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" /> Upcoming Tournaments
            </h3>
            {loading ? (
              <p>Loading tournaments...</p>
            ) : filteredTournaments.length > 0 ? (
              filteredTournaments.map((tournament) => (
                <Card key={tournament._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{tournament.tournamentSettings.name}</CardTitle>
                        <Badge variant="outline">Upcoming</Badge>
                    </div>
                    <CardDescription>{new Date(tournament.tournamentSettings.startDate).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="secondary" size="sm" className="w-full">Register</Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No tournaments found.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
