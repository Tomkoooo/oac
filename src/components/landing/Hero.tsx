import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/10 -z-10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              Hungarian National Amateur League
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Join the premier amateur darts league in Hungary. Manage your club, apply for leagues, and compete with the best.
            </p>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button className="h-11 px-8" size="lg">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" className="h-11 px-8" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
