"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Mail, Lock, Trophy, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/components/auth/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth(); // Use context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
        router.replace("/dashboard");
    } else {
        setCheckingAuth(false);
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Bejelentkezés sikertelen");
      }

      // Update context and redirect
      login(); 
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message || "Hiba történt a bejelentkezés során");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError("");
    
    const tdartsUrl = process.env.NEXT_PUBLIC_TDARTS_API_URL || "https://tdarts.sironic.hu";
    const returnUrl = encodeURIComponent(`${window.location.origin}/auth/callback`);
    window.location.href = `${tdartsUrl}/api/auth/signin/google?callbackUrl=${returnUrl}`;
  };

  // Show loading while checking authentication
  if (checkingAuth) {
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Back Button */}
        <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all" asChild>
            <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Vissza a főoldalra
            </Link>
        </Button>

        <Card className="border-border/50 shadow-xl shadow-primary/5">
            <CardHeader className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-2">
                    <Trophy className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Bejelentkezés</CardTitle>
                <CardDescription>
                    Jelentkezz be tDarts fiókod adataival
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium flex items-center justify-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        {error}
                    </div>
                )}

                {/* Google Login Button */}
                <Button
                    variant="outline"
                    className="w-full h-11 gap-3 hover:bg-muted/50 font-medium"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                >
                    {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    )}
                    <span>Bejelentkezés Google-lal</span>
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Vagy</span>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email cím</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="pelda@email.com"
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

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? (
                            <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Bejelentkezés...
                            </>
                        ) : (
                            <>
                            <LogIn className="h-4 w-4 mr-2" />
                            Bejelentkezés
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 bg-muted/20 border-t border-border/50 p-6">
                 <div className="text-center w-full">
                    <span className="text-sm text-muted-foreground">Nincs még fiókod? </span>
                    <a
                        href="https://tdarts.sironic.hu/auth/register"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline underline-offset-4"
                    >
                        Regisztráció
                    </a>
                </div>
                 
                 <div className="bg-primary/5 rounded-lg p-3 flex items-start gap-3">
                    <Trophy className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                        A tDarts platformmal integrált OAC liga használatához tDarts fiókra van szükség. 
                    </p>
                </div>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
