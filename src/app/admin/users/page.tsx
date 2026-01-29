"use client";

import { useEffect, useState } from "react";
import { 
  UserPlus, 
  Loader2, 
  Trash2, 
  ShieldAlert, 
  Eye, 
  EyeOff 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/PageHeader";
import { Users } from "lucide-react";

interface AdminUser {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Password Change States
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      toast.error("Nem sikerült betölteni az adminokat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      });

      if (!response.ok) throw new Error("Létrehozás sikertelen");

      toast.success('Új admin felhasználó létrehozva!');
      setIsDialogOpen(false);
      setNewAdmin({ email: '', password: '' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (userId: string, email: string) => {
    if (!confirm(`Biztos törölni szeretnéd ezt az admint: ${email}?`)) return;

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Törlés sikertelen");
      toast.success('Törölve');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    setChangingPassword(true);
    try {
      const response = await fetch('/api/admin/users/password', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ userId: selectedUser._id, newPassword })
      });

      if (!response.ok) throw new Error("Nem sikerült módosítani a jelszót");
      
      toast.success("Jelszó sikeresen módosítva!");
      setIsPasswordDialogOpen(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setChangingPassword(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Admin Felhasználók" 
        description="Kezeld az OAC portal adminisztrátorait"
        icon={Users}
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-warning text-warning-foreground hover:bg-warning/90">
              <UserPlus className="h-4 w-4" />
              Új Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/40">
            <form onSubmit={handleCreateAdmin}>
              <DialogHeader>
                <DialogTitle>Új Admin Felhasználó</DialogTitle>
                <DialogDescription>
                  Adj meg egy email címet és jelszót az új admin hozzáféréshez.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email cím</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Jelszó</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Mégse</Button>
                <Button type="submit" className="bg-warning text-warning-foreground" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Létrehozás
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>


      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="bg-card border-border/40">
             <form onSubmit={handleChangePassword}>
                <DialogHeader>
                    <DialogTitle>Jelszó Módosítása</DialogTitle>
                    <DialogDescription>
                        Új jelszó megadása a következő felhasználónak: <span className="font-bold">{selectedUser?.email}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-6">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Új Jelszó</Label>
                        <Input 
                            id="newPassword"
                            type="text"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Új jelszó..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsPasswordDialogOpen(false)}>Mégse</Button>
                    <Button type="submit" className="bg-primary text-primary-foreground" disabled={changingPassword}>
                        {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Mentés
                    </Button>
                </DialogFooter>
             </form>
        </DialogContent>
      </Dialog>

      <Card className="border-border/40 bg-card/40 backdrop-blur-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-[300px]">Felhasználó</TableHead>
                <TableHead>Szerepkör</TableHead>
                <TableHead>Létrehozva</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                   <TableCell colSpan={4} className="h-24 text-center">
                     <Loader2 className="h-6 w-6 animate-spin mx-auto text-warning" />
                   </TableCell>
                 </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Nem találhatók admin felhasználók.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} className="border-border/40 hover:bg-muted/30 group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {user.email[0].toUpperCase()}
                        </div>
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'superadmin' ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('hu-HU')}
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-2">
                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                  setSelectedUser(user);
                                  setIsPasswordDialogOpen(true);
                              }}
                          >
                              Jelszó
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteAdmin(user._id, user.email)}
                            disabled={user.role === 'superadmin'} // Prevent self-deletion of superadmins if applicable
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
