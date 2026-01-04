"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Building2, CheckCircle, XCircle, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import TelemetryChart from "@/components/TelemetryChart";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { AdminTable, AdminTableHeader, AdminTableRow, AdminTableHead, AdminTableBody, AdminTableCell } from "@/components/admin/AdminTable";


interface Club {
  _id: string;
  name: string;
  description: string;
  location: string;
  verified: boolean;
  isActive: boolean;
  createdAt: string;
  memberCount: number;
  tournamentCount: number;
}

export default function AdminClubsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await fetch('/api/admin/clubs');
      
      if (response.ok) {
        const data = await response.json();
        setClubs(data.clubs || []);
        setStats(data.stats || { total: 0, verified: 0, unverified: 0 });
      } else {
        throw new Error('Failed to fetch clubs');
      }
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error("Nem sikerült betölteni a klubokat");
    } finally {
      setLoading(false);
    }
  };


  // OAC Portal shows only verified clubs
  const filteredClubs = clubs;

  // Simple mock telemetry data (in production, this would come from historical data)
  const telemetryData = [
    { all: Math.floor(stats.total * 0.7), verified: Math.floor(stats.verified * 0.7), unverified: Math.floor(stats.unverified * 0.7), label: '3 hónappal ezelőtt' },
    { all: Math.floor(stats.total * 0.85), verified: Math.floor(stats.verified * 0.85), unverified: Math.floor(stats.unverified * 0.85), label: '2 hónappal ezelőtt' },
    { all: Math.floor(stats.total * 0.92), verified: Math.floor(stats.verified * 0.92), unverified: Math.floor(stats.unverified * 0.92), label: '1 hónappal ezelőtt' },
    { all: stats.total, verified: stats.verified, unverified: stats.unverified, label: 'Most' },
  ];

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="OAC Klubok" 
        description="A hivatalosan regisztrált és hitelesített klubok listája."
        icon={Building2}
      >
         <div className="flex gap-2">
             {/* Future: Add 'New Club' button or Export options here */}
         </div>
      </PageHeader>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
            title="Hitelesített klubok" 
            value={stats.total} 
            icon={CheckCircle}
            iconClassName="text-success bg-success/10"
        />
        <StatCard 
            title="Aktív klubok" 
            value={clubs.filter(c => c.isActive).length} 
            icon={Building2}
            iconClassName="text-primary bg-primary/10"
        />
        {/* Can add more stats here, e.g. Total Members */}
      </div>

      {/* Telemetry Chart 
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            Klub növekedés
        </h2>
        <div className="h-[300px] w-full">
            <TelemetryChart data={telemetryData} />
        </div>
      </div>
      */}

      {/* Clubs Table */}
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow>
            <AdminTableHead>Klub neve</AdminTableHead>
            <AdminTableHead>Helyszín</AdminTableHead>
            <AdminTableHead>Tagok</AdminTableHead>
            <AdminTableHead>Versenyek</AdminTableHead>
            <AdminTableHead>Státusz</AdminTableHead>
            <AdminTableHead>Létrehozva</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {filteredClubs.length === 0 ? (
              <AdminTableRow>
                  <AdminTableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nincs megjeleníthető adat.
                  </AdminTableCell>
              </AdminTableRow>
          ) : (
             filteredClubs.map((club) => (
            <AdminTableRow key={club._id} className="cursor-pointer" onClick={() => toast("Klub részletek hamarosan...", { icon: "🚧" })}>
              <AdminTableCell className="font-medium text-foreground">{club.name}</AdminTableCell>
              <AdminTableCell className="text-muted-foreground">{club.location}</AdminTableCell>
              <AdminTableCell>
                  <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {club.memberCount || 0}
                  </div>
              </AdminTableCell>
              <AdminTableCell>{club.tournamentCount || 0}</AdminTableCell>
              <AdminTableCell>
                {club.verified ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium border border-success/20">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Hitelesített
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border">
                    <XCircle className="h-3.5 w-3.5" />
                    Nem hitelesített
                  </span>
                )}
              </AdminTableCell>
              <AdminTableCell className="text-muted-foreground">
                {new Date(club.createdAt).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' })}
              </AdminTableCell>
            </AdminTableRow>
          )))}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
