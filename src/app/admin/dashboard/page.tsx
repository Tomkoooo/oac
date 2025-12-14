"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  LogOut, 
  Loader2,
  Shield,
  Users,
  Eye,
  EyeOff,
  Plus
} from "lucide-react";
import { toast } from "react-hot-toast";

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

interface AdminUser {
  _id: string;
  email: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'users' | 'stats' | 'mailer' | 'suspicious' | 'settings' | 'manual'>('applications');
  
  // Stats & Mailer State
  const [stats, setStats] = useState<any>(null);
  const [mailerData, setMailerData] = useState({ to: '', subject: '', message: '' });
  const [sendingEmail, setSendingEmail] = useState(false);

  const [removalModal, setRemovalModal] = useState<{
    open: boolean;
    applicationId: string | null;
    clubId: string | null;
    clubName: string | null;
  }>({ open: false, applicationId: null, clubId: null, clubName: null });
  const [removalType, setRemovalType] = useState<'delete_league' | 'terminate_league'>('delete_league');
  
  // New admin form
  const [showNewAdmin, setShowNewAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [populating, setPopulating] = useState(false);

  // Email Templates
  const [emailTemplates, setEmailTemplates] = useState({
    applicationReceived: 'Köszönjük az OAC jelentkezését! Hamarosan feldolgozzuk és értesítjük a döntésről.',
    applicationApproved: 'Gratulálunk! Az OAC jelentkezése jóváhagyva. A ligája aktiválva lett.',
    applicationRejected: 'Sajnálattal értesítjük, hogy az OAC jelentkezését elutasítottuk.'
  });

  // Quick Email Modal
  const [quickEmailModal, setQuickEmailModal] = useState<{
    open: boolean;
    to: string;
    clubName: string;
    subject: string;
  }>({ open: false, to: '', clubName: '', subject: '' });
  const [quickEmailMessage, setQuickEmailMessage] = useState('');
  const [sendingQuickEmail, setSendingQuickEmail] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/applications'),
        fetch('/api/admin/users'),
        fetch('/api/admin/stats')
      ]);

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.applications || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setAdminUsers(usersData.users || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!mailerData.to || !mailerData.subject) {
      toast.error('Kérlek töltsd ki a címzettet és a tárgyat!');
      return;
    }
    
    setSendingEmail(true);
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
      setSendingEmail(false);
    }
  };

  const exportStats = () => {
    if (!stats || !stats.playerStats) return;
    
    const dataStr = JSON.stringify(stats.playerStats, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `oac_player_stats_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickEmail = (email: string, clubName: string) => {
    setQuickEmailModal({ 
      open: true, 
      to: email, 
      clubName,
      subject: `OAC - ${clubName}` 
    });
    setQuickEmailMessage('');
  };

  const sendQuickEmail = async () => {
    if (!quickEmailModal.to) return;
    
    setSendingQuickEmail(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: quickEmailModal.to,
          subject: quickEmailModal.subject,
          message: quickEmailMessage,
          isHtml: true
        }),
      });

      if (!response.ok) throw new Error('Küldés sikertelen');
      
      toast.success(`Email elküldve: ${quickEmailModal.clubName}`);
      setQuickEmailModal({ open: false, to: '', clubName: '', subject: '' });
    } catch {
      toast.error('Hiba történt az email küldésekor');
    } finally {
      setSendingQuickEmail(false);
    }
  };

  const saveEmailTemplates = () => {
    localStorage.setItem('oac_email_templates', JSON.stringify(emailTemplates));
    toast.success('Email sablonok mentve!');
  };

  // Load templates from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('oac_email_templates');
    if (saved) {
      try {
        setEmailTemplates(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  // Protect the page - redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center space-y-4">
          <Loader2 className="h-12 w-12 text-warning animate-spin mx-auto" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render page content if not authenticated
  if (!session) {
    return null;
  }

  const handleApprove = async (applicationId: string, clubId: string) => {
    if (!confirm('Biztos, hogy jóváhagyod ezt a jelentkezést? Ez létrehozza az OAC ligát a klubnak.')) {
      return;
    }

    setProcessing(applicationId);
    try {
      const response = await fetch('/api/admin/applications/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, clubId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Jóváhagyás sikertelen');
      }

      toast.success('Jelentkezés jóváhagyva! OAC liga létrehozva.');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Hiba történt a jóváhagyás során');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    const notes = prompt('Add meg az elutasítás okát (opcionális):');
    
    setProcessing(applicationId);
    try {
      const response = await fetch('/api/admin/applications/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, notes }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Elutasítás sikertelen');
      }

      toast.success('Jelentkezés elutasítva.');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Hiba történt az elutasítás során');
    } finally {
      setProcessing(null);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { ' Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Admin létrehozása sikertelen');
      }

      toast.success('Új admin felhasználó létrehozva!');
      setShowNewAdmin(false);
      setNewAdminEmail('');
      setNewAdminPassword('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Hiba történt');
    }
  };

  const handleDeleteAdmin = async (userId: string, email: string) => {
    if (!confirm(`Biztos, hogy törlöd ezt az admin felhasználót: ${email}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Törlés sikertelen');
      }

      toast.success('Admin felhasználó törölve.');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Hiba történt a törlés során');
    }
  };

  const handleUnverify = (applicationId: string, clubId: string, clubName: string) => {
    setRemovalModal({ 
      open: true, 
      applicationId, 
      clubId, 
      clubName 
    });
    setRemovalType('delete_league'); // Reset to default
  };

  const handleExecuteRemoval = async () => {
    if (!removalModal.applicationId || !removalModal.clubId) return;

    setProcessing(removalModal.applicationId);
    setRemovalModal({ open: false, applicationId: null, clubId: null, clubName: null });
    
    try {
      const response = await fetch('/api/admin/applications/unverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          applicationId: removalModal.applicationId, 
          clubId: removalModal.clubId,
          removalType 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Státusz eltávolítása sikertelen');
      }

      toast.success(removalType === 'delete_league' 
        ? 'OAC státusz és liga sikeresen törölve!' 
        : 'OAC státusz eltávolítva, liga lezárva!');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Hiba történt az eltávolítás során');
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveRemoval = async (applicationId: string, clubId: string) => {
    // Use the modal for approval too
    await handleUnverify(applicationId, clubId, '');
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/admin');
  };

  const handlePopulateApplicants = async () => {
    if (!confirm('Ez frissíti az összes hiányzó jelentkező adatot a tDarts adatbázisából. Folytatod?')) {
      return;
    }

    setPopulating(true);
    try {
      const response = await fetch('/api/admin/populate-applicants', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Frissítés sikertelen');
      }

      const data = await response.json();
      toast.success(`${data.updated} jelentkezés frissítve!`);
      fetchData(); // Refresh the data
    } catch (error: any) {
      toast.error(error.message || 'Hiba történt');
    } finally {
      setPopulating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-success/20 text-success border-success/50',
      rejected: 'bg-error/20 text-error border-error/50',
      submitted: 'bg-warning/20 text-warning border-warning/50',
      removal_requested: 'bg-orange-500/20 text-orange-500 border-orange-500/50'
    };
    const labels = {
      approved: 'Elfogadva',
      rejected: 'Elutasítva',
      submitted: 'Függőben',
      removal_requested: 'Eltávolítás kérve'
    };

    const statusKey = status as keyof typeof styles;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[statusKey]}`}>
        {status === 'approved' && <CheckCircle2 className="h-4 w-4" />}
        {status === 'rejected' && <XCircle className="h-4 w-4" />}
        {status === 'submitted' && <Clock className="h-4 w-4" />}
        {labels[statusKey]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center space-y-4">
          <Loader2 className="h-12 w-12 text-warning animate-spin mx-auto" />
          <p className="text-muted-foreground">Adatok betöltése...</p>
        </div>
      </div>
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'submitted');
  const removalRequests = applications.filter(app => app.status === 'removal_requested');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const processedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20 border-2 border-warning/50">
                <Shield className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  <span className="text-warning">Admin</span> Vezérlőpult
                </h1>
                <p className="text-muted-foreground">OAC Nemzeti Liga kezelés</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePopulateApplicants}
                disabled={populating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                title="Frissíti a hiányzó jelentkező neveket és email címeket a tDarts-ból"
              >
                {populating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Users className="h-5 w-5" />
                )}
                Jelentkezők frissítése
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border hover:border-error hover:bg-error/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Kijelentkezés
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'applications' ? 'bg-warning text-warning-foreground shadow-lg' : 'glass-card hover:bg-card/60'
            }`}
          >
            <div className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Jelentkezések ({pendingApplications.length})</div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'users' ? 'bg-warning text-warning-foreground shadow-lg' : 'glass-card hover:bg-card/60'
            }`}
          >
            <div className="flex items-center gap-2"><Users className="h-5 w-5" /> Admin Felhasználók ({adminUsers.length})</div>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'stats' ? 'bg-warning text-warning-foreground shadow-lg' : 'glass-card hover:bg-card/60'
            }`}
          >
            <div className="flex items-center gap-2"><IconDownload className="h-5 w-5" /> Statisztikák</div>
          </button>
          <button
            onClick={() => setActiveTab('suspicious')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'suspicious' ? 'bg-warning text-warning-foreground shadow-lg' : 'glass-card hover:bg-card/60'
            }`}
          >
            <div className="flex items-center gap-2"><IconAlertTriangle className="h-5 w-5" /> Gyanús Tevékenység</div>
          </button>
          <button
            onClick={() => setActiveTab('mailer')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'mailer' ? 'bg-warning text-warning-foreground shadow-lg' : 'glass-card hover:bg-card/60'
            }`}
          >
            <div className="flex items-center gap-2"><IconMail className="h-5 w-5" /> Email Küldés</div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'settings' ? 'bg-warning text-warning-foreground shadow-lg' : 'glass-card hover:bg-card/60'
            }`}
          >
            <div className="flex items-center gap-2"><IconSettings className="h-5 w-5" /> Beállítások</div>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'manual' ? 'bg-warning text-warning-foreground shadow-lg' : 'glass-card hover:bg-card/60'
            }`}
          >
            <div className="flex items-center gap-2"><IconBook className="h-5 w-5" /> Útmutató</div>
          </button>
        </div>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Pending Applications */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-6 w-6 text-warning" />
                Jóváhagyásra váró jelentkezések
              </h2>
              {pendingApplications.length > 0 ? (
                <div className="grid gap-4">
                  {pendingApplications.map((app) => (
                    <div key={app._id} className="glass-card p-6 hover:scale-[1.01] transition-transform">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Building2 className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold">{app.clubName}</h3>
                            {getStatusBadge(app.status)}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Klub: <span className="font-semibold text-foreground">{app.clubName}</span></p>
                            {app.applicantName && <p>Jelentkező: <span className="font-semibold">{app.applicantName}</span></p>}
                            {app.applicantEmail && <p>Email: <span className="font-mono text-xs">{app.applicantEmail}</span></p>}
                            {!app.applicantName && <p>Jelentkező ID: <span className="font-mono">{app.applicantUserId}</span></p>}
                            <p>Beküldve: {new Date(app.submittedAt).toLocaleString('hu-HU')}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(app._id, app.clubId)}
                            disabled={processing === app._id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success text-success-foreground hover:bg-success/90 transition-colors disabled:opacity-50"
                          >
                            {processing === app._id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-5 w-5" />
                            )}
                            Jóváhagy
                          </button>
                          <button
                            onClick={() => handleReject(app._id)}
                            disabled={processing === app._id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-error text-error-foreground hover:bg-error/90 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="h-5 w-5" />
                            Elutasít
                          </button>
                          {app.applicantEmail && (
                            <button
                              onClick={() => handleQuickEmail(app.applicantEmail!, app.clubName)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-primary/50 hover:bg-primary/10 transition-colors"
                              title="Email küldése"
                            >
                              <IconMail className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <Clock className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nincs függőben lévő jelentkezés</p>
                </div>
              )}
            </div>

            {/* Removal Requests */}
            {removalRequests.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="h-6 w-6 text-orange-500" />
                  Eltávolítási kérelmek
                </h2>
                <div className="grid gap-4">
                  {removalRequests.map((app) => (
                    <div key={app._id} className="glass-card p-6 border-2 border-orange-500/30">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Building2 className="h-6 w-6 text-orange-500" />
                            <h3 className="text-xl font-semibold">{app.clubName}</h3>
                            {getStatusBadge(app.status)}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Klub: <span className="font-semibold text-foreground">{app.clubName}</span></p>
                            {app.applicantName && <p>Jelentkező: <span className="font-semibold">{app.applicantName}</span></p>}
                            {app.applicantEmail && <p>Email: <span className="font-mono text-xs">{app.applicantEmail}</span></p>}
                            {!app.applicantName && <p>Jelentkező ID: <span className="font-mono">{app.applicantUserId}</span></p>}
                            {app.notes && <p className="text-xs mt-2 italic">Indok: {app.notes}</p>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveRemoval(app._id, app.clubId)}
                            disabled={processing === app._id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success text-success-foreground hover:bg-success/90 transition-colors disabled:opacity-50"
                          >
                            {processing === app._id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-5 w-5" />
                            )}
                            Eltávolítás jóváhagyása
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Applications */}
            {approvedApplications.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  Jóváhagyott klubok
                </h2>
                <div className="grid gap-4">
                  {approvedApplications.map((app) => (
                    <div key={app._id} className="glass-card p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Building2 className="h-6 w-6 text-success" />
                            <h3 className="text-xl font-semibold">{app.clubName}</h3>
                            {getStatusBadge(app.status)}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Klub: <span className="font-semibold text-foreground">{app.clubName}</span></p>
                            {app.applicantName && <p>Jelentkező: <span className="font-semibold">{app.applicantName}</span></p>}
                            {app.applicantEmail && <p>Email: <span className="font-mono text-xs">{app.applicantEmail}</span></p>}
                            {!app.applicantName && <p>Jelentkező ID: <span className="font-mono">{app.applicantUserId}</span></p>}
                            <p>Jóváhagyva: {new Date(app.submittedAt).toLocaleDateString('hu-HU')}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUnverify(app._id, app.clubId, app.clubName)}
                            disabled={processing === app._id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-error text-error-foreground hover:bg-error/90 transition-colors disabled:opacity-50"
                          >
                            {processing === app._id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <XCircle className="h-5 w-5" />
                            )}
                            OAC státusz eltávolítása
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processed Applications */}
            {processedApplications.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Feldolgozott jelentkezések</h2>
                <div className="grid gap-4">
                  {processedApplications.map((app) => (
                    <div key={app._id} className="glass-card p-4 opacity-75">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{app.clubName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(app.submittedAt).toLocaleDateString('hu-HU')}
                          </p>
                          {app.notes && <p className="text-xs text-muted-foreground mt-1">{app.notes}</p>}
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Admin Felhasználók</h2>
              <button
                onClick={() => setShowNewAdmin(!showNewAdmin)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-warning text-warning-foreground hover:bg-warning/90 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Új Admin
              </button>
            </div>

            {showNewAdmin && (
              <form onSubmit={handleCreateAdmin} className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-semibold">Új Admin Felhasználó</h3>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full h-12 px-4 bg-background/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-warning"
                    placeholder="admin@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Jelszó</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full h-12 px-4 pr-12 bg-background/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-warning"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-success text-success-foreground hover:bg-success/90"
                  >
                    Létrehozás
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewAdmin(false)}
                    className="px-6 py-2 rounded-xl border-2 border-border hover:bg-card/60"
                  >
                    Mégse
                  </button>
                </div>
              </form>
            )}

            <div className="grid gap-4">
              {adminUsers.map((user) => (
                <div key={user._id} className="glass-card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-warning" />
                      <div>
                        <h3 className="font-semibold">{user.email}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </div>
                    {user.role !== 'superadmin' && (
                      <button
                        onClick={() => handleDeleteAdmin(user._id, user.email)}
                        className="px-4 py-2 rounded-xl border-2 border-error/50 text-error hover:bg-error/10 transition-colors"
                      >
                        Törlés
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mailer Tab */}
        {activeTab === 'mailer' && (
          <div className="glass-card p-6">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-500/20 rounded-full">
                   <IconMail className="h-6 w-6 text-red-500" />
                </div>
                <h2 className="text-2xl font-semibold">Email Küldés</h2>
             </div>
             
             <div className="space-y-4 max-w-2xl">
                <div>
                   <label className="block text-sm font-medium mb-1">Címzett (Email)</label>
                   <input 
                      type="email" 
                      value={mailerData.to}
                      onChange={(e) => setMailerData({...mailerData, to: e.target.value})}
                      className="w-full h-12 px-4 bg-background/50 border border-border rounded-xl"
                      placeholder="pelda@email.com"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Tárgy</label>
                   <input 
                      type="text" 
                      value={mailerData.subject}
                      onChange={(e) => setMailerData({...mailerData, subject: e.target.value})}
                      className="w-full h-12 px-4 bg-background/50 border border-border rounded-xl"
                      placeholder="Tárgy..."
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Üzenet</label>
                   <textarea 
                      value={mailerData.message}
                      onChange={(e) => setMailerData({...mailerData, message: e.target.value})}
                      className="w-full h-32 p-4 bg-background/50 border border-border rounded-xl"
                      placeholder="Írd ide az üzenetet..."
                   />
                   <p className="text-xs text-muted-foreground mt-1">Az email automatikusan a piros OAC stílusban kerül kiküldésre.</p>
                </div>
                <button 
                  onClick={handleSendEmail} 
                  disabled={sendingEmail || !mailerData.to || !mailerData.subject}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <IconSend className="h-4 w-4" />}
                  Küldés
                </button>
             </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
             {/* Global Stats */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-6 flex flex-col items-center">
                   <span className="text-4xl font-bold text-primary">{stats?.globalStats?.totalPlayers || 0}</span>
                   <span className="text-sm text-muted-foreground">OAC Játékos</span>
                </div>
                <div className="glass-card p-6 flex flex-col items-center">
                   <span className="text-4xl font-bold text-primary">{stats?.globalStats?.totalMatches || 0}</span>
                   <span className="text-sm text-muted-foreground">OAC Meccs</span>
                </div>
                <div className="glass-card p-6 flex flex-col items-center">
                   <span className="text-4xl font-bold text-primary">{stats?.globalStats?.totalTournaments || 0}</span>
                   <span className="text-sm text-muted-foreground">OAC Verseny</span>
                </div>
                <div className="glass-card p-6 flex flex-col items-center">
                   <span className="text-4xl font-bold text-primary">{stats?.globalStats?.totalLeagues || 0}</span>
                   <span className="text-sm text-muted-foreground">OAC Liga</span>
                </div>
             </div>

             {/* League Rankings - Expand/Collapse */}
             <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Liga Ranglisták (Csak OAC)
                   </h2>
                   <button 
                      onClick={exportStats}
                      className="px-4 py-2 border border-border rounded-xl hover:bg-card/50 flex items-center gap-2"
                   >
                      <IconDownload className="h-4 w-4" />
                      Export JSON
                   </button>
                </div>

                <div className="space-y-4">
                   {stats?.leagueRankings?.length > 0 ? (
                      stats.leagueRankings.map((league: any) => (
                         <LeagueRankingCard key={league.leagueId} league={league} />
                      ))
                   ) : (
                      <div className="text-center py-12 text-muted-foreground">
                         <p>Nincs OAC liga.</p>
                      </div>
                   )}
                </div>
             </div>

             {/* Player Match Stats Table */}
             <div className="glass-card p-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                   <Users className="h-5 w-5" />
                   Játékos Meccs Statisztikák (OAC)
                </h2>

                <div className="overflow-x-auto">
                   <table className="w-full text-sm">
                      <thead className="bg-muted/30">
                         <tr>
                            <th className="p-3 text-left">Név</th>
                            <th className="p-3 text-right">Meccsek</th>
                            <th className="p-3 text-right">Győzelmek</th>
                            <th className="p-3 text-right">Átlag</th>
                            <th className="p-3 text-right">180-ak</th>
                            <th className="p-3 text-right">Legnagyobb Kiszálló</th>
                         </tr>
                      </thead>
                      <tbody>
                         {stats?.playerMatchStats?.slice(0, 50).map((player: any) => (
                            <tr key={player.playerId} className="border-b border-border/50 hover:bg-muted/10">
                               <td className="p-3 font-medium">{player.name}</td>
                               <td className="p-3 text-right">{player.matchesPlayed}</td>
                               <td className="p-3 text-right">{player.matchesWon} ({player.winRate}%)</td>
                               <td className="p-3 text-right">{player.average}</td>
                               <td className="p-3 text-right">{player.total180s}</td>
                               <td className="p-3 text-right">{player.highestCheckout}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                   <p className="text-xs text-muted-foreground mt-4 text-center">Top 50 OAC játékos meccsek szerint</p>
                </div>
             </div>
          </div>
        )}

        {/* Suspicious Activity Tab */}
        {activeTab === 'suspicious' && (
          <div className="glass-card p-6">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-500/20 rounded-full animate-pulse-glow">
                   <IconAlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-red-500">Gyanús Tevékenységek</h2>
                   <p className="text-sm text-muted-foreground">Kézzel felülírt meccsek és eredmények</p>
                </div>
             </div>

             <div className="space-y-4">
                {stats?.suspiciousMatches?.length > 0 ? (
                   stats.suspiciousMatches.map((match: any) => (
                      <div key={match._id} className="border border-red-500/30 bg-red-500/5 rounded-xl p-4 flex items-center justify-between">
                         <div>
                            <div className="font-semibold text-red-400 mb-1">Kézi felülírás detektálva</div>
                            <p className="text-sm">
                               <span className="font-semibold">{match.player1?.name || 'Ismeretlen'}</span> vs <span className="font-semibold">{match.player2?.name || 'Ismeretlen'}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                               Verseny: {match.tournamentRef?.name || 'Ismeretlen'} | Dátum: {new Date(match.overrideTimestamp || match.updatedAt).toLocaleString('hu-HU')}
                            </p>
                            <p className="text-xs text-red-400 mt-1">
                               Győztes manuálisan beállítva: {match.winnerId?.name}
                            </p>
                         </div>
                         <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                               MANUAL OVERRIDE
                            </span>
                         </div>
                      </div>
                   ))
                ) : (
                   <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500/50" />
                      <p>Nincs gyanús tevékenység.</p>
                   </div>
                )}
             </div>
          </div>
        )}

        {/* Settings Tab - Email Templates */}
        {activeTab === 'settings' && (
          <div className="glass-card p-6">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/20 rounded-full">
                   <IconSettings className="h-6 w-6 text-primary" />
                </div>
                <div>
                   <h2 className="text-2xl font-bold">Beállítások</h2>
                   <p className="text-sm text-muted-foreground">Automatikus email sablonok szerkesztése</p>
                </div>
             </div>

             <div className="space-y-6 max-w-2xl">
                <div>
                   <label className="block text-sm font-semibold mb-2">Jelentkezés beérkezése email</label>
                   <p className="text-xs text-muted-foreground mb-2">Automatikusan kiküldésre kerül amikor új jelentkezés érkezik.</p>
                   <textarea 
                      value={emailTemplates.applicationReceived}
                      onChange={(e) => setEmailTemplates({...emailTemplates, applicationReceived: e.target.value})}
                      className="w-full h-24 p-4 bg-background/50 border border-border rounded-xl"
                   />
                </div>
                
                <div>
                   <label className="block text-sm font-semibold mb-2">Jóváhagyás email</label>
                   <p className="text-xs text-muted-foreground mb-2">Kiküldésre kerül amikor jóváhagyunk egy jelentkezést.</p>
                   <textarea 
                      value={emailTemplates.applicationApproved}
                      onChange={(e) => setEmailTemplates({...emailTemplates, applicationApproved: e.target.value})}
                      className="w-full h-24 p-4 bg-background/50 border border-border rounded-xl"
                   />
                </div>
                
                <div>
                   <label className="block text-sm font-semibold mb-2">Elutasítás email</label>
                   <p className="text-xs text-muted-foreground mb-2">Kiküldésre kerül amikor elutasítunk egy jelentkezést.</p>
                   <textarea 
                      value={emailTemplates.applicationRejected}
                      onChange={(e) => setEmailTemplates({...emailTemplates, applicationRejected: e.target.value})}
                      className="w-full h-24 p-4 bg-background/50 border border-border rounded-xl"
                   />
                </div>

                <button 
                  onClick={saveEmailTemplates}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Sablonok Mentése
                </button>
                <p className="text-xs text-muted-foreground">A sablonok a böngészőben tárolódnak.</p>
             </div>
          </div>
        )}

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <div className="glass-card p-6">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-full">
                   <IconBook className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                   <h2 className="text-2xl font-bold">Admin Útmutató</h2>
                   <p className="text-sm text-muted-foreground">OAC Admin Dashboard használati útmutató</p>
                </div>
             </div>

             <div className="prose prose-invert max-w-none space-y-8">
                <section>
                   <h3 className="text-xl font-semibold text-primary mb-3">📋 Jelentkezések Kezelése</h3>
                   <ul className="space-y-2 text-sm">
                      <li><strong>Jóváhagyás:</strong> A klub OAC státuszt kap, automatikusan létrejön a nemzeti liga.</li>
                      <li><strong>Elutasítás:</strong> A klub nem kap OAC státuszt. Megadható az ok.</li>
                      <li><strong>Email gomb:</strong> Közvetlenül küldhetsz emailt a jelentkezőnek.</li>
                      <li><strong>Eltávolítás kérés:</strong> Ha egy klub kéri az OAC státusz eltávolítását, itt jelenik meg.</li>
                   </ul>
                </section>

                <section>
                   <h3 className="text-xl font-semibold text-primary mb-3">📊 Statisztikák</h3>
                   <ul className="space-y-2 text-sm">
                      <li><strong>OAC-only adatok:</strong> Csak a hitelesített (verified) ligák adatai jelennek meg.</li>
                      <li><strong>Liga Ranglisták:</strong> Kattints egy ligára a részletes ranglista megtekintéséhez.</li>
                      <li><strong>Export:</strong> JSON formátumban exportálhatod az összes játékos statisztikát.</li>
                   </ul>
                </section>

                <section>
                   <h3 className="text-xl font-semibold text-primary mb-3">🚨 Gyanús Tevékenységek</h3>
                   <ul className="space-y-2 text-sm">
                      <li>Automatikusan megjelennek azok a meccsek, amelyeket <strong>manuálisan módosítottak</strong>.</li>
                      <li>Pl. ha egy admin utólag megváltoztatta egy meccs eredményét.</li>
                      <li>Segít a tisztességtelen játék felderítésében.</li>
                   </ul>
                </section>

                <section>
                   <h3 className="text-xl font-semibold text-primary mb-3">✉️ Email Küldés</h3>
                   <ul className="space-y-2 text-sm">
                      <li><strong>Manuális küldés:</strong> Az &quot;Email Küldés&quot; fülön bármelyik email címre küldhetsz üzenetet.</li>
                      <li><strong>Gyors email:</strong> A jelentkezések mellett található email gombbal közvetlenül a jelentkezőnek küldhetsz.</li>
                      <li>Az emailek automatikusan OAC stílusban (piros fejléc) kerülnek kiküldésre.</li>
                   </ul>
                </section>

                <section>
                   <h3 className="text-xl font-semibold text-primary mb-3">⚙️ Beállítások</h3>
                   <ul className="space-y-2 text-sm">
                      <li><strong>Email sablonok:</strong> Szerkesztheted az automatikus értesítő emailek szövegét.</li>
                      <li>A sablonok a böngészőben tárolódnak (localStorage).</li>
                   </ul>
                </section>

                <section className="border-t border-border pt-6">
                   <h3 className="text-xl font-semibold text-muted-foreground mb-3">🔗 További Információk</h3>
                   <p className="text-sm text-muted-foreground">
                      OAC ligák azonosítása: A <code className="bg-muted px-1 rounded">verified: true</code> mezővel rendelkező ligák tekintendők OAC ligának.
                      A ligához csatolt versenyek (<code className="bg-muted px-1 rounded">attachedTournaments</code>) az OAC versenyek.
                   </p>
                </section>
             </div>
          </div>
        )}
      </div>

      {/* Quick Email Modal */}
      {quickEmailModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass-card max-w-lg w-full mx-4 p-6 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <IconMail className="h-5 w-5 text-primary" />
              Email küldése
            </h3>
            <p className="text-sm text-muted-foreground">
              Címzett: <span className="font-semibold text-foreground">{quickEmailModal.to}</span>
            </p>
            
            <div>
               <label className="block text-sm font-medium mb-1">Tárgy</label>
               <input 
                  type="text" 
                  value={quickEmailModal.subject}
                  onChange={(e) => setQuickEmailModal({...quickEmailModal, subject: e.target.value})}
                  className="w-full h-10 px-4 bg-background/50 border border-border rounded-xl"
               />
            </div>
            
            <div>
               <label className="block text-sm font-medium mb-1">Üzenet</label>
               <textarea 
                  value={quickEmailMessage}
                  onChange={(e) => setQuickEmailMessage(e.target.value)}
                  className="w-full h-32 p-4 bg-background/50 border border-border rounded-xl"
                  placeholder="Írd ide az üzenetet..."
               />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setQuickEmailModal({ open: false, to: '', clubName: '', subject: '' })}
                className="flex-1 px-4 py-2 rounded-xl border-2 border-border hover:bg-muted transition-colors"
              >
                Mégse
              </button>
              <button
                onClick={sendQuickEmail}
                disabled={sendingQuickEmail || !quickEmailMessage}
                className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendingQuickEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <IconSend className="h-4 w-4" />}
                Küldés
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Removal Type Selection Modal */}
      {removalModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass-card max-w-md w-full mx-4 p-6 space-y-4">
            <h3 className="text-xl font-bold">OAC Státusz Eltávolítása</h3>
            <p className="text-sm text-muted-foreground">
              Klub: <span className="font-semibold">{removalModal.clubName}</span>
            </p>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="removalType"
                  value="delete_league"
                  checked={removalType === 'delete_league'}
                  onChange={(e) => setRemovalType(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold">Liga törlése</div>
                  <div className="text-xs text-muted-foreground">
                    A liga és az összes játékos pont véglegesen törlődik
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="removalType"
                  value="terminate_league"
                  checked={removalType === 'terminate_league'}
                  onChange={(e) => setRemovalType(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold">Liga lezárása</div>
                  <div className="text-xs text-muted-foreground">
                    A liga inaktív lesz, de a játékosok pontjai megmaradnak
                  </div>
                </div>
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setRemovalModal({ open: false, applicationId: null, clubId: null, clubName: null })}
                className="flex-1 px-4 py-2 rounded-xl border-2 border-border hover:bg-muted transition-colors"
              >
                Mégse
              </button>
              <button
                onClick={handleExecuteRemoval}
                className="flex-1 px-4 py-2 rounded-xl bg-error text-error-foreground hover:bg-error/90 transition-colors"
              >
                Eltávolítás
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// League Ranking Card with Expand/Collapse
function LeagueRankingCard({ league }: { league: any }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>
            <IconChevronRight className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{league.leagueName}</h3>
            <p className="text-xs text-muted-foreground">{league.clubName} • {league.clubCity}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{league.playerCount} játékos</span>
          <span>{league.tournamentCount} verseny</span>
        </div>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-background/50">
          {league.players?.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Játékos</th>
                  <th className="p-2 text-right">Pont</th>
                  <th className="p-2 text-right">Versenyek</th>
                </tr>
              </thead>
              <tbody>
                {league.players.slice(0, 20).map((player: any) => (
                  <tr key={player.playerId} className="border-b border-border/30 hover:bg-muted/10">
                    <td className="p-2 font-bold text-primary">{player.position}</td>
                    <td className="p-2">{player.name}</td>
                    <td className="p-2 text-right font-semibold">{player.totalPoints}</td>
                    <td className="p-2 text-right">{player.tournamentsPlayed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-4 text-muted-foreground">Nincs még játékos ebben a ligában.</p>
          )}
          {league.players?.length > 20 && (
            <p className="text-xs text-muted-foreground text-center mt-2">...és további {league.players.length - 20} játékos</p>
          )}
        </div>
      )}
    </div>
  );
}

function IconChevronRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  );
}

// Icons
function IconMail(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  );
}

function IconSend(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
    );
}

function IconDownload(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
    );
}

function IconAlertTriangle(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
    );
}

function IconSettings(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
    );
}

function IconBook(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
    );
}
