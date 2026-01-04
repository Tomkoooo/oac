import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon: Icon, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center justify-between pb-6 border-b border-border/40", className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
