"use client";

import Link from "next/link";
import { ArrowLeft, Trophy, Users, Award, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import rulesData from "@/data/rules.json";

export default function ManualPage() {
  const [openSections, setOpenSections] = useState<string[]>(['general', 'points']);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="section hero-gradient relative overflow-hidden py-16">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl bg-primary/30" />
        </div>
        
        <div className="container relative z-10">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Vissza a főoldalra
          </Link>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            <span className="text-gradient-red">OAC</span> Útmutató
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Szabályzat, pontrendszer és hasznos információk az OAC Magyar Nemzeti Amatőr Darts Liga működéséről.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section">
        <div className="container max-w-4xl">
          
          {/* General Rules */}
          <div className="glass-card overflow-hidden mb-6">
            <button 
              onClick={() => toggleSection('general')}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{rulesData.general.title}</h2>
                  <p className="text-muted-foreground">{rulesData.general.description}</p>
                </div>
              </div>
              {openSections.includes('general') ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
            </button>
            
            {openSections.includes('general') && (
              <div className="p-6 pt-0 space-y-6">
                {rulesData.general.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Points System */}
          <div className="glass-card overflow-hidden mb-6">
            <button 
              onClick={() => toggleSection('points')}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{rulesData.points.title}</h2>
                  <p className="text-muted-foreground">Hogyan gyűjthetsz pontokat a ligában</p>
                </div>
              </div>
              {openSections.includes('points') ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
            </button>
            
            {openSections.includes('points') && (
              <div className="p-6 pt-0">
                <div className="grid sm:grid-cols-2 gap-4">
                  {rulesData.points.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border">
                      <span className="font-medium">{item.position}</span>
                      <span className="text-2xl font-bold text-primary">{item.points} pont</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* How It Works */}
          <div className="glass-card overflow-hidden mb-6">
            <button 
              onClick={() => toggleSection('howto')}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Hogyan Működik?</h2>
                  <p className="text-muted-foreground">Lépésről lépésre</p>
                </div>
              </div>
              {openSections.includes('howto') ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
            </button>
            
            {openSections.includes('howto') && (
              <div className="p-6 pt-0 space-y-4">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center shrink-0 text-success font-bold">1</div>
                  <div>
                    <h3 className="font-bold mb-1">Klub Jelentkezés</h3>
                    <p className="text-muted-foreground">A klubod tulajdonosa jelentkezik az OAC programba a tDarts platformon keresztül.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center shrink-0 text-success font-bold">2</div>
                  <div>
                    <h3 className="font-bold mb-1">Jóváhagyás</h3>
                    <p className="text-muted-foreground">Az OAC adminisztrátorok jóváhagyják a jelentkezést, és létrejön a nemzeti liga.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center shrink-0 text-success font-bold">3</div>
                  <div>
                    <h3 className="font-bold mb-1">Versenyek</h3>
                    <p className="text-muted-foreground">A klub versenyeket szervez, amelyek automatikusan csatolódnak a ligához.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center shrink-0 text-success font-bold">4</div>
                  <div>
                    <h3 className="font-bold mb-1">Pontgyűjtés</h3>
                    <p className="text-muted-foreground">A versenyeken elért helyezések alapján pontokat gyűjtesz a ranglistán.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="glass-card overflow-hidden">
            <button 
              onClick={() => toggleSection('faq')}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Gyakran Ismételt Kérdések</h2>
                  <p className="text-muted-foreground">GYIK</p>
                </div>
              </div>
              {openSections.includes('faq') ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
            </button>
            
            {openSections.includes('faq') && (
              <div className="p-6 pt-0 space-y-6">
                <div>
                  <h3 className="font-bold mb-2">Ki vehet részt az OAC-ban?</h3>
                  <p className="text-muted-foreground">Bármely tDarts platformon regisztrált klub csatlakozhat, amennyiben az OAC adminisztrátorok jóváhagyják a jelentkezését.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Hogyan számítják a pontokat?</h3>
                  <p className="text-muted-foreground">A versenyeken elért helyezések alapján automatikusan. Minden verseny után a pontok azonnal frissülnek a ranglistán.</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Mi történik, ha kilépek egy klubból?</h3>
                  <p className="text-muted-foreground">A korábban szerzett pontjaid megmaradnak, de új pontokat csak aktív klubtagságod idején gyűjthetsz.</p>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </section>
    </div>
  );
}
