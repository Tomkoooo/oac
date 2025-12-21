import React from 'react';
import { IconTarget, IconPlayerPlay, IconTrophy, IconSparkles, IconArrowRight, IconCheck, IconUsers } from '@tabler/icons-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';

const HeroSection = () => {
  const stats = [
    { number: '50+', label: 'Aktív Klub', sublabel: 'országszerte' },
    { number: '1000+', label: 'Játékos', sublabel: 'regisztrálva' },
    { number: 'Hivatalos', label: 'Ranglista', sublabel: 'rendszer' }
  ];

  const features = [
    'Hivatalos versenyek',
    'Országos ranglista',
    'Hitelesített eredmények',
    'Közösségi élmény'
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20">
      {/* Subtle Background Highlights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge 
              variant="outline" 
              className="px-4 py-2 gap-2 text-sm font-medium border-primary/20 bg-background/50 backdrop-blur-sm"
            >
              <IconSparkles className="w-4 h-4 text-primary" />
              Magyar Nemzeti Amatőr Darts Liga
            </Badge>
          </div>

          {/* Main Heading */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 hover:scale-[1.01] transition-transform duration-500" style={{ animationDelay: '100ms' }}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground">
              Országos Amatőr Cashout
            </h1>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <IconTarget className="w-8 h-8 text-primary" />
              <Separator orientation="vertical" className="h-8 bg-border" />
              <span className="text-2xl sm:text-3xl font-semibold text-muted-foreground">
                Liga
              </span>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
            Csatlakozz Magyarország legnagyobb <span className="text-foreground font-semibold">amatőr darts ligájához</span>. 
            Versenyezz hitelesített körülmények között, gyűjts pontokat és kerülj a ranglista élére!
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '300ms' }}>
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-border"
              >
                <IconCheck className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '400ms' }}>
            <Button size="lg" className="gap-2 group min-w-[160px]" asChild>
              <Link href="/login">
                <IconPlayerPlay className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Jelentkezés
                <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" className="gap-2 group min-w-[160px]" asChild>
              <Link href="/search">
                <IconTrophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Versenyek Böngészése
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '500ms' }}>
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="group hover:bg-muted/50 transition-colors duration-300 border-border bg-card"
              >
                <CardContent className="p-6 text-center space-y-2">
                  <div className="text-4xl sm:text-5xl font-bold text-primary">
                    {stat.number}
                  </div>
                  <div className="space-y-1">
                    <div className="text-base font-semibold text-foreground">
                      {stat.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.sublabel}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
