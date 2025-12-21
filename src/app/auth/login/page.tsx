"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Shield, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "react-hot-toast";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/admin/dashboard");
    }
  }, [status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Hibás email vagy jelszó");
      } else if (result?.ok) {
        toast.success("Sikeres bejelentkezés!");
        router.push("/admin/dashboard");
      }
    } catch (error) {
      toast.error("Hiba történt a bejelentkezés során");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Ellenőrzés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-warning/10 via-background to-background pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Back Button */}
        <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Vissza a főoldalra
          </Link>
        </Button>

        <Card className="border-border/50 shadow-xl shadow-warning/5">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 mb-2">
              <Shield className="h-7 w-7 text-warning" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Bejelentkezés</CardTitle>
            <CardDescription>
              Jelentkezz be az OAC Admin fiókodba
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email cím</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@oac.hu"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Jelszó</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-warning text-warning-foreground hover:bg-warning/90" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Bejelentkezés...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Bejelentkezés
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 bg-muted/20 border-t border-border/50 p-6">
            <div className="bg-warning/5 rounded-lg p-3 flex items-start gap-3">
              <Shield className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Ez az oldal csak OAC adminisztrátorok számára elérhető. Ha felhasználói fiókkal rendelkezel, használd a{" "}
                <Link href="/login" className="text-primary hover:underline">
                  normál bejelentkezést
                </Link>
                .
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-warning" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
