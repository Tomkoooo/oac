import Link from "next/link";
import { Trophy, ArrowRight, CheckCircle2, Calendar, Users, Award, Shield, Building2, Target, Zap, BarChart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl bg-primary/30 animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl bg-primary/20 animate-float" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium">
              <Zap className="h-4 w-4 text-primary" />
              <span>Powered by tDarts Platform</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Magyar Nemzeti
                <br />
                <span className="text-gradient-red text-glow">Amatőr Liga</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                Csatlakozz Magyarország vezető amatőr darts ligájához. Versenyezz a legjobb klubokkal, 
                irányítsd csapatodat és küzdj a nemzeti ranglistáért.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link 
                href="/#apply"
                className="glass-button inline-flex items-center justify-center gap-2 text-base"
              >
                Jelentkezés Most
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a 
                href="#about" 
                className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 border-2 border-primary/50 hover:border-primary hover:bg-primary/10 inline-flex items-center justify-center"
              >
                Tudj Meg Többet
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Building2, label: "Aktív Klubok", value: "50+" },
              { icon: Users, label: "Regisztrált Játékosok", value: "2000+" },
              { icon: Trophy, label: "Heti Versenyek", value: "100+" },
              { icon: Target, label: "Összesített Meccsek", value: "10k+" },
            ].map((stat, i) => (
              <div key={i} className="glass-card text-center p-6 hover:scale-105 transition-transform">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold text-gradient-red mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container">
          <div className="mx-auto max-w-4xl space-y-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium mb-4">
                <Trophy className="h-4 w-4 text-primary" />
                <span>Miért Az OAC Liga?</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                A Legjobb Platform a <span className="text-gradient-red">Versenyzéshez</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A tDarts platformmal integrált OAC liga a legmodernebb eszközöket kínálja a darts klubok és játékosok számára.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Zap,
                  title: "Élő Eredmények",
                  description: "Valós idejű eredménykövetés és statisztikák minden mérkőzésről"
                },
                {
                  icon: BarChart,
                  title: "Ranglisták",
                  description: "Automatikus ranglistafrissítés és teljesítményértékelés"
                },
                {
                  icon: Shield,
                  title: "Fair Play",
                  description: "Átlátható szabályrendszer és ellenőrzött versenyek"
                }
              ].map((feature, i) => (
                <div key={i} className="depth-card feature-card text-center group">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Apply Section */}
      <section id="apply" className="section section-alt">
        <div className="container">
          <div className="glass-card mx-auto max-w-4xl p-8 md:p-12 text-center space-y-6 animate-pulse-glow">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 border-2 border-primary/50">
              <Award className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Jelentkezz a Nemzeti Ligába
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Készen állsz arra, hogy klubod a következő szintre emeléd? Jelentkezz most a Magyar Nemzeti 
                Amatőr Ligába és versenyezz az ország legjobb csapataival.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link 
                href="/login"
                className="glass-button inline-flex items-center justify-center gap-2 text-base"
              >
                Jelentkezés Indítása
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a 
                href="https://tdarts.sironic.hu" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 border-2 border-primary/50 hover:border-primary hover:bg-primary/10 inline-flex items-center justify-center gap-2"
              >
                <Trophy className="h-5 w-5" />
                tDarts Platform
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section id="rules" className="section">
        <div className="container">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Liga Szabályok & Követelmények
              </h2>
              <p className="text-lg text-muted-foreground">
                Minden amit tudnod kell a Nemzeti Ligában való részvételről
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[ 
                {
                  icon: CheckCircle2,
                  title: "Ellenőrzött Klub",
                  description: "A klubodnak ellenőrzöttnek kell lennie a tDarts platformon a nemzeti versenyeken való részvételhez."
                },
                {
                  icon: Calendar,
                  title: "Heti Versenyek",
                  description: "Heti egy nemzeti liga versenyt rendezz a helyszíneden (hétfő-vasárnap)."
                },
                {
                  icon: Users,
                  title: "Minimális Létszám",
                  description: "16 játékosnál kevesebb résztvevővel rendezett verseny 0 pontot ér a ligában."
                },
                {
                  icon: Award,
                  title: "Pontrendszer",
                  description: "Szerezz pontokat a verseny teljesítményed alapján és járulj hozzá klubod nemzeti ranglistához."
                },
                {
                  icon: Shield,
                  title: "Csak Klub Adminok",
                  description: "Csak klub adminisztrátorok módosíthatják a liga beosztásokat és verseny kezdési időpontokat."
                },
                {
                  icon: Trophy,
                  title: "Fair Play",
                  description: "Minden versenynek követnie kell a hivatalos darts szabályokat és fair play sztenderdeket."
                }
              ].map((item, i) => (
                <div key={i} className="glass-card p-6 hover:scale-105 transition-transform feature-card">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
