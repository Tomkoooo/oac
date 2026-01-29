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
  CircleHelp as HelpCircle,
  Receipt,
  FileText
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmailComposerModal } from "@/components/admin/EmailComposerModal";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  
  // Billing Info
  billingName?: string;
  billingZip?: string;
  billingCity?: string;
  billingAddress?: string;
  billingTaxNumber?: string;
  billingEmail?: string;
  paymentMethod?: 'stripe' | 'transfer';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentId?: string;
  invoiceSent?: boolean;
  invoiceNumber?: string;
  transferReference?: string;
}

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [emailModal, setEmailModal] = useState({ isOpen: false, email: "", clubName: "" });
  const [billingModal, setBillingModal] = useState<{ isOpen: boolean, app: Application | null }>({ isOpen: false, app: null });

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

  const handleAction = async (action: 'approve' | 'reject' | 'mark-invoiced' | 'unverify', app: Application, skipBilling = false, unverifyType?: 'delete_league' | 'terminate_league') => {
    let confirmMsg = '';
    let endpoint = `/api/admin/applications/${action}`;
    const body: any = { applicationId: app._id };

    if (action === 'approve') {
       body.clubId = app.clubId;
       body.skipBilling = skipBilling;
       
       if (app.paymentMethod === 'stripe') {
          // Stripe apps usually auto-invoiced, but if admin forces approve
          confirmMsg = `Biztosan jóváhagyod a(z) ${app.clubName} jelentkezését kézileg?`;
       } else {
          // Bank Transfer
          confirmMsg = skipBilling 
            ? `Biztosan jóváhagyod ${app.clubName} jelentkezését AUTOMATIKUS SZÁMLA NÉLKÜL? (Manuális számlázás szükséges)`
            : `Biztosan jóváhagyod ${app.clubName} jelentkezését és KIÁLLÍTOD az automatikus számlát?`;
       }
    } else if (action === 'reject') {
       body.clubId = app.clubId; // Reject logic needs clubId for rollback maybe?
       confirmMsg = `Biztosan elutasítod a(z) ${app.clubName} jelentkezését?`;
    } else if (action === 'generate-invoice' as any) {
        endpoint = `/api/admin/applications/generate-invoice`;
        confirmMsg = `Biztosan kiállítod a számlát a(z) ${app.clubName} részére? Ezzel egyidejűleg kiküldjük az értesítő emailt a PDF számlával.`;
    } else if (action === 'mark-invoiced') {
       body.invoiceNumber = prompt("Add meg a számlaszámot (opcionális):") || undefined;
       confirmMsg = `Biztosan megjelölöd, hogy a számla el lett küldve? A számlázási adatok TÖRLÉSRE kerülnek.`;
    } else if (action === 'unverify') {
       // This hits the unverify endpoint
       endpoint = `/api/admin/applications/unverify`;
       body.removalType = unverifyType;
       // confirmMsg is not strictly needed if we trust the button text, but good to have
       const typeText = unverifyType === 'delete_league' ? 'TÖRLÉSÉVEL' : 'LEZÁRÁSÁVAL';
       confirmMsg = `Biztosan elfogadod a törlési kérelmet a liga ${typeText}?`;
    }
    
    if (!confirm(confirmMsg)) return;

    setProcessing(app._id);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Művelet sikertelen");

      toast.success('Művelet sikeres!');
      fetchApplications();
      if (action === 'mark-invoiced' || action === 'generate-invoice' as any) {
        setBillingModal({ isOpen: false, app: null });
      }
    } catch (err: any) {
      toast.error(err.message || "Hiba történt");
    } finally {
      setProcessing(null);
    }
  };

  const filteredApps = applications.filter(app => 
    app.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.applicantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app?.transferReference?.includes(searchQuery)
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
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Jelentkezések"
        description="Kezeld a klubok OAC liga jelentkezéseit"
        icon={FileText}
        badge={{ count: pendingApps.length, label: "függőben", isWarning: true }}
      >
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Keresés klub vagy név alapján..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/40 backdrop-blur-sm border-border/40"
          />
        </div>
      </PageHeader>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-card/50 backdrop-blur-md border border-border/40 p-1">
          <TabsTrigger value="pending" className="gap-2 px-4 py-2 data-[state=active]:bg-warning data-[state=active]:text-warning-foreground">
            Függőben
            <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center rounded-full ml-1">
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
            onViewBilling={(app) => setBillingModal({ isOpen: true, app })}
          />
        </TabsContent>
        <TabsContent value="approved" className="mt-0">
          <ApplicationList 
            items={approvedApps} 
            onAction={handleAction} 
            processing={processing} 
            onContact={(email, name) => setEmailModal({ isOpen: true, email, clubName: name })}
            onViewBilling={(app) => setBillingModal({ isOpen: true, app })}
          />
        </TabsContent>
        <TabsContent value="removal" className="mt-0">
          <ApplicationList 
            items={removalRequestedApps} 
            onAction={handleAction} 
            processing={processing} 
            onContact={(email, name) => setEmailModal({ isOpen: true, email, clubName: name })}
            onViewBilling={(app) => setBillingModal({ isOpen: true, app })}
          />
        </TabsContent>
        <TabsContent value="rejected" className="mt-0">
          <ApplicationList 
            items={rejectedApps} 
            onAction={handleAction} 
            processing={processing} 
            onContact={(email, name) => setEmailModal({ isOpen: true, email, clubName: name })}
            onViewBilling={(app) => setBillingModal({ isOpen: true, app })}
          />
        </TabsContent>
      </Tabs>

      <EmailComposerModal 
        isOpen={emailModal.isOpen}
        onClose={() => setEmailModal({ ...emailModal, isOpen: false })}
        defaultEmail={emailModal.email}
        defaultSubject={`OAC Jelentkezés - ${emailModal.clubName}`}
      />

      {/* Billing Info Modal */}
      {billingModal.isOpen && billingModal.app && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <Card className="max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                     <CardTitle>Számlázási Adatok</CardTitle>
                     <Button variant="ghost" size="icon" onClick={() => setBillingModal({ ...billingModal, isOpen: false })}>
                        <X className="h-4 w-4" />
                     </Button>
                 </CardHeader>
                 <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                              <p className="text-muted-foreground font-medium">Fizetési Mód</p>
                              <Badge variant="outline" className="mt-1">
                                 {billingModal.app.paymentMethod === 'stripe' ? 'Bankkártya (Stripe)' : 'Átutalás'}
                              </Badge>
                          </div>
                          <div>
                              <p className="text-muted-foreground font-medium">Státusz</p>
                              <div className="flex gap-2 flex-wrap">
                                 <Badge variant={billingModal.app.paymentStatus === 'paid' ? 'default' : 'secondary'} className="mt-1 bg-success/20 text-success border-success/20">
                                     {billingModal.app.paymentStatus === 'paid' ? 'Fizetve' : 'Függőben'}
                                 </Badge>
                                 {billingModal.app.invoiceSent && (
                                      <Badge variant="outline" className="mt-1 border-primary/50 text-primary">
                                         Számla Küldve {billingModal.app.invoiceNumber ? `(${billingModal.app.invoiceNumber})` : ''}
                                      </Badge>
                                 )}
                              </div>
                          </div>
                     </div>
                     <Separator />
                     {billingModal.app.billingName ? (
                          <div className="space-y-3 text-sm">
                              <div>
                                  <p className="text-muted-foreground font-medium text-xs uppercase">Név</p>
                                  <p className="font-semibold">{billingModal.app.billingName}</p>
                              </div>
                              <div>
                                  <p className="text-muted-foreground font-medium text-xs uppercase">Cím</p>
                                  <p>{billingModal.app.billingZip} {billingModal.app.billingCity}, {billingModal.app.billingAddress}</p>
                              </div>
                              <div>
                                  <p className="text-muted-foreground font-medium text-xs uppercase">Adószám</p>
                                  <p className="font-mono">{billingModal.app.billingTaxNumber || '-'}</p>
                              </div>
                              <div>
                                  <p className="text-muted-foreground font-medium text-xs uppercase">Email</p>
                                  <p>{billingModal.app.billingEmail || '-'}</p>
                              </div>
                          </div>
                      ) : (
                          <div className="py-4 text-center text-muted-foreground bg-muted/20 rounded-lg">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>A számlázási adatok törlésre kerültek.</p>
                              <div className="text-xs mt-1">(Adatvédelmi okokból, számlakiállítás után a rendszer törli az adatokat)</div>
                          </div>
                      )}
                 </CardContent>
                 {(billingModal.app.status === 'approved' || billingModal.app.status === 'submitted') && !billingModal.app.invoiceSent && billingModal.app.billingName && (
                      <CardFooter className="pt-2 border-t bg-muted/10 block">
                          <div className="w-full space-y-2">
                             <p className="text-xs text-muted-foreground mb-2">Számla kezelése (ha automatikusan nem sikerült):</p>
                             <div className="grid grid-cols-1 gap-2">
                                <Button 
                                    className="w-full gap-2 bg-success hover:bg-success/90"
                                    onClick={() => handleAction('generate-invoice' as any, billingModal.app!)}
                                    disabled={!!processing}
                                >
                                    <Receipt className="h-4 w-4" />
                                    Hivatalos Számla Kiállítása
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    className="w-full gap-2"
                                    onClick={() => handleAction('mark-invoiced', billingModal.app!)}
                                    disabled={!!processing}
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Manuálisan számláztam, adatok törlése
                                </Button>
                             </div>
                          </div>
                      </CardFooter>
                  )}
                  {billingModal.app.invoiceNumber && (
                    <CardFooter className="pt-2 border-t bg-primary/5 block">
                         <div className="w-full">
                            <Button 
                                variant="outline" 
                                className="w-full gap-2 border-primary/50 text-primary hover:bg-primary/10"
                                onClick={() => window.open(`/api/applications/invoice?applicationId=${billingModal.app!._id}`, '_blank')}
                                disabled={!!processing}
                            >
                                <FileText className="h-4 w-4" />
                                Számla Letöltése ({billingModal.app.invoiceNumber})
                            </Button>
                         </div>
                    </CardFooter>
                  )}
             </Card>
        </div>
      )}
    </div>
  );
}

