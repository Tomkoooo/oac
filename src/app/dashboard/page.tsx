"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Clock, AlertCircle, Trophy, Loader2, ArrowLeft, ExternalLink, Plus, Users, LayoutDashboard } from "lucide-react";
import CreateClubModal from "@/components/CreateClubModal";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Club {
  _id: string;
  name: string;
  role: string;
  verified?: boolean;
}

interface Application {
  _id: string;
  clubId: string;
  clubName: string;
  status: 'submitted' | 'approved' | 'rejected' | 'removal_requested';
  submittedAt: string;
  notes?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingFor, setApplyingFor] = useState<string | null>(null);
  const [showCreateClub, setShowCreateClub] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's clubs from tDarts
        const clubsResponse = await fetch("/api/user/clubs");
        if (!clubsResponse.ok) {
          if (clubsResponse.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Klubok lekérése sikertelen");
        }
        const clubsData = await clubsResponse.json();
        setClubs(clubsData.clubs || []);

        // Fetch user's applications
        const appsResponse = await fetch("/api/applications");
        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          setApplications(appsData.applications || []);
        }
      } catch (err: any) {
        setError(err.message || "Hiba történt az adatok betöltése során");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleApply = async (clubId: string, clubName: string) => {
    setApplyingFor(clubId);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, clubName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Jelentkezés sikertelen");
      }

      // Refresh applications
      const appsResponse = await fetch("/api/applications");
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApplications(appsData.applications || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Hiba történt a jelentkezés során");
    } finally {
      setApplyingFor(null);
    }
  };

  const handleRequestRemoval = async (applicationId: string) => {
    const reason = prompt('Add meg az eltávolítás okát (opcionális):');
    
    setApplyingFor(applicationId);
    try {
      const response = await fetch('/api/applications/request-removal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, reason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Eltávolítási kérelem sikertelen');
      }

      toast.success('Eltávolítási kérelem sikeresen beküldve!');
      
      // Refresh applications
      const appsResponse = await fetch('/api/applications');
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApplications(appsData.applications || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Hiba történt');
    } finally {
      setApplyingFor(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default", // will override color below
      rejected: "destructive",
      pending: "outline",
      submitted: "outline",
      removal_requested: "secondary",
    };
    
    const labels = {
      approved: "Elfogadva",
      rejected: "Elutasítva",
      pending: "Függőben",
      submitted: "Függőben",
      removal_requested: "Eltávolítás kérve"
    };

    const icons = {
        approved: <CheckCircle2 className="h-3 w-3 mr-1" />,
        rejected: <AlertCircle className="h-3 w-3 mr-1" />,
        pending: <Clock className="h-3 w-3 mr-1" />,
        submitted: <Clock className="h-3 w-3 mr-1" />,
        removal_requested: <AlertCircle className="h-3 w-3 mr-1" />,
    }

    const classNameMap: Record<string, string> = {
        approved: "bg-success hover:bg-success/80 text-white border-transparent",
        rejected: "bg-destructive hover:bg-destructive/80 text-white border-transparent",
        pending: "text-warning border-warning hover:bg-warning/10",
        submitted: "text-warning border-warning hover:bg-warning/10",
        removal_requested: "bg-orange-500 hover:bg-orange-600 text-white border-transparent",
    }
    
    // cast status to valid keys
    const s = status as keyof typeof labels;
    
    return (
      <Badge variant="outline" className={`font-medium ${classNameMap[s] || ""}`}>
        {icons[s]}
        {labels[s] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Adatok betöltése...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full border-destructive/20 shadow-lg">
            <CardHeader className="text-center">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
                <CardTitle>Hiba történt</CardTitle>
                <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
                 <Button onClick={() => router.push("/login")} variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Vissza a bejelentkezéshez
                 </Button>
            </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <LayoutDashboard className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Klub Kezelőfelület</h1>
                    <p className="text-muted-foreground">Kezeld klubjaid és jelentkezz a Nemzeti Ligába</p>
                </div>
           </div>
           
           <Button variant="outline" asChild className="gap-2">
                <a href="https://tdarts.sironic.hu" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    tDarts Platform
                </a>
           </Button>
        </div>

        <Separator />

        {/* My Clubs Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Klubjaim
            </h2>
          </div>

          {clubs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => {
                const hasApplication = applications.some((app) => app.clubId === club._id);
                const application = applications.find((app) => app.clubId === club._id);
                
                return (
                  <Card key={club._id} className="group hover:border-primary/30 transition-colors duration-300">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{club.name}</CardTitle>
                                    <CardDescription className="capitalize text-xs">
                                        Szerepkör: {club.role}
                                    </CardDescription>
                                </div>
                             </div>
                             {club.verified && (
                                <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20 border-transparent">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Ellenőrzött
                                </Badge>
                             )}
                        </div>
                    </CardHeader>
                    <CardContent>
                       <div className="text-sm">
                           {hasApplication ? (
                               <div className="space-y-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                                   <div className="flex justify-between items-center">
                                       <span className="text-muted-foreground">Státusz</span>
                                       {getStatusBadge(application!.status)}
                                   </div>
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                       <span>Beküldve</span>
                                       <span>{new Date(application!.submittedAt).toLocaleDateString('hu-HU')}</span>
                                    </div>
                               </div>
                           ) : (
                               <div className="text-muted-foreground text-sm py-2">
                                   Jelentkezz a kluboddal a Nemzeti Ligába, hogy hivatalos versenyeket szervezhess.
                               </div>
                           )}
                       </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        {hasApplication ? (
                             application!.status === 'approved' && (
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => handleRequestRemoval(application!._id)}
                                    disabled={applyingFor === application!._id}
                                >
                                     {applyingFor === application!._id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                                     Eltávolítás kérése
                                </Button>
                             )
                        ) : (
                            <div className="flex flex-col items-center mx-auto gap-2">
                              <Button
                                  className="w-full"
                                  size="sm"
                                  onClick={() => handleApply(club._id, club.name)}
                                  disabled={applyingFor === club._id || club.role !== 'admin'}
                                  title={club.role !== 'admin' ? 'Csak klub adminisztrátorok jelentkezhetnek' : ''}
                              >
                                  {applyingFor === club._id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trophy className="h-4 w-4 mr-2" />}
                                  Jelentkezés
                              </Button>
                              <span className="text-xs text-muted-foreground">Csak klub adminisztrátorok jelentkezhetnek</span>
                            </div>
                        )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-muted/10 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-semibold">Még nincs klubod</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            Hozz létre egy klubot a tDarts platformon, hogy jelentkezhess a Magyar Nemzeti Amatőr Ligába.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-4">
                        <Button onClick={() => setShowCreateClub(true)} variant="default">
                            <Plus className="h-4 w-4 mr-2" />
                            Klub létrehozása
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="https://tdarts.sironic.hu" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                tDarts Platform
                            </a>
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-md max-w-sm">
                        💡 <strong>Tipp:</strong> Ha Google-lal jelentkeztél be, már van tDarts fiókod! 
                        Most csak létre kell hoznod egy klubot és beállítanod magad adminisztrátornak.
                    </div>
                </CardContent>
            </Card>
          )}
        </div>

         {/* Applications Section */}
         {applications.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Jelentkezéseim
            </h2>
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app._id}>
                    <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                             <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Building2 className="h-6 w-6" />
                             </div>
                             <div>
                                <h3 className="font-semibold">{app.clubName}</h3>
                                <div className="text-sm text-muted-foreground">
                                    Beküldve: {new Date(app.submittedAt).toLocaleDateString('hu-HU', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                             </div>
                        </div>
                        {getStatusBadge(app.status)}
                    </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Help Section for Google Users */}
        {clubs.length === 0 && applications.length === 0 && (
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Trophy className="h-5 w-5 text-primary" />
                        </div>
                         <div className="space-y-2">
                            <h3 className="font-semibold">Hogyan tovább?</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                                <li>Menj a <strong className="text-foreground">tDarts platformra</strong></li>
                                <li>Hozz létre egy új klubot (Klubok → Új Klub)</li>
                                <li>Állítsd be magad <strong className="text-foreground">klub adminisztrátornak</strong></li>
                                <li>Térj vissza ide és jelentkezz a Nemzeti Ligába!</li>
                            </ol>
                         </div>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>

      {/* Create Club Modal */}
      {showCreateClub && (
        <CreateClubModal
          onClose={() => setShowCreateClub(false)}
          onSuccess={async () => {
            setShowCreateClub(false);
            toast.success('Klub sikeresen létrehozva! Frissítjük a klublistát...');
            // Reload clubs
            const clubsResponse = await fetch("/api/user/clubs");
            if (clubsResponse.ok) {
              const clubsData = await clubsResponse.json();
              setClubs(clubsData.clubs || []);
            }
          }}
        />
      )}
    </div>
  );
}
