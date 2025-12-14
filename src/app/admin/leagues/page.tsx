"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Award, CheckCircle } from "lucide-react";
import TelemetryChart from "@/components/TelemetryChart";
import axios from "axios";

interface League {
  _id: string;
  name: string;
  description: string;
  pointSystemType: string;
  verified: boolean;
  isActive: boolean;
  createdAt: string;
  club: {
    _id: string;
    name: string;
    verified: boolean;
  };
}

export default function AdminLeaguesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_TDARTS_API_URL}/api/admin/leagues`, {
        headers: {
          'x-internal-secret': process.env.NEXT_PUBLIC_TDARTS_INTERNAL_SECRET || process.env.TDARTS_INTERNAL_SECRET
        }
      });
      // OAC Portal only shows VERIFIED leagues
      const verifiedLeagues = response.data.leagues.filter((league: League) => league.verified === true);
      setLeagues(verifiedLeagues);
      setStats({
        total: verifiedLeagues.length,
        verified: verifiedLeagues.length,
        unverified: 0
      });
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple mock telemetry data
  const telemetryData = [
    { all: Math.floor(stats.total * 0.7), verified: Math.floor(stats.verified * 0.7), unverified: 0, label: '3 hónappal ezelőtt' },
    { all: Math.floor(stats.total * 0.85), verified: Math.floor(stats.verified * 0.85), unverified: 0, label: '2 hónappal ezelőtt' },
    { all: Math.floor(stats.total * 0.92), verified: Math.floor(stats.verified * 0.92), unverified: 0, label: '1 hónappal ezelőtt' },
    { all: stats.total, verified: stats.verified, unverified: 0, label: 'Most' },
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
          <h1 className="text-4xl font-bold">OAC Ligák</h1>
          <p className="text-muted-foreground mt-2">Hitelesített OAC ligák megtekintése</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">OAC Ligák</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Award className="h-10 w-10 text-primary opacity-50" />
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktív ligák</p>
                <p className="text-3xl font-bold mt-1 text-success">{leagues.filter(l => l.isActive).length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-success opacity-50" />
            </div>
          </div>
        </div>

        {/* Telemetry Chart */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">OAC Liga növekedés</h2>
          <TelemetryChart data={telemetryData} />
        </div>

        {/* Leagues Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Liga neve</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Klub</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Pontozási rendszer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Státusz</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Létrehozva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leagues.map((league) => (
                  <tr key={league._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{league.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {league.club.name}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success text-xs">
                          <CheckCircle className="h-3 w-3" />
                          OAC
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                        league.pointSystemType === 'remiz_christmas' 
                          ? 'bg-warning/20 text-warning' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {league.pointSystemType === 'remiz_christmas' ? 'Remiz Karácsony' : 'Platform'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {league.isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/20 text-success text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Aktív
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                          Inaktív
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(league.createdAt).toLocaleDateString('hu-HU')}
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
