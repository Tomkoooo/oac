"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { Trophy, Coins, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrizePoolSection() {
    const [stats, setStats] = useState({ verifiedTournaments: 0 });
    const [loading, setLoading] = useState(true);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/public/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch public stats");
            } finally {
                setLoading(false);
            }
        };
        
        fetchStats();
    }, []);

    const prizePool = stats.verifiedTournaments * 3000;
    const showExactAmount = prizePool >= 100000; // Only show exact amount if >= 100k

    // Animated number for prize pool
    const count = useSpring(0, { duration: 2000, bounce: 0 });
    const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

    useEffect(() => {
        if (isInView && showExactAmount) {
            count.set(prizePool);
        }
    }, [isInView, prizePool, showExactAmount, count]);

    return (
        <section className="py-24 relative overflow-hidden bg-muted/5">
             {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full blur-3xl bg-warning/10" />
                <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full blur-3xl bg-primary/10" />
            </div>

            <div className="container px-4 mx-auto relative z-10" ref={ref}>
                 <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 text-sm font-medium mb-4"
                    >
                        <Trophy className="w-4 h-4" />
                        <span>Országos Nyereményalap</span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold tracking-tight"
                    >
                        <span className="flex items-center justify-center gap-2 text-warning">
                            <motion.span>{prizePool.toLocaleString()}</motion.span>
                            <span>Ft</span>
                        </span>
                    </motion.h2>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-muted-foreground"
                    >
                        Folyamatosan növekvő összdíjazás minden hitelesített verseny után.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-2xl bg-background border border-border/50 shadow-lg"
                    >
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{stats.verifiedTournaments}</h3>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Hitelesített Verseny</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="p-6 rounded-2xl bg-warning/10 border border-warning/20 shadow-lg relative overflow-hidden"
                    >
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-warning/20 flex items-center justify-center">
                            <Coins className="w-6 h-6 text-warning" />
                        </div>
                        <h3 className="text-3xl font-bold mb-1 text-warning">
                            3 000 Ft
                        </h3>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Versenyenként</p>
                    </motion.div>
                </div>

                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <p className="text-muted-foreground mb-6">Minden egyes hitelesített verseny után 3.000 Ft kerül a közös kalapba.</p>
                    <Button variant="outline" className="rounded-full" asChild>
                        <a href="#rules">Tudj meg többet a szabályokról</a>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
