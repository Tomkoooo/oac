"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, Shield, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/admin/dashboard");
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-warning animate-spin" />
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (session) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Hibás email cím vagy jelszó");
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Hiba történt a bejelentkezés során");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full blur-3xl bg-warning/40 animate-float" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full blur-3xl bg-warning/20 animate-float" style={{ animationDelay: '2s' }} />
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/20 border-2 border-warning/50 shadow-lg shadow-warning/30">
              <Shield className="h-8 w-8 text-warning" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                <span className="text-warning">Admin</span> Bejelentkezés
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Csak adminisztrátorok számára
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-error/10 border border-error/50 text-error text-sm text-center">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Admin Email cím
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-warning focus:border-transparent transition-all"
                  placeholder="admin@oac.hu"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Jelszó
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-11 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-warning focus:border-transparent transition-all"
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
              className="w-full h-12 px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-warning to-warning/80 text-warning-foreground shadow-lg shadow-warning/30 hover:shadow-warning/50 hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Bejelentkezés...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Admin Bejelentkezés
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="glass-card p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Ez egy védett adminisztrátori felület.
            <br />
            Csak jogosult személyek léphetnek be.
          </p>
        </div>
      </div>
    </div>
  );
}

