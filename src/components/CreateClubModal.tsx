"use client";

import { useState } from "react";
import { Building2, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface CreateClubModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateClubModal({ onClose, onSuccess }: CreateClubModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    email: '',
    phone: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/user/create-club', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          address: formData.address || undefined,
          contact: {
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            website: formData.website || undefined,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || "Klub létrehozása sikertelen!")
        throw new Error(data.message || 'Klub létrehozása sikertelen');
      }

      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Klub létrehozása sikertelen!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Új Klub Létrehozása</h2>
                <p className="text-sm text-muted-foreground">
                  Hozz létre egy új klubot a tDarts platformon
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-card/60 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>



          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                Kötelező adatok
              </h3>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Klub Neve *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 px-4 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="pl. Budapest Darts Club"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Leírás *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-24 px-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Rövid leírás a klubról..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Város/Helyszín *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full h-12 px-4 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="pl. Budapest"
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                Opcionális adatok
              </h3>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Cím</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full h-12 px-4 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="pl. 1051 Budapest, Minta utca 1."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-12 px-4 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="info@klub.hu"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-12 px-4 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+36 30 123 4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Weboldal</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full h-12 px-4 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://www.klub.hu"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 px-6 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Létrehozás...
                  </>
                ) : (
                  <>
                    <Building2 className="h-5 w-5" />
                    Klub Létrehozása
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 h-12 rounded-xl font-semibold border-2 border-border hover:bg-card/60 transition-colors disabled:opacity-50"
              >
                Mégse
              </button>
            </div>
          </form>

          <div className="text-xs text-muted-foreground bg-muted/20 p-4 rounded-lg">
            <p>💡 <strong>Tipp:</strong> A klub létrehozása után automatikusan te leszel a klub adminisztrátora. 
            Ezután azonnal jelentkezhetsz az OAC Nemzeti Ligába.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
