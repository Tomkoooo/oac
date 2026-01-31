"use client";

import React from "react";
import Link from "next/link";
import { IconArrowRight, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const ApplicationSection = () => {
  return (
    <section id="apply" className="py-32 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Készen állsz a <span className="text-primary">Megmérettetésre?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Ne maradj le a következő szezonról. Csatlakozz most az Országos Amatőr Cashout Ligához és mutasd meg, mit tudsz!
              </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button size="lg" className="h-14 px-10 text-lg gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-105" asChild>
              <Link href="/login">
                <IconSparkles className="w-5 h-5" />
                Jelentkezés Indítása
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg gap-2 bg-background/50 backdrop-blur-sm hover:bg-background/80" asChild>
                <Link href="/manual">
                    Hogyan működik?
                </Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground pt-8">
             Ingyenes regisztráció • Hivatalos versenyengedély • Országos ranglista
          </p>
        </div>
      </div>
    </section>
  );
};

export default ApplicationSection;
