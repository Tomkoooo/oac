"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Trophy, CheckCircle, Users, Calendar } from "lucide-react";
import TelemetryChart from "@/components/TelemetryChart";
import axios from "axios";

interface Tournament {
  _id: string;
  name: string;
  tournamentId: string;
  description?: string;
  status: string;
  tournamentType: string;
  startDate: string;
  playerCount: number;
  verified: boolean;
  createdAt: string;
  clubId: {
    _id: string;
    name: string;
  };
  league?: {
    _id: string;
    name: string;
    verified: boolean;
  };
}

export default function AdminTournamentsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_TDARTS_API_URL}/api/admin/tournaments`, {
        headers: {
          'x-internal-secret': process.env.NEXT_PUBLIC_TDARTS_INTERNAL_SECRET || process.env.TDARTS_INTERNAL_SECRET
        }
      });
      // OAC Portal only shows VERIFIED tournaments (attached to verified leagues)
      const verifiedTournaments = response.data.tournaments.filter((t: Tournament) => t.verified === true);
      setTournaments(verifiedTournaments);
      setStats({
        total: verifiedTournaments.length,
        verified: verifiedTournaments.length,
        unverified: 0
      });
    } catch (error) {
      console.error('Error fetching tournaments:', error);
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Függőben',
      'active': 'Aktív',
      'group-stage': 'Csoportkör',
      'knockout': 'Kieséses',
      'finished': 'Befejezett'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'group': 'Csoportos',
      'knockout': 'Kieséses',
      'group_knockout': 'Vegyes'
    };
    return labels[type] || type;
  };

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
          <h1 className="text-4xl font-bold">OAC Versenyek</h1>
          <p className="text-muted-foreground mt-2">Hitelesített OAC versenyek megtekintése</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">OAC Versenyek</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Trophy className="h-10 w-10 text-primary opacity-50" />
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktív versenyek</p>
                <p className="text-3xl font-bold mt-1 text-success">
                  {tournaments.filter(t => ['active', 'group-stage', 'knockout'].includes(t.status)).length}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-success opacity-50" />
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Összesen játékos</p>
                <p className="text-3xl font-bold mt-1">
                  {tournaments.reduce((total, t) => total + t.playerCount, 0)}
                </p>
              </div>
              <Users className="h-10 w-10 text-primary opacity-50" />
            </div>
          </div>
        </div>

        {/* Telemetry Chart */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">OAC Verseny növekedés</h2>
          <TelemetryChart data={telemetryData} />
        </div>

        {/* Tournaments Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Verseny neve</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Klub</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Liga</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Típus</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Játékosok</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Státusz</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Dátum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tournaments.map((tournament) => (
                  <tr key={tournament._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{tournament.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{tournament.clubId.name}</td>
                    <td className="px-6 py-4">
                      {tournament.league && (
                        <div className="flex items-center gap-2">
                          {tournament.league.name}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success text-xs">
                            <CheckCircle className="h-3 w-3" />
                            OAC
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                        {getTypeLabel(tournament.tournamentType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{tournament.playerCount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                        ['active', 'group-stage', 'knockout'].includes(tournament.status)
                          ? 'bg-success/20 text-success'
                          : tournament.status === 'finished'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-warning/20 text-warning'
                      }`}>
                        {getStatusLabel(tournament.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(tournament.startDate).toLocaleDateString('hu-HU')}
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