interface ApplicationListProps { 
  items: Application[], 
  onAction: (action: 'approve' | 'reject' | 'mark-invoiced' | 'unverify', app: Application, skipBilling?: boolean, unverifyType?: 'delete_league' | 'terminate_league') => void,
  processing: string | null,
  onContact: (email: string, name: string) => void,
  onViewBilling: (app: Application) => void
}

function ApplicationList({ items, onAction, processing, onContact, onViewBilling }: ApplicationListProps) {
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
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                   {app.clubName}
                   <Badge variant="outline" className="text-xs font-normal">
                      {app.paymentMethod === 'stripe' ? 'Bankkártya' : 'Átutalás'}
                   </Badge>
                   {app.invoiceSent && <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-transparent text-[10px]">Számlázva</Badge>}
                </CardTitle>
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
              {app.paymentMethod === 'transfer' && (
                <div className="space-y-1">
                   <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Számla</p>
                   <p className={`font-semibold ${app.invoiceSent ? 'text-success' : 'text-warning'}`}>{app.invoiceSent ? 'Küldve' : 'Nincs küldve'}</p>
                </div>
              )}
              {app.transferReference && (
                 <div className="space-y-1">
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Közlemény Kód</p>
                    <Badge variant="outline" className="font-mono text-lg tracking-widest border-primary/40 bg-primary/5 text-primary">
                        {app.transferReference}
                    </Badge>
                 </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {app.status === 'submitted' && (
                <>
                  <Button 
                      variant="outline" 
                      className="border-success/50 text-success hover:bg-success/10 hover:text-success gap-2 h-8"
                      onClick={() => onAction('approve', app, false)}
                      disabled={!!processing}
                      title="Jóváhagyás + Automatikus Számla"
                  >
                      {processing === app._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Jóváhagyás
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Műveletek</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewBilling(app)}>
                        <Receipt className="mr-2 h-4 w-4" /> Számlázási Adatok
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onContact(app.applicantEmail || "", app.clubName)}>
                        <Mail className="mr-2 h-4 w-4" /> Kapcsolatfelvétel
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onAction('approve', app, true)}>
                         <CheckCircle2 className="mr-2 h-4 w-4 text-warning" /> Manuális Számlázás
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onAction('reject', app)}
                        className="text-destructive focus:text-destructive"
                      >
                         <X className="mr-2 h-4 w-4" /> Elutasítás
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {app.status === 'removal_requested' && (
                 <>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onAction('unverify', app, false, 'delete_league')}
                      disabled={!!processing}
                    >
                      {processing === app._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      Törlés
                    </Button>
                     <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => onAction('unverify', app, false, 'terminate_league')}
                      disabled={!!processing}
                    >
                      Lezárás
                    </Button>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onContact(app.applicantEmail || "", app.clubName)}
                        title="Kapcsolatfelvétel"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                 </>
              )}

              {app.status !== 'submitted' && app.status !== 'removal_requested' && (
                 <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => onViewBilling(app)}
                      title="Számlázási Adatok"
                    >
                       <Receipt className="h-4 w-4" />
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-warning"
                      onClick={() => onContact(app.applicantEmail || "", app.clubName)}
                      title="Kapcsolatfelvétel"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                 </>
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
