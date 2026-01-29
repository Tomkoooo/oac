import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle, HelpCircle, Receipt } from "lucide-react";
import { LucideIcon } from "lucide-react";

type StatusType = 
  | "submitted" 
  | "approved" 
  | "rejected" 
  | "removal_requested" 
  | "pending"
  | "active"
  | "inactive"
  | "warning"
  | "error"
  | "success"
  | "info";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<StatusType, {
  icon: LucideIcon;
  label: string;
  className: string;
}> = {
  submitted: {
    icon: Clock,
    label: "Beküldve",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20"
  },
  pending: {
    icon: Clock,
    label: "Függőben",
    className: "bg-warning/10 text-warning border-warning/20"
  },
  approved: {
    icon: CheckCircle,
    label: "Jóváhagyva",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  },
  success: {
    icon: CheckCircle,
    label: "Sikeres",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  },
  rejected: {
    icon: XCircle,
    label: "Elutasítva",
    className: "bg-destructive/10 text-destructive border-destructive/20"
  },
  error: {
    icon: XCircle,
    label: "Hiba",
    className: "bg-destructive/10 text-destructive border-destructive/20"
  },
  removal_requested: {
    icon: AlertCircle,
    label: "Törlés kérve",
    className: "bg-orange-500/10 text-orange-600 border-orange-500/20"
  },
  warning: {
    icon: AlertCircle,
    label: "Figyelmeztetés",
    className: "bg-orange-500/10 text-orange-600 border-orange-500/20"
  },
  active: {
    icon: CheckCircle,
    label: "Aktív",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  },
  inactive: {
    icon: HelpCircle,
    label: "Inaktív",
    className: "bg-muted/50 text-muted-foreground border-muted"
  },
  info: {
    icon: HelpCircle,
    label: "Információ",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20"
  }
};

export function StatusBadge({ status, label, className, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  return (
    <Badge 
      variant="outline"
      className={cn(
        "font-medium border transition-colors",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1.5" />}
      {displayLabel}
    </Badge>
  );
}
