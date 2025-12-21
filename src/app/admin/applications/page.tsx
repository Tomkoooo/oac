"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Building2, 
  CircleCheck as CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  Mail,
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  AlertCircle,
  CircleHelp as HelpCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailComposerModal } from "@/components/admin/EmailComposerModal";

interface Application {
  _id: string;
  clubId: string;
  clubName: string;
  applicantUserId: string;
  applicantName?: string;
  applicantEmail?: string;
  status: 'submitted' | 'approved' | 'rejected' | 'removal_requested';
  submittedAt: string;
  notes?: string;
}

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [emailModal, setEmailModal] = useState({ isOpen: false, email: "", clubName: "" });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error("Nem sikerült betölteni a jelentkezéseket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (action: 'approve' | 'reject', app: Application) => {
    const confirmMsg = action === 'approve' 
      ? `Biztosan jóváhagyod a(z) ${app.clubName} jelentkezését?`
      : `Biztosan elutasítod a(z) ${app.clubName} jelentkezését?`;
    
    if (!confirm(confirmMsg)) return;

    setProcessing(app._id);
    try {
      const response = await fetch(`/api/admin/applications/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app._id, clubId: app.clubId }),
      });

      if (!response.ok) throw new Error("Művelet sikertelen");

      toast.success(action === 'approve' ? 'Jóváhagyva!' : 'Elutasítva');
      fetchApplications();
    } catch (err: any) {
      toast.error(err.message || "Hiba történt");
    } finally {
      setProcessing(null);
    }
  };

  const filteredApps = applications.filter(app => 
    app.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.applicantName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingApps = filteredApps.filter(app => app.status === 'submitted');
  const approvedApps = filteredApps.filter(app => app.status === 'approved');
  const removalRequestedApps = filteredApps.filter(app => app.status === 'removal_requested');
  const rejectedApps = filteredApps.filter(app => app.status === 'rejected');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-warning" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jelentkezések</h1>
          <p className="text-muted-foreground">Kezeld a klubok OAC liga jelentkezéseit</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Keresés klub vagy név alapján..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/40 backdrop-blur-sm border-border/40"
          />
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-card/50 backdrop-blur-md border border-border/40 p-1">
          <TabsTrigger value="pending" className="gap-2 px-4 py-2 data-[state=active]:bg-warning data-[state=active]:text-warning-foreground">
            Függőben
            <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
              {pendingApps.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2 px-4 py-2 data-[state=active]:bg-success data-[state=active]:text-success-foreground">
            Elfogadva
          </TabsTrigger>
          <TabsTrigger value="removal" className="gap-2 px-4 py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Eltávolítás kért
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2 px-4 py-2">
            Elutasítva
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0">
          <ApplicationList 
            items={pendingApps} 
            onAction={handleAction} 
            processing={processing} 
            onContact={(email, name) => setEmailModal({ isOpen: true, email, clubName: name })}
          />
        </TabsContent>
        <TabsContent value="approved" className="mt-0">
          <ApplicationList 
            items={approvedApps} 
            onAction={handleAction} 
            processing={processing} 
            onContact={(email, name) => setEmailModal({ isOpen: true, email, clubName: name })}
          />
        </TabsContent>
        <TabsContent value="removal" className="mt-0">
          <ApplicationList 
            items={removalRequestedApps} 
            onAction={handleAction} 
            processing={processing} 
            onContact={(email, name) => setEmailModal({ isOpen: true, email, clubName: name })}
          />
        </TabsContent>
        <TabsContent value="rejected" className="mt-0">
          <ApplicationList 
            items={rejectedApps} 
            onAction={handleAction} 
            processing={processing} 
            onContact={(email, name) => setEmailModal({ isOpen: true, email, clubName: name })}
          />
        </TabsContent>
      </Tabs>

      <EmailComposerModal 
        isOpen={emailModal.isOpen}
        onClose={() => setEmailModal({ ...emailModal, isOpen: false })}
        defaultEmail={emailModal.email}
        defaultSubject={`OAC Jelentkezés - ${emailModal.clubName}`}
      />
    </div>
  );
}

function ApplicationList({ items, onAction, processing, onContact }: { 
  items: Application[], 
  onAction: (action: 'approve' | 'reject', app: Application) => void,
  processing: string | null,
  onContact: (email: string, name: string) => void
}) {
  if (items.length === 0) {
    return (
      <Card className="border-dashed bg-card/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">Nincs megjeleníthető jelentkezés ebben a kategóriában.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((app) => (
        <Card key={app._id} className="overflow-hidden border-border/40 bg-card/40 backdrop-blur-md hover:shadow-lg hover:shadow-black/20 transition-all group">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">{app.clubName}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3" />
                  {new Date(app.submittedAt).toLocaleDateString('hu-HU')} {new Date(app.submittedAt).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Jelentkező</p>
                <p className="font-semibold">{app.applicantName || "Nincs megadva"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Kapcsolat</p>
                <p className="font-mono text-xs">{app.applicantEmail || "Nincs email"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-warning"
                onClick={() => onContact(app.applicantEmail || "", app.clubName)}
                title="Kapcsolatfelvétel"
              >
                <Mail className="h-4 w-4" />
              </Button>
              
              {app.status === 'submitted' && (
                <>
                  <Button 
                    variant="outline" 
                    className="border-success/50 text-success hover:bg-success/10 hover:text-success gap-2"
                    onClick={() => onAction('approve', app)}
                    disabled={!!processing}
                  >
                    {processing === app._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Jóváhagyás
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                    onClick={() => onAction('reject', app)}
                    disabled={!!processing}
                  >
                    <X className="h-4 w-4" />
                    Elutasítás
                  </Button>
                </>
              )}
              {app.status === 'approved' && (
                <Badge className="bg-success/20 text-success border-success/50 hover:bg-success/30">
                  Aktív Liga
                </Badge>
              )}
              {app.status === 'removal_requested' && (
                <Button 
                  variant="destructive" 
                  className="gap-2"
                  onClick={() => onAction('reject', app)} // Simplified for now
                  disabled={!!processing}
                >
                  <AlertCircle className="h-4 w-4" />
                  Státusz Megszüntetése
                </Button>
              )}
            </div>
          </div>
          
          {app.notes && (
            <div className="px-6 py-3 bg-muted/30 border-t border-border/40 text-sm text-muted-foreground">
              <span className="font-bold mr-2 uppercase text-[10px]">Megjegyzés:</span>
              {app.notes}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
