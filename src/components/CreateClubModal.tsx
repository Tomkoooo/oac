"use client";

import { useState } from "react";
import { Building2, X, Loader2, Info } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
              <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Új Klub Létrehozása</CardTitle>
                    <CardDescription>
                      Hozz létre egy új klubot a tDarts platformon
                    </CardDescription>
                  </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                  <X className="h-5 w-5" />
                  <span className="sr-only">Bezárás</span>
              </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto pr-6">
             <form id="create-club-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Required Fields */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Kötelező adatok
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Klub Neve *</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="pl. Budapest Darts Club"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Leírás *</Label>
                    <textarea // Falling back to native textarea with Shadcn classes as Textarea component might not exist
                      id="description"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Rövid leírás a klubról..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Város/Helyszín *</Label>
                    <Input
                      id="location"
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="pl. Budapest"
                    />
                  </div>
                </div>

                <Separator />

                {/* Optional Fields */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Opcionális adatok
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="address">Cím</Label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="pl. 1051 Budapest, Minta utca 1."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="info@klub.hu"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+36 30 123 4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Weboldal</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://www.klub.hu"
                    />
                  </div>
                </div>
             </form>
          </CardContent>

          <CardFooter className="flex-col gap-4 pt-4 border-t border-border mt-auto">
             <div className="flex gap-3 w-full">
                <Button 
                   type="submit" 
                   form="create-club-form" 
                   className="flex-1" 
                   disabled={loading}
                >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Létrehozás...
                      </>
                    ) : (
                      <>
                        <Building2 className="h-4 w-4 mr-2" />
                        Klub Létrehozása
                      </>
                    )}
                </Button>
                <Button variant="outline" onClick={onClose} disabled={loading}>
                    Mégse
                </Button>
             </div>
             
             <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg w-full">
                <p>💡 <strong>Tipp:</strong> A klub létrehozása után automatikusan te leszel a klub adminisztrátora. 
                Ezután azonnal jelentkezhetsz az OAC Nemzeti Ligába.</p>
             </div>
          </CardFooter>
      </Card>
    </div>
  );
}
