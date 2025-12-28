"use client";

import Link from "next/link";
import { ArrowLeft, Trophy, Users, Award, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RulesContentProps {
  rules: any;
}

export default function ManualContent({ rules: rulesData }: RulesContentProps) {
  const [openSections, setOpenSections] = useState<string[]>(['important', 'general', 'points', 'competition', 'league']);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  if (!rulesData) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <p>Szabályok betöltése sikertelen.</p>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative overflow-hidden py-16 border-b border-border/50 bg-muted/20">
         <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Button variant="ghost" className="mb-8 pl-0 hover:pl-2 transition-all gap-2 text-muted-foreground" asChild>
             <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Vissza a főoldalra
             </Link>
          </Button>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            <span className="text-primary">OAC</span> Útmutató
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Szabályzat, pontrendszer és hasznos információk az OAC Magyar Nemzeti Amatőr Darts Liga működéséről.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          
          {/* Important Info */}
          <Card className="border-l-4 border-l-warning shadow-md">
            <div 
              onClick={() => toggleSection('important')}
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-xl text-warning">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{rulesData.important?.title || "Fontos Tudnivalók"}</h2>
                  <p className="text-muted-foreground text-sm">{rulesData.important?.description || ""}</p>
                </div>
              </div>
              {openSections.includes('important') ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
            
            {openSections.includes('important') && rulesData.important?.items && (
              <CardContent className="pt-0 space-y-4">
                {rulesData.important.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3 pl-16">
                    <div className="h-2 w-2 rounded-full bg-warning mt-2 shrink-0" />
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.content}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Competition Rules */}
          <Card>
            <div 
              onClick={() => toggleSection('competition')}
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{rulesData.competition?.title || "Verseny Szabályzat"}</h2>
                  <p className="text-muted-foreground text-sm">{rulesData.competition?.description || ""}</p>
                </div>
              </div>
              {openSections.includes('competition') ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
            
            {openSections.includes('competition') && rulesData.competition?.items && (
              <CardContent className="pt-0 space-y-6">
                {rulesData.competition.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-primary/20 text-primary bg-primary/5">
                        {idx + 1}
                    </Badge>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.content}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* League Rules */}
          <Card>
            <div 
              onClick={() => toggleSection('league')}
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{rulesData.league?.title || "Liga Szabályzat"}</h2>
                  <p className="text-muted-foreground text-sm">{rulesData.league?.description || ""}</p>
                </div>
              </div>
              {openSections.includes('league') ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
            
            {openSections.includes('league') && rulesData.league?.items && (
              <CardContent className="pt-0 space-y-6">
                {rulesData.league.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                     <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-primary/20 text-primary bg-primary/5">
                        {idx + 1}
                    </Badge>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.content}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
          
          {/* General Rules */}
          <Card>
            <div 
              onClick={() => toggleSection('general')}
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{rulesData.general?.title || "Általános Szabályok"}</h2>
                  <p className="text-muted-foreground text-sm">{rulesData.general?.description || ""}</p>
                </div>
              </div>
              {openSections.includes('general') ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
            
            {openSections.includes('general') && rulesData.general?.items && (
              <CardContent className="pt-0 space-y-6">
                {rulesData.general.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                     <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-primary/20 text-primary bg-primary/5">
                        {idx + 1}
                    </Badge>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.content}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Points System */}
          <Card>
            <div 
              onClick={() => toggleSection('points')}
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{rulesData.points?.title || "Pontrendszer"}</h2>
                  <p className="text-muted-foreground text-sm">Hogyan gyűjthetsz pontokat a ligában</p>
                </div>
              </div>
              {openSections.includes('points') ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
            
            {openSections.includes('points') && rulesData.points?.items && (
              <CardContent className="pt-0 space-y-4">
                {rulesData.points.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                     <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-primary/20 text-primary bg-primary/5">
                        {idx + 1}
                    </Badge>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.content}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Application Guide */}
          <Card>
            <div 
              onClick={() => toggleSection('application')}
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{rulesData.application?.title || "Jelentkezés Menete"}</h2>
                  <p className="text-muted-foreground text-sm">{rulesData.application?.description || ""}</p>
                </div>
              </div>
              {openSections.includes('application') ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
            
            {openSections.includes('application') && rulesData.application?.items && (
              <CardContent className="pt-0 space-y-4">
                {rulesData.application.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-success/20 text-success bg-success/5">
                        {idx + 1}
                    </Badge>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.content}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* FAQ */}
          <Card>
            <div 
              onClick={() => toggleSection('faq')}
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Gyakran Ismételt Kérdések</h2>
                  <p className="text-muted-foreground text-sm">GYIK</p>
                </div>
              </div>
              {openSections.includes('faq') ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
            
            {openSections.includes('faq') && (
              <CardContent className="pt-0 space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Ki vehet részt az OAC-ban?</h3>
                  <p className="text-muted-foreground text-sm">Bármely tDarts platformon regisztrált klub csatlakozhat, amennyiben az OAC adminisztrátorok jóváhagyják a jelentkezését.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Hogyan számítják a pontokat?</h3>
                  <p className="text-muted-foreground text-sm">A versenyeken elért helyezések alapján automatikusan. Minden verseny után a pontok azonnal frissülnek a ranglistán.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Mi történik, ha kilépek egy klubból?</h3>
                  <p className="text-muted-foreground text-sm">A korábban szerzett pontjaid megmaradnak, de új pontokat csak aktív klubtagságod idején gyűjthetsz.</p>
                </div>
              </CardContent>
            )}
          </Card>
          
        </div>
      </section>
    </div>
  );
}
