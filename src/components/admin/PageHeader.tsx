import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PageHeaderBadge {
  count?: number;
  label?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  isWarning?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: PageHeaderBadge;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  badge,
  children, 
  className 
}: PageHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col gap-4 md:flex-row md:items-start justify-between pb-6 border-b border-border/20",
      className
    )}>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30">
              <Icon className="h-5 w-5 text-warning" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              {title}
              {badge && (badge.count !== undefined && badge.count > 0) && (
                <Badge 
                  variant={badge.variant || "secondary"}
                  className={cn(
                    "h-6 px-2 text-xs font-semibold",
                    badge.isWarning && "bg-warning/20 text-warning border-warning/30",
                    badge.variant === "destructive" && "bg-destructive/20 text-destructive border-destructive/30"
                  )}
                >
                  {badge.count} {badge.label || ""}
                </Badge>
              )}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground max-w-2xl mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2 md:mt-2">
          {children}
        </div>
      )}
    </div>
  );
}
