"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
  action: string;
  date: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
}

export function ActivityFeed({ activities = [] }: ActivityFeedProps) {
  return (
    <Card className="col-span-1 h-full min-h-[400px] bg-card/40 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Tevékenységnapló
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="flex flex-col gap-0 p-4 pt-0">
            {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nincs közelmúltbeli tevékenység.</p>
            ) : (
                activities.map((item) => (
                <div key={item.id} className={cn(
                    "flex items-start gap-4 py-4 border-b border-border/40 last:border-0",
                    "hover:bg-muted/30 transition-colors p-2 rounded-lg -mx-2"
                )}>
                    <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={item.user.image} alt={item.user.name} />
                    <AvatarFallback>{item.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.user.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    {item.type === 'warning' && <div className="h-2 w-2 rounded-full bg-warning translate-y-2" />}
                    {item.type === 'error' && <div className="h-2 w-2 rounded-full bg-destructive translate-y-2" />}
                    {item.type === 'success' && <div className="h-2 w-2 rounded-full bg-success translate-y-2" />}
                    {item.type === 'info' && <div className="h-2 w-2 rounded-full bg-blue-500 translate-y-2" />}
                </div>
                ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
