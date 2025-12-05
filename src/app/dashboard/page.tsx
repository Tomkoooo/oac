"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Clock, AlertCircle, Trophy, Loader2, ArrowLeft, ExternalLink, Plus, Users } from "lucide-react";
import CreateClubModal from "@/components/CreateClubModal";
import { toast } from "react-hot-toast";

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-error" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: "bg-success/20 text-success border-success/50",
      rejected: "bg-error/20 text-error border-error/50",
      pending: "bg-warning/20 text-warning border-warning/50",
      submitted: "bg-warning/20 text-warning border-warning/50",
      removal_requested: "bg-orange-500/20 text-orange-500 border-orange-500/50"
    };
    const labels = {
      approved: "Elfogadva",
      rejected: "Elutasítva",
      pending: "Függőben",
      submitted: "Függőben",
      removal_requested: "Eltávolítás kérve"
    };
    
    const statusKey = status as keyof typeof styles;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[statusKey] || styles.pending}`}>
        {getStatusIcon(status)}
        {labels[statusKey] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="glass-card p-8 text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Adatok betöltése...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="glass-card max-w-md p-8 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-error mx-auto" />
          <h2 className="text-2xl font-bold">Hiba</h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="glass-button inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Vissza a bejelentkezéshez
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 border-2 border-primary/50">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Klub Kezelőfelület</h1>
              <p className="text-muted-foreground">
                Kezeld klubjaid és jelentkezz a Nemzeti Ligába
              </p>
            </div>
          </div>
        </div>

        {/* My Clubs Section */}
        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Klubjaim
            </h2>
            <a
              href="https://tdarts.sironic.hu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              tDarts Platform
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {clubs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => {
                const hasApplication = applications.some((app) => app.clubId === club._id);
                const application = applications.find((app) => app.clubId === club._id);
                
                return (
                  <div key={club._id} className="depth-card group">
                    <div className="space-y-4">
                      {/* Club Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{club.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              Szerepkör: {club.role}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Verification Status */}
                      {club.verified && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/30">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="text-sm text-success">Ellenőrzött klub</span>
                        </div>
                      )}

                      {/* Application Status or Apply Button */}
                      <div className="pt-4 border-t border-border/50">
                        {hasApplication ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Státusz:</span>
                              {getStatusBadge(application!.status)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Beküldve: {new Date(application!.submittedAt).toLocaleDateString('hu-HU')}
                            </p>
                            {application!.status === 'approved' && (
                              <button
                                onClick={() => handleRequestRemoval(application!._id)}
                                disabled={applyingFor === application!._id}
                                className="w-full h-11 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-error text-error-foreground hover:bg-error/90 transition-colors disabled:opacity-50 text-sm font-semibold"
                              >
                                {applyingFor === application!._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <AlertCircle className="h-4 w-4" />
                                )}
                                OAC eltávolításának kérése
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApply(club._id, club.name)}
                            disabled={applyingFor === club._id || club.role !== 'admin'}
                            className="w-full glass-button h-11 inline-flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title={club.role !== 'admin' ? 'Csak klub adminisztrátorok jelentkezhetnek' : ''}
                          >
                            {applyingFor === club._id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Jelentkezés...
                              </>
                            ) : (
                              <>
                                <Trophy className="h-4 w-4" />
                                Jelentkezés a Nemzeti Ligába
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-12 text-center space-y-6">
              <Building2 className="h-20 w-20 text-muted-foreground/50 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Még nincs klubod</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  Hozz létre egy klubot a tDarts platformon, hogy jelentkezhess a Magyar Nemzeti Amatőr Ligába.
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  💡 <strong>Tipp:</strong> Ha Google-lal jelentkeztél be, már van tDarts fiókod! 
                  Most csak létre kell hoznod egy klubot és beállítanod magad adminisztrátornak.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowCreateClub(true)}
                  className="inline-flex items-center gap-2 glass-button"
                >
                  <Plus className="h-5 w-5" />
                  Klub létrehozása
                </button>
                <a
                  href="https://tdarts.sironic.hu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 border-2 border-primary/50 hover:border-primary hover:bg-primary/10"
                >
                  <Users className="h-5 w-5" />
                  tDarts Platform
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Applications Section */}
        {applications.length > 0 && (
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              Jelentkezéseim
            </h2>
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app._id} className="glass-card p-6 hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{app.clubName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Beküldve: {new Date(app.submittedAt).toLocaleDateString('hu-HU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Section for Google Users */}
        {clubs.length === 0 && applications.length === 0 && (
          <div className="glass-card p-6 border-l-4 border-primary animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Hogyan tovább?</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Menj a <strong className="text-foreground">tDarts platformra</strong></li>
                  <li>Hozz létre egy új klubot (Klubok → Új Klub)</li>
                  <li>Állítsd be magad <strong className="text-foreground">klub adminisztrátornak</strong></li>
                  <li>Térj vissza ide és jelentkezz a Nemzeti Ligába!</li>
                </ol>
                <p className="text-xs text-muted-foreground pt-2">
                  ℹ️ A klub ellenőrzése után automatikusan részt vehetsz a nemzeti liga versenyekben.
                </p>
              </div>
            </div>
          </div>
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
