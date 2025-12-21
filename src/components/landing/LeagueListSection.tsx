"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IconTrophy, IconUsers, IconCheck, IconArrowRight, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface League {
  _id: string;
  name: string;
  description?: string;
  verified: boolean;
  club?: {
    name: string;
  };
  startDate?: string;
  endDate?: string;
}

const LeagueListSection = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const itemsPerPage = 3;

  const fetchLeagues = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_TDARTS_API_URL || 'https://tdarts.sironic.hu'}/api/public/data?type=leagues`);
        if (response.ok) {
          const data = await response.json();
          setLeagues(data.leagues || []);
        }
      } catch (error) {
        console.error("Failed to fetch leagues", error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchLeagues();
  }, []);

  const totalPages = Math.ceil(leagues.length / itemsPerPage);
  const displayedLeagues = leagues.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const nextPage = () => setPage((p) => (p + 1) % totalPages);
  const prevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  return (
    <section id="leagues" className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration matching tDarts */}
      <div className="absolute inset-0 bg-primary/5 backdrop-blur-3xl -z-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="space-y-1">
             <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Aktív Ligák</h2>
             <p className="text-muted-foreground">Csatlakozz a legnépszerűbb versenyekhez</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevPage}
              disabled={loading || leagues.length === 0}
              className="rounded-full"
            >
              <IconChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextPage} 
              disabled={loading || leagues.length === 0}
              className="rounded-full"
            >
              <IconChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {loading ? (
           <div className="grid md:grid-cols-3 gap-6">
             {[1, 2, 3].map((i) => (
               <Card key={i} className="h-[400px] animate-pulse bg-muted" />
             ))}
           </div>
        ) : leagues.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {displayedLeagues.map((league) => (
              <Card key={league._id} className="group hover:border-primary/50 transition-colors duration-300 flex flex-col h-full bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                          <IconTrophy className="h-6 w-6" />
                        </div>
                        {league.verified && (
                            <Badge variant="secondary" className="gap-1 bg-success/10 text-success border-success/20">
                                <IconCheck className="h-3 w-3" />
                                Hitelesített
                            </Badge>
                        )}
                    </div>
                    <CardTitle className="text-xl pt-4 group-hover:text-primary transition-colors">{league.name}</CardTitle>
                    {league.club && (
                        <CardDescription className="flex items-center gap-2">
                          <IconUsers className="h-4 w-4" />
                          <span>{league.club.name}</span>
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent className="flex-grow">
                     {league.description && (
                       <p className="text-muted-foreground text-sm line-clamp-3">
                         {league.description}
                       </p>
                     )}
                </CardContent>
                <CardFooter className="pt-6 border-t border-border/50">
                  <Button variant="ghost" className="w-full gap-2 group-hover:text-primary" asChild>
                    <Link href={`https://tdarts.sironic.hu/leagues/${league._id}`} target="_blank">
                      Megtekintés
                      <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
            <IconTrophy className="h-10 w-10 mx-auto mb-4 opacity-50" />
            <p>Jelenleg nincsenek aktív ligák.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LeagueListSection;
