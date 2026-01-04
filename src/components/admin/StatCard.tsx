import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  isLoading?: boolean;
  className?: string; // Additional classes for the card
  iconClassName?: string; // Component-specific styling for the icon wrapper
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  isLoading, 
  className,
  iconClassName 
}: StatCardProps) {
  return (
    <div className={cn("glass-card p-6 relative overflow-hidden group hover:bg-card/60 transition-colors", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={cn("p-2 rounded-lg bg-primary/10", iconClassName)}>
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="mt-4">
        {isLoading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{value}</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      {/* Background decoration */}
      <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Icon className="h-24 w-24" />
      </div>
    </div>
  );
}
