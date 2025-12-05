"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Trophy } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Bejelentkezés feldolgozása...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL params (tDarts will pass it back)
        const token = searchParams?.get("token");
        const error = searchParams?.get("error");

        if (error) {
          setStatus("error");
          setMessage("Bejelentkezés sikertelen. Kérjük, próbáld újra.");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
          return;
        }

        if (!token) {
          // Try to use the existing session/cookie
          // Check if user is authenticated
          const response = await fetch("/api/user/clubs");
          
          if (response.ok) {
            setStatus("success");
            setMessage("Sikeres bejelentkezés! Átirányítás...");
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);
          } else {
            throw new Error("No valid session found");
          }
        } else {
          // Token provided in URL, validate it
          const response = await fetch("/api/auth/validate-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            setStatus("success");
            setMessage("Sikeres bejelentkezés! Átirányítás...");
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);
          } else {
            throw new Error("Token validation failed");
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage("Hiba történt a bejelentkezés során.");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-12 text-center space-y-6 max-w-md w-full animate-fade-in-up">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 border-2 border-primary/50">
          {status === "loading" && <Loader2 className="h-10 w-10 text-primary animate-spin" />}
          {status === "success" && <CheckCircle2 className="h-10 w-10 text-success" />}
          {status === "error" && <AlertCircle className="h-10 w-10 text-error" />}
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            {status === "loading" && "Bejelentkezés..."}
            {status === "success" && "Sikeres!"}
            {status === "error" && "Hiba"}
          </h2>
          <p className="text-muted-foreground">{message}</p>
        </div>

        {status === "loading" && (
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">tDarts Platform</span>
          </div>
        )}
      </div>
    </div>
  );
}

