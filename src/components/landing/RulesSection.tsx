"use client";

import React from "react";
import Link from "next/link";
import { IconFileText, IconAward, IconDownload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface RuleItem {
  title: string;
  content: string;
}

interface RuleSectionType {
  title: string;
  description?: string;
  items: RuleItem[];
}

interface RulesData {
  important: RuleSectionType;
  competition: RuleSectionType;
  league: RuleSectionType;
  general: RuleSectionType;
  points: RuleSectionType;
  application: RuleSectionType;
}

interface RulesSectionProps {
  rules: RulesData;
}

const RulesSection = ({ rules }: RulesSectionProps) => {
  if (!rules) return null;


  return (
    <section id="rules" className="py-24 bg-muted/10 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-12">
             {/* Important Rules */}
             <div className="p-6 rounded-2xl bg-warning/5 border border-warning/10">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-warning">
                    <IconFileText className="h-5 w-5" />
                    {rules.important.title}
                  </h3>
                  <div className="space-y-4">
                    {rules.important.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="h-2 w-2 rounded-full bg-warning mt-2 shrink-0" />
                        <div>
                           <span className="font-semibold text-foreground block mb-1">{item.title}</span>
                           <span className="text-sm text-muted-foreground">{item.content}</span>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
 
               <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">{rules.general.title}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">{rules.general.description}</p>
               </div>
               
               <div className="space-y-8">
                 {rules.general.items.map((item, idx: number) => (
                   <div key={idx} className="flex gap-4 group">
                     <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                       {idx + 1}
                     </div>
                     <div>
                       <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                       <p className="text-muted-foreground">{item.content}</p>
                     </div>
                   </div>
                 ))}
               </div>
 
               <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="p-8">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <IconAward className="h-5 w-5 text-primary" />
                        {rules.points.title}
                      </h3>
                      <div className="space-y-4">
                        {rules.points.items.map((item, idx: number) => (
                          <div key={idx} className="group">
                              <div className="flex justify-between items-center pb-2">
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{item.title}</span>
                                <span className="font-bold text-primary">{item.content}</span>
                              </div>
                              {idx < rules.points.items.length - 1 && <Separator className="bg-border/50" />}
                          </div>
                        ))}
                      </div>
                  </CardContent>
               </Card>
            </div>
 
            <div className="relative lg:sticky lg:top-24">
               {/* Glow effect */}
               <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
               
               <Card className="relative border-primary/20 shadow-2xl shadow-primary/10">
                  <CardContent className="p-8 md:p-10 space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold flex items-center gap-3">
                          <IconFileText className="h-6 w-6 text-primary" />
                          {rules.application.title}
                      </h3>
                      <p className="text-muted-foreground">
                          {rules.application.description}
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      {rules.application.items.map((item, idx: number) => (
                        <div key={idx} className="flex gap-4">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                          <div>
                            <p className="font-bold text-lg mb-1">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                  <div className="pt-8 border-t border-border">
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      További információra van szükséged?
                    </p>
                    <Button variant="outline" className="w-full gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 h-12 text-base" asChild>
                      <Link href="/manual">
                        <IconDownload className="h-5 w-5" />
                        Teljes Szabályzat Letöltése
                      </Link>
                    </Button>
                  </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RulesSection;
