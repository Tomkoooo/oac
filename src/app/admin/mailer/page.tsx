"use client";

import { useState } from "react";
import { 
  Mail, 
  Send, 
  Loader2, 
  Info,
  CircleCheck as CheckCircle2,
  ChevronLeft
} from "lucide-react";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ClientQuill } from "@/components/admin/ClientQuill";


export default function MailerPage() {
  const [mailerData, setMailerData] = useState({ to: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailerData.to || !mailerData.subject || !mailerData.message) {
      toast.error('Kérlek töltsd ki az összes mezőt!');
      return;
    }
    
    setSending(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: mailerData.to,
          subject: mailerData.subject,
          message: mailerData.message,
          isHtml: true 
        }),
      });

      if (!response.ok) throw new Error('Küldés sikertelen');
      
      toast.success('Email sikeresen elküldve!');
      setMailerData({ to: '', subject: '', message: '' }); 
    } catch {
      toast.error('Hiba történt az email küldésekor');
    } finally {
      setSending(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-warning mb-2">
            <Mail className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Email Központ</h1>
          </div>
          <p className="text-muted-foreground">Profi hírlevelek és értesítők kiküldése a klubok számára.</p>
        </div>
        
        <div className="hidden md:block">
           <Card className="border-border/40 bg-card/40 backdrop-blur-md px-4 py-2">
             <div className="flex items-center gap-4">
               <div className="text-right">
                 <p className="text-[10px] text-muted-foreground font-medium uppercase">Ma kiküldve</p>
                 <p className="text-xl font-bold">12</p>
               </div>
               <div className="h-8 w-[1px] bg-border/40" />
               <CheckCircle2 className="h-5 w-5 text-success" />
             </div>
           </Card>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <Card className="lg:col-span-3 border-border/40 bg-card/40 backdrop-blur-md overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/40">
            <CardTitle className="text-lg font-bold">Üzenet összeállítása</CardTitle>
            <CardDescription>Használja a vizuális szerkesztőt a formázáshoz.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSendEmail} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="to" className="text-xs font-bold uppercase tracking-wider opacity-70">
                    Címzett
                  </Label>
                  <Input 
                    id="to" 
                    placeholder="pelda@klub.hu vagy 'all'" 
                    value={mailerData.to}
                    onChange={(e) => setMailerData({ ...mailerData, to: e.target.value })}
                    className="bg-background/50 border-border/40 h-10"
                  />
                  <p className="text-[10px] text-muted-foreground">Tipp: &apos;all&apos; az összes verifikált klubnak</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider opacity-70">
                    Tárgy
                  </Label>
                  <Input 
                    id="subject" 
                    placeholder="Pl: OAC Liga - Fontos tájékoztató" 
                    value={mailerData.subject}
                    onChange={(e) => setMailerData({ ...mailerData, subject: e.target.value })}
                    className="bg-background/50 border-border/40 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider opacity-70">
                  Tartalom
                </Label>
                <div className="quill-wrapper bg-background/50 rounded-md overflow-hidden border border-border/40">
                  <ClientQuill
                    value={mailerData.message} 
                    onChange={(content: string) => setMailerData({ ...mailerData, message: content })}
                    className="min-h-[300px]"
                    modules={modules}
                    placeholder="Írja ide az üzenet tartalmát..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                <Button type="button" variant="ghost" asChild>
                   <Link href="/admin/dashboard">Elvetés</Link>
                </Button>
                <Button type="submit" className="min-w-[160px] gap-2 bg-warning text-warning-foreground hover:bg-warning/90 h-11" disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Küldés..." : "Üzenet Küldése"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/40 bg-card/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Segédlet
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="font-bold text-foreground mb-1">Formázás</p>
                <p>A szerkesztőben használt stílusok pontosan úgy fognak megjelenni a levelezőkben is.</p>
              </div>
              
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/10">
                <p className="font-bold text-foreground mb-1">Címzettek</p>
                <p>Az <strong>&apos;all&apos;</strong> parancs kiküldés előtt megerősítést kér az összes klubra.</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                <p className="font-bold text-foreground mb-1">Sablonok</p>
                <p>Az automata üzeneteket a <strong>Beállítások</strong> menüben módosíthatja.</p>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full justify-start gap-2 border-border/40 bg-background/40" asChild>
             <Link href="/admin/dashboard">
               <ChevronLeft className="h-4 w-4" />
               Vissza a Dashboardhoz
             </Link>
          </Button>
        </div>
      </div>

    </div>
  );
}
