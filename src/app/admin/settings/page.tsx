
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
  Users,
  Edit,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { VisualRulesEditor } from "@/components/admin/VisualRulesEditor";
import { cn } from "@/lib/utils";

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

  // Dialog states
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<keyof typeof emailTemplates | null>(null);
  const [tempTemplateValue, setTempTemplateValue] = useState("");
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);

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

  const openEmailDialog = (key: keyof typeof emailTemplates) => {
      setSelectedTemplateKey(key);
      setTempTemplateValue(emailTemplates[key]);
      setEmailDialogOpen(true);
  };

  const saveEmailTemplate = () => {
      if (selectedTemplateKey) {
          setEmailTemplates(prev => ({ ...prev, [selectedTemplateKey]: tempTemplateValue }));
          toast.success("Sablon frissítve (Ne felejtsen el menteni!)");
          setEmailDialogOpen(false);
      }
  };

  const getTemplateLabel = (key: string) => {
      switch(key) {
          case 'applicationReceived': return 'Jelentkezés Beérkezett';
          case 'applicationApproved': return 'Jóváhagyási Értesítő';
          case 'applicationRejected': return 'Elutasítási Értesítő';
          default: return key;
      }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Beállítások" 
        description="Portál és automatizációs beállítások kezelése."
        icon={Settings}
      >
        <Button onClick={saveSettings} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Változások Mentése
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Email Templates Section */}
        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Sablonok
            </CardTitle>
            <CardDescription>
              A rendszer által küldött automatikus email üzenetek szerkesztése.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
             {Object.keys(emailTemplates).map((key) => {
                 const k = key as keyof typeof emailTemplates;
                 return (
                    <div key={k} className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors group">
                        <div className="space-y-1">
                            <p className="font-medium">{getTemplateLabel(k)}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">{emailTemplates[k]}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openEmailDialog(k)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit className="h-4 w-4 mr-2" />
                            Szerkesztés
                        </Button>
                    </div>
                 )
             })}
          </CardContent>
        </Card>

        {/* Administrative Actions */}
        <div className="space-y-6">
            {/* Rules Editor */}
            <Card className="glass-card border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-warning" />
                    OAC Szabályzat
                    </CardTitle>
                    <CardDescription>
                    A szabályzat JSON formátumú szerkesztése.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="secondary" className="w-full" onClick={() => setRulesDialogOpen(true)}>
                        <FileCode className="h-4 w-4 mr-2" />
                        Szabályzat Szerkesztése
                    </Button>
                </CardContent>
            </Card>

            {/* Sync Tool */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    Adatbázis Eszközök
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 rounded-xl bg-muted/20 space-y-4">
                         <div className="flex items-start gap-3">
                             <AlertCircle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                             <div className="text-sm text-muted-foreground">
                                 <p className="font-medium text-foreground mb-1">Jelentkezők Szinkronizálása</p>
                                 Hiányzó nevek és emailek lekérése.
                             </div>
                         </div>
                         <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full gap-2"
                            onClick={handlePopulateApplicants}
                            disabled={populating}
                        >
                            {populating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            Szinkronizálás Indítása
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                  <DialogTitle>Email Sablon Szerkesztése</DialogTitle>
                  <DialogDescription>
                      {selectedTemplateKey && getTemplateLabel(selectedTemplateKey)}
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                  <Label className="mb-2 block">Üzenet szövege</Label>
                  <textarea 
                      className="w-full min-h-[150px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={tempTemplateValue}
                      onChange={(e) => setTempTemplateValue(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                      Használhat egyszerű szöveget. A HTML nem támogatott.
                  </p>
              </div>
              <DialogFooter>
                  <Button variant="ghost" onClick={() => setEmailDialogOpen(false)}>Mégse</Button>
                  <Button onClick={saveEmailTemplate}>Frissítés</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <Dialog open={rulesDialogOpen} onOpenChange={setRulesDialogOpen}>
           <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col">
              <DialogHeader>
                  <DialogTitle>OAC Szabályzat Szerkesztő</DialogTitle>
                  <DialogDescription>
                      A változtatások érvényesítéséhez kattintson a mentés gombra a főoldalon a bezárás után.
                  </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto min-h-0 border rounded-lg bg-background/50 p-4">
                {rulesLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : rules ? (
                    <VisualRulesEditor 
                        initialRules={rules}
                        onChange={(updatedRules) => setRules(updatedRules)}
                    />
                ) : (
                    <div className="flex justify-center items-center h-full text-muted-foreground">
                        Hiba a szabályok betöltésekor
                    </div>
                )}
              </div>
              <DialogFooter>
                  <Button onClick={() => setRulesDialogOpen(false)}>Kész</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
