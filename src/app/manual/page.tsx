"use client";

import Link from "next/link";
import { ArrowLeft, Trophy, Users, Award, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import rulesData from "@/data/rules.json";

export default function ManualPage() {
  const [openSections, setOpenSections] = useState<string[]>(['important', 'general', 'points', 'competition', 'league']);

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
          
          {/* Important Info */}
          <div className="glass-card overflow-hidden mb-6 border-l-4 border-l-warning">
            <button 
              onClick={() => toggleSection('important')}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-warning/20 rounded-xl">
                  <FileText className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{rulesData.important.title}</h2>
                  <p className="text-muted-foreground">{rulesData.important.description}</p>
                </div>
              </div>
              {openSections.includes('important') ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
            </button>
            
            {openSections.includes('important') && (
              <div className="p-6 pt-0 space-y-6">
                {rulesData.important.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="h-2 w-2 rounded-full bg-warning mt-2 shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Competition Rules */}
          <div className="glass-card overflow-hidden mb-6">
            <button 
              onClick={() => toggleSection('competition')}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{rulesData.competition.title}</h2>
                  <p className="text-muted-foreground">{rulesData.competition.description}</p>
                </div>
              </div>
              {openSections.includes('competition') ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
            </button>
            
            {openSections.includes('competition') && (
              <div className="p-6 pt-0 space-y-6">
                {rulesData.competition.items.map((item, idx) => (
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

          {/* League Rules */}
          <div className="glass-card overflow-hidden mb-6">
            <button 
              onClick={() => toggleSection('league')}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{rulesData.league.title}</h2>
                  <p className="text-muted-foreground">{rulesData.league.description}</p>
                </div>
              </div>
              {openSections.includes('league') ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
            </button>
            
            {openSections.includes('league') && (
              <div className="p-6 pt-0 space-y-6">
                {rulesData.league.items.map((item, idx) => (
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
              <div className="p-6 pt-0 space-y-4">
                {rulesData.points.items.map((item, idx) => (
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

          {/* Application Guide */}
          <div className="glass-card overflow-hidden mb-6">
            <button 
              onClick={() => toggleSection('application')}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{rulesData.application.title}</h2>
                  <p className="text-muted-foreground">{rulesData.application.description}</p>
                </div>
              </div>
              {openSections.includes('application') ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
            </button>
            
            {openSections.includes('application') && (
              <div className="p-6 pt-0 space-y-4">
                {rulesData.application.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center shrink-0 text-success font-bold">{idx + 1}</div>
                    <div>
                      <h3 className="font-bold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.content}</p>
                    </div>
                  </div>
                ))}
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
