"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  Loader2, 
  RefreshCw, 
  Shield, 
  Mail,
  FileJson as FileCode,
  Users
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { VisualRulesEditor } from "@/components/admin/VisualRulesEditor";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [populating, setPopulating] = useState(false);
  
  const [emailTemplates, setEmailTemplates] = useState({
    applicationReceived: 'Köszönjük az OAC jelentkezését! Hamarosan feldolgozzuk és értesítjük a döntésről.',
    applicationApproved: 'Gratulálunk! Az OAC jelentkezése jóváhagyva. A ligája aktiválva lett.',
    applicationRejected: 'Sajnálattal értesítjük, hogy az OAC jelentkezését elutasítottuk.'
  });

  const [rules, setRules] = useState<any>(null);
  const [rulesLoading, setRulesLoading] = useState(true);

  useEffect(() => {
    // Fetch rules & email templates from DB
    const fetchData = async () => {
      try {
        const [rulesRes, emailRes] = await Promise.all([
           fetch('/api/admin/config/oac_rules'),
           fetch('/api/admin/config/oac_email_templates')
        ]);

        if (rulesRes.ok) {
          const data = await rulesRes.json();
          setRules(data.value);
        }

        if (emailRes.ok) {
           const data = await emailRes.json();
           if (data.value) setEmailTemplates(data.value);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
        toast.error("Hiba a beállítások betöltésekor");
      } finally {
        setRulesLoading(false);
      }
    };

    fetchData();
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save email templates and rules to DB
      const promises = [];

      // Email Templates
      promises.push(
        fetch('/api/admin/config/oac_email_templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: emailTemplates })
        })
      );
      
      // Rules
      if (rules) {
        promises.push(
          fetch('/api/admin/config/oac_rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: rules })
          })
        );
      }

      await Promise.all(promises);
      toast.success('Beállítások mentve!');
    } catch (err: any) {
      toast.error(err.message || "Mentés sikertelen");
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateApplicants = async () => {
    if (!confirm('Ez frissíti az összes hiányzó jelentkező adatot a tDarts adatbázisából. Folytatod?')) {
      return;
    }

    setPopulating(true);
    try {
      const response = await fetch('/api/admin/populate-applicants', { method: 'POST' });
      if (!response.ok) throw new Error('Frissítés sikertelen');
      const data = await response.json();
      toast.success(`${data.updated} jelentkezés frissítve!`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setPopulating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beállítások</h1>
          <p className="text-muted-foreground">Portál és automatizációs beállítások</p>
        </div>
        <Button onClick={saveSettings} className="gap-2 bg-success text-success-foreground hover:bg-success/90" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Mentés
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Email Templates */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-warning" />
              Automata Email Sablonok
            </CardTitle>
            <CardDescription>
              Ezeket az üzeneteket kapják meg a klubok a jelentkezési folyamat során.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Jelentkezés Beérkezett</Label>
              <textarea 
                className="w-full flex min-h-[80px] rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm"
                value={emailTemplates.applicationReceived}
                onChange={(e) => setEmailTemplates({ ...emailTemplates, applicationReceived: e.target.value })}
              />
            </div>
            
            <Separator className="bg-border/40" />
            
            <div className="space-y-2">
              <Label>Jóváhagyási Értesítő</Label>
              <textarea 
                className="w-full flex min-h-[80px] rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm"
                value={emailTemplates.applicationApproved}
                onChange={(e) => setEmailTemplates({ ...emailTemplates, applicationApproved: e.target.value })}
              />
            </div>

            <Separator className="bg-border/40" />

            <div className="space-y-2">
              <Label>Elutasítási Értesítő</Label>
              <textarea 
                className="w-full flex min-h-[80px] rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm"
                value={emailTemplates.applicationRejected}
                onChange={(e) => setEmailTemplates({ ...emailTemplates, applicationRejected: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* OAC Rules JSON Editor */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-warning" />
              OAC Szabályzat (JSON)
            </CardTitle>
            <CardDescription>
              A főoldalon megjelenő szabályok és pontrendszer szerkesztése.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rulesLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-warning" />
              </div>
            ) : rules ? (
              <VisualRulesEditor 
                initialRules={rules}
                onChange={(updatedRules) => setRules(updatedRules)}
              />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nem sikerült betölteni a szabályokat
              </p>
            )}
          </CardContent>
        </Card>

        {/* Administrative Tools */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md border-warning/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <Shield className="h-5 w-5" />
              Adminisztratív Eszközök
            </CardTitle>
            <CardDescription>
              Rendszerkarbantartási és adatfrissítési műveletek.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/20">
              <div className="space-y-1">
                <p className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Jelentkezők Szinkronizálása
                </p>
                <p className="text-xs text-muted-foreground">Hiányzó jelentkező nevek és emailek lekérése a tDarts-ból.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handlePopulateApplicants}
                disabled={populating}
              >
                {populating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Szinkronizálás
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
