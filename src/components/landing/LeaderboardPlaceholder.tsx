import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export function LeaderboardPlaceholder() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">National Leaderboard</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Top performing clubs and players in the national league.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="relative overflow-hidden border-primary/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="h-24 w-24" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-primary">#{i}</span>
                            <span>Club Name {i}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Points</span>
                                <span className="font-bold">1250</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Matches</span>
                                <span className="font-bold">12</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </section>
  );
}
