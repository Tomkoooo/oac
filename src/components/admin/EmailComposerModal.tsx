"use client";

import { useState } from "react";
import { 
  Send, 
  Loader2, 
  X,
  Mail
} from "lucide-react";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientQuill } from "@/components/admin/ClientQuill";


interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultSubject?: string;
}

export function EmailComposerModal({ 
  isOpen, 
  onClose, 
  defaultEmail = "", 
  defaultSubject = "OAC Liga Értesítés" 
}: EmailComposerModalProps) {
  const [data, setData] = useState({ 
    to: defaultEmail, 
    subject: defaultSubject, 
    message: "" 
  });
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.to || !data.subject || !data.message) {
      toast.error('Kérlek töltsd ki az összes mezőt!');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.to,
          subject: data.subject,
          message: data.message,
          isHtml: true 
        }),
      });

      if (!response.ok) throw new Error('Küldés sikertelen');
      
      toast.success('Email elküldve!');
      onClose();
      setData({ to: defaultEmail, subject: defaultSubject, message: "" });
    } catch {
      toast.error('Hiba történt az email küldésekor');
    } finally {
      setSending(false);
    }
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{'list': 'bullet'}],
      ['link'],
      ['clean']
    ],
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-xl border-border/40 p-0 overflow-hidden shadow-2xl">
        <form onSubmit={handleSend}>
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Mail className="h-5 w-5 text-warning" />
              Gyors Email Küldése
            </DialogTitle>
            <DialogDescription>
              Közvetlen üzenet küldése a klub képviselőjének.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-to" className="text-[10px] font-bold uppercase tracking-wider opacity-60">Címzett</Label>
                <Input 
                  id="modal-to" 
                  value={data.to} 
                  onChange={(e) => setData({ ...data, to: e.target.value })}
                  className="bg-background/50 border-border/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-subject" className="text-[10px] font-bold uppercase tracking-wider opacity-60">Tárgy</Label>
                <Input 
                  id="modal-subject" 
                  value={data.subject} 
                  onChange={(e) => setData({ ...data, subject: e.target.value })}
                  className="bg-background/50 border-border/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Üzenet</Label>
              <div className="modal-quill-wrapper rounded-md overflow-hidden bg-background/30 border border-border/40 text-foreground">
              <div className="modal-quill-wrapper rounded-md overflow-hidden bg-background/30 border border-border/40">
                <ClientQuill
                  value={data.message} 
                  onChange={(content: string) => setData({ ...data, message: content })}
                  modules={modules}
                  placeholder="Írja ide az üzenetet..."
                />
              </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 bg-muted/5 flex justify-between sm:justify-between items-center border-t border-border/20">
            <Button type="button" variant="ghost" onClick={onClose} disabled={sending}>
              Mégse
            </Button>
            <Button type="submit" className="gap-2 bg-warning text-warning-foreground hover:bg-warning/90 min-w-[120px]" disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Küldés
            </Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}
