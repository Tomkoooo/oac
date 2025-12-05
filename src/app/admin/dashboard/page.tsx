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
  const [activeTab, setActiveTab] = useState<'applications' | 'users'>('applications');
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
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [populating, setPopulating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, usersRes] = await Promise.all([
        fetch('/api/admin/applications'),
        fetch('/api/admin/users')
      ]);

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.applications || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setAdminUsers(usersData.users || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'applications'
                ? 'bg-warning text-warning-foreground shadow-lg'
                : 'glass-card hover:bg-card/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Jelentkezések ({pendingApplications.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-warning text-warning-foreground shadow-lg'
                : 'glass-card hover:bg-card/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Admin Felhasználók ({adminUsers.length})
            </div>
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
      </div>

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
