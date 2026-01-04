import { 
  Building2, 
  Users, 
  Trophy, 
  Clock, 
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";

interface KpiStatsProps {
  stats: {
    clubCount?: number;
    playerCount?: number;
    tournamentCount?: number;
    pendingApplications?: number;
  } | null;
  loading?: boolean;
}

export function KpiStats({ stats, loading }: KpiStatsProps) {
  const items = [
    {
      title: "Verifikált Klubok",
      value: stats?.clubCount ?? 0,
      icon: Building2,
      iconClassName: "text-blue-500 bg-blue-500/10",
      description: "Összes hitelesített klub"
    },
    {
      title: "Versenyzők",
      value: stats?.playerCount ?? 0,
      icon: Users,
      iconClassName: "text-purple-500 bg-purple-500/10",
      description: "Regisztrált játékosok"
    },
    {
      title: "Összes Verseny",
      value: stats?.tournamentCount ?? 0,
      icon: Trophy,
      iconClassName: "text-warning bg-warning/10",
      description: "Lezajlott és tervezett"
    },
    {
      title: "Függő Jelentkezések",
      value: stats?.pendingApplications ?? 0,
      icon: Clock,
      iconClassName: "text-orange-500 bg-orange-500/10",
      description: "Jóváhagyásra vár",
      urgent: (stats?.pendingApplications ?? 0) > 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <StatCard
          key={index}
          title={item.title}
          value={item.value}
          icon={item.icon}
          isLoading={loading}
          iconClassName={item.iconClassName}
          description={item.description}
          className={item.urgent ? "border-orange-500/50 bg-orange-500/5 hover:bg-orange-500/10" : ""}
        />
      ))}
    </div>
  );
}
