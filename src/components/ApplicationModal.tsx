"use client";

import { useState } from "react";
import { Building2, CreditCard, Banknote, Loader2, Info, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ApplicationModalProps {
  clubId: string;
  clubName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplicationModal({ clubId, clubName, onClose, onSuccess }: ApplicationModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    billingName: '',
    billingZip: '',
    billingCity: '',
    billingAddress: '',
    billingTaxNumber: '',
    billingEmail: '',
    paymentMethod: 'stripe' as 'stripe' | 'transfer',
    consent: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      toast.error('Kérjük fogadd el az adatvédelmi nyilatkozatot!');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId,
          clubName,
          ...formData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Jelentkezés sikertelen');
      }

      if (formData.paymentMethod === 'stripe' && data.checkoutUrl) {
        // Redirect to Stripe
        window.location.href = data.checkoutUrl;
        return;
      }

      toast.success('Jelentkezés sikeresen beküldve!');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Hiba történt a jelentkezés során");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Jelentkezés a Ligába - {clubName}</CardTitle>
                <CardDescription>Add meg a számlázási adatokat</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form id="application-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase flex items-center gap-2">
                <Info className="h-4 w-4" />
                Számlázási Adatok
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingName">Számlázási Név *</Label>
                  <Input 
                    id="billingName" 
                    required 
                    value={formData.billingName}
                    onChange={(e) => setFormData({...formData, billingName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="billingTaxNumber">Adószám (Opcionális)</Label>
                   <Input 
                     id="billingTaxNumber" 
                     value={formData.billingTaxNumber}
                     onChange={(e) => setFormData({...formData, billingTaxNumber: e.target.value})}
                   />
                </div>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="billingZip">Irsz. *</Label>
                  <Input 
                    id="billingZip" 
                    required 
                    value={formData.billingZip}
                    onChange={(e) => setFormData({...formData, billingZip: e.target.value})}
                  />
                 </div>
                 <div className="space-y-2">
                  <Label htmlFor="billingCity">Város *</Label>
                  <Input 
                    id="billingCity" 
                    required 
                    value={formData.billingCity}
                    onChange={(e) => setFormData({...formData, billingCity: e.target.value})}
                  />
                 </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingAddress">Cím (Utca, Házszám) *</Label>
                <Input 
                  id="billingAddress" 
                  required 
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({...formData, billingAddress: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingEmail">Számlaküldő Email *</Label>
                <Input 
                   id="billingEmail" 
                   type="email" 
                   required 
                   value={formData.billingEmail}
                   onChange={(e) => setFormData({...formData, billingEmail: e.target.value})}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
               <h3 className="font-semibold text-sm text-muted-foreground uppercase flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Fizetési Mód
               </h3>
               
               <RadioGroup 
                 value={formData.paymentMethod} 
                 onValueChange={(val) => setFormData({...formData, paymentMethod: val as 'stripe' | 'transfer'})}
                 className="grid grid-cols-1 md:grid-cols-2 gap-4"
               >
                  <Label
                    htmlFor="stripe"
                    className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all ${formData.paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : ''}`}
                  >
                    <RadioGroupItem value="stripe" id="stripe" className="sr-only" />
                    <CreditCard className="mb-3 h-6 w-6" />
                    <div className="text-center">
                        <div className="font-semibold">Bankkártya (Stripe)</div>
                        <div className="text-xs text-muted-foreground mt-1">Azonnali jóváhagyás & automata számlázás</div>
                    </div>
                  </Label>
                  
                  <Label
                    htmlFor="transfer"
                    className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all ${formData.paymentMethod === 'transfer' ? 'border-primary bg-primary/5' : ''}`}
                  >
                    <RadioGroupItem value="transfer" id="transfer" className="sr-only" />
                    <Banknote className="mb-3 h-6 w-6" />
                    <div className="text-center">
                        <div className="font-semibold">Banki Átutalás</div>
                        <div className="text-xs text-muted-foreground mt-1">Admin jóváhagyás szükséges</div>
                    </div>
                  </Label>
               </RadioGroup>
            </div>

            <Separator />

            <div className="flex items-start space-x-2 bg-muted/30 p-4 rounded-lg">
              <Checkbox 
                id="consent" 
                checked={formData.consent}
                onCheckedChange={(checked) => setFormData({...formData, consent: checked as boolean})}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Adatok kezelésének elfogadása
                </Label>
                <p className="text-sm text-muted-foreground">
                  Elfogadom, hogy a megadott számlázási adatokat {formData.paymentMethod === 'stripe' ? 'kizárólag a díjbekérő kiállításához és a fizetés lebonyolításához' : 'a pályázat elbírálásához és a kapcsolatfelvételhez'} használják fel, és azokat nem tárolják marketing célokra.
                </p>
              </div>
            </div>

          </form>
        </CardContent>

        <CardFooter className="border-t pt-6 bg-muted/10">
           <div className="flex gap-3 w-full justify-end">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                 Mégse
              </Button>
              <Button type="submit" form="application-form" disabled={loading || !formData.consent}>
                 {loading ? (
                   <>
                     <Loader2 className="h-4 w-4 animate-spin mr-2" />
                     Feldolgozás...
                   </>
                 ) : (
                   <>
                     {formData.paymentMethod === 'stripe' ? 'Tovább a Fizetéshez' : 'Jelentkezés Beküldése'}
                   </>
                 )}
              </Button>
           </div>
        </CardFooter>
      </Card>
    </div>
  );
}
