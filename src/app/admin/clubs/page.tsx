"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Building2, CheckCircle, XCircle } from "lucide-react";
import TelemetryChart from "@/components/TelemetryChart";
import axios from "axios";

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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_TDARTS_API_URL}/api/admin/clubs`, {
        headers: {
          'x-internal-secret': process.env.NEXT_PUBLIC_TDARTS_INTERNAL_SECRET || process.env.TDARTS_INTERNAL_SECRET
        }
      });
      // OAC Portal only shows VERIFIED clubs
      const verifiedClubs = response.data.clubs.filter((club: Club) => club.verified === true);
      setClubs(verifiedClubs);
      setStats({
        total: verifiedClubs.length,
        verified: verifiedClubs.length,
        unverified: 0
      });
    } catch (error) {
      console.error('Error fetching clubs:', error);
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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">OAC Klubok</h1>
          <p className="text-muted-foreground mt-2">Hitelesített OAC klubok megtekintése</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hitelesített klubok</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Building2 className="h-10 w-10 text-primary opacity-50" />
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktív klubok</p>
                <p className="text-3xl font-bold mt-1 text-success">{clubs.filter(c => c.isActive).length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-success opacity-50" />
            </div>
          </div>
        </div>


        {/* Telemetry Chart */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">OAC Klub növekedés</h2>
          <TelemetryChart data={telemetryData} />
        </div>

        {/* Clubs Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Klub neve</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Helyszín</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Tagok</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Versenyek</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Státusz</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Létrehozva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClubs.map((club) => (
                  <tr key={club._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{club.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{club.location}</td>
                    <td className="px-6 py-4">{club.memberCount || 0}</td>
                    <td className="px-6 py-4">{club.tournamentCount || 0}</td>
                    <td className="px-6 py-4">
                      {club.verified ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/20 text-success text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Hitelesített
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                          <XCircle className="h-4 w-4" />
                          Nem hitelesített
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(club.createdAt).toLocaleDateString('hu-HU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
