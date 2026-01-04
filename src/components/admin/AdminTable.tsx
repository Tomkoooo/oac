import { cn } from "@/lib/utils";

interface AdminTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AdminTable({ children, className, ...props }: AdminTableProps) {
  return (
    <div className={cn("glass-card overflow-hidden", className)} {...props}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {children}
        </table>
      </div>
    </div>
  );
}

export function AdminTableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-muted/50 border-b border-border/50 text-xs uppercase font-semibold text-muted-foreground tracking-wider">
      {children}
    </thead>
  );
}

export function AdminTableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-border/40">
      {children}
    </tbody>
  );
}

export function AdminTableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr 
      className={cn("group hover:bg-muted/30 transition-colors", className)} 
      {...props}
    >
      {children}
    </tr>
  );
}

export function AdminTableHead({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th 
      className={cn("px-6 py-4 text-left font-medium", className)} 
      {...props}
    >
      {children}
    </th>
  );
}

export function AdminTableCell({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td 
      className={cn("px-6 py-4 align-middle", className)} 
      {...props}
    >
      {children}
    </td>
  );
}
