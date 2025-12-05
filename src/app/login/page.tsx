"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Mail, Lock, Trophy, ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      setError("Bejelentkezés sikertelen. Kérjük, próbáld újra.");
    }
  }, [searchParams]);

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

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Hiba történt a bejelentkezés során");
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

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full blur-3xl bg-primary/40 animate-float" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full blur-3xl bg-primary/20 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in-up">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Vissza a főoldalra
        </Link>

        {/* Login Card */}
        <div className="glass-card p-8 space-y-6">
          {/* Logo & Title */}
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 border-2 border-primary/50 shadow-lg shadow-primary/30">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gradient-red text-glow">
                Bejelentkezés
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Jelentkezz be tDarts fiókod adataival
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-error/10 border border-error/50 text-error text-sm text-center">
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full h-12 px-6 rounded-xl font-semibold transition-all duration-300 border-2 border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 inline-flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                <span>Bejelentkezés Google-lal</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">Vagy</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email cím
              </label>
              <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="pelda@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Jelszó
              </label>
              <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none h-5 w-5 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-11 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full glass-button h-12 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Bejelentkezés...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Bejelentkezés
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">Nincs még fiókod?</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <a
              href="https://tdarts.sironic.hu/auth/register"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Regisztrálj a tDarts platformon
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </a>
          </div>
        </div>

        {/* Info Box */}
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-start gap-3">
            <Trophy className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Miért kell tDarts fiók?</p>
              <p>
                A tDarts platformmal integrált OAC liga használatához tDarts fiókra van szükség. 
                A Google-lal történő bejelentkezés gyors és biztonságos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
