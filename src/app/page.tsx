"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Users, CheckCircle2, ChevronRight, ChevronLeft, Award, FileText } from "lucide-react";
import rulesData from "@/data/rules.json";

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

export default function Home() {
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

  // Handle hash scrolling on load and hash change
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    };
    
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [loading]);

  const totalPages = Math.ceil(leagues.length / itemsPerPage);
  const displayedLeagues = leagues.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const nextPage = () => setPage((p) => (p + 1) % totalPages);
  const prevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="hero" className="section hero-gradient relative overflow-hidden flex items-center min-h-[80vh]">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl bg-primary/30 animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl bg-primary/20 animate-float" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium">
              <Trophy className="h-4 w-4 text-primary" />
              <span>tDarts OAC</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                Versenyek
                <br />
                <span className="text-gradient-red text-glow">Jelentkezés</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
                Magyarország legnagyobb amatőr darts ligája.
                Csatlakozz, versenyezz és kerülj a ranglista élére!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link 
                href="/dashboard"
                className="glass-button inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                Jelentkezés Indítása
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* League List Section */}
      <section id="leagues" className="section relative overflow-hidden">
        {/* Backdrop Blur Background */}
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-3xl -z-10" />
        
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Aktív Ligák</h2>
            <div className="flex gap-2">
              <button 
                onClick={prevPage}
                disabled={loading || leagues.length === 0}
                className="p-3 rounded-full glass-card hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={nextPage} 
                disabled={loading || leagues.length === 0}
                className="p-3 rounded-full glass-card hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          {loading ? (
             <div className="grid md:grid-cols-3 gap-6">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="h-64 glass-card animate-pulse" />
               ))}
             </div>
          ) : leagues.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {displayedLeagues.map((league) => (
                <div key={league._id} className="glass-card p-8 group hover:scale-105 transition-transform duration-300 flex flex-col h-full bg-black/40">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Trophy className="h-8 w-8 text-primary" />
                    </div>
                    {league.verified && <CheckCircle2 className="h-6 w-6 text-success" />}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{league.name}</h3>
                  
                  {league.club && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{league.club.name}</span>
                    </div>
                  )}

                  <div className="flex-grow">
                     {league.description && (
                       <p className="text-muted-foreground line-clamp-3 mb-6">
                         {league.description}
                       </p>
                     )}
                  </div>

                  <div className="pt-6 border-t border-white/10 mt-auto">
                    <Link 
                      href={`https://tdarts.sironic.hu/leagues/${league._id}`}
                      target="_blank"
                      className="flex items-center justify-between text-sm font-semibold hover:text-primary transition-colors"
                    >
                      Megtekintés
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              Jelenleg nincsenek aktív ligák.
            </div>
          )}
        </div>
      </section>

      {/* Rules Section (From JSON) */}
      <section id="rules" className="section bg-primary/10 border-y border-primary/20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
               <div>
                  <h2 className="text-4xl font-bold mb-4">{rulesData.general.title}</h2>
                  <p className="text-xl text-muted-foreground">{rulesData.general.description}</p>
               </div>
               
               <div className="space-y-6">
                 {rulesData.general.items.map((item, idx) => (
                   <div key={idx} className="flex gap-4">
                     <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                       {idx + 1}
                     </div>
                     <div>
                       <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                       <p className="text-muted-foreground">{item.content}</p>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="p-6 rounded-2xl bg-background/50 border border-primary/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    {rulesData.points.title}
                  </h3>
                  <div className="space-y-3">
                    {rulesData.points.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <span className="text-muted-foreground">{item.title}</span>
                        <span className="font-medium text-right">{item.content}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="relative">
               <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
               <div className="relative glass-card p-8 md:p-10 border-primary/30">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    {rulesData.application.title}
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    {rulesData.application.description}
                  </p>
                  
                  <div className="space-y-6">
                    {rulesData.application.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        <p className="font-medium">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/10">
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      További információra van szükséged?
                    </p>
                    <Link href="/manual" className="glass-button w-full flex items-center justify-center gap-2">
                      Teljes Szabályzat Letöltése
                    </Link>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Section */}
      <section className="section bg-gradient-to-b from-primary/10 to-transparent">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center space-y-8 glass-card p-12 md:p-20 border-primary/30 shadow-[0_0_50px_-12px_rgba(var(--color-primary),0.3)]">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Készen állsz a <span className="text-gradient-red">Megmérettetésre?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ne maradj le a következő szezonról. Csatlakozz most a Magyar Nemzeti Amatőr Ligához és mutasd meg, mit tudsz!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link 
                href="/login"
                className="glass-button text-lg px-10 py-4 inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                Jelentkezés Indítása
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer is handled by layout, but added spacer if needed */}
      <div className="h-20" />
    </div>
  );
}
