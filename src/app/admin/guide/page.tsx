"use client";

import { 
  HelpCircle, 
  CheckCircle2, 
  Shield, 
  Mail, 
  Users, 
  BarChart3,
  Search,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function GuidePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Súgó & Útmutató</h1>
        <p className="text-muted-foreground">Ismerd meg az OAC Admin Portal használatát</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Shield className="h-5 w-5 text-warning" />
               Adminisztrátori Folyamatok
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning font-bold text-xs ring-1 ring-warning/30">1</div>
                <div>
                  <h4 className="font-bold">Jelentkezések Ellenőrzése</h4>
                  <p className="text-sm text-muted-foreground">A &apos;Jelentkezések&apos; menüpont alatt láthatod az új klubok beküldött igényeit. Ellenőrizd a klub nevét és a jelentkező adatait.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning font-bold text-xs ring-1 ring-warning/30">2</div>
                <div>
                  <h4 className="font-bold">Jóváhagyás</h4>
                  <p className="text-sm text-muted-foreground">A &apos;Jóváhagyás&apos; gombra kattintva a rendszer automatikusan létrehozza az OAC ligát a tDarts felületén az adott klub számára, és értesíti a jelentkezőt.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning font-bold text-xs ring-1 ring-warning/30">3</div>
                <div>
                  <h4 className="font-bold">Kommunikáció</h4>
                  <p className="text-sm text-muted-foreground">Használd az &apos;Email küldés&apos; menüt tömeges tájékoztatókhoz, vagy küldj egyedi üzenetet a jelentkezési adatlapoknál található gyorsikonnal.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
           <Card className="border-border/40 bg-card/40 backdrop-blur-md">
             <CardHeader>
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <Users className="h-4 w-4 text-primary" />
                 Admin Kezelés
               </CardTitle>
             </CardHeader>
             <CardContent className="text-xs text-muted-foreground">
               Az &apos;Admin Felhasználók&apos; menüben hozhatsz létre új hozzáféréseket a munkatársaidnak. Vigyázz, a jelszót csak a létrehozáskor láthatod!
             </CardContent>
           </Card>

           <Card className="border-border/40 bg-card/40 backdrop-blur-md">
             <CardHeader>
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <BarChart3 className="h-4 w-4 text-success" />
                 Adatbetöltés
               </CardTitle>
             </CardHeader>
             <CardContent className="text-xs text-muted-foreground">
               A statisztikák naponta frissülnek. Ha egy jelentkezőnél hiányzik a név vagy email, használd a Beállítások &rarr; Szinkronizálás funkciót.
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
