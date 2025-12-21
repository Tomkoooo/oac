"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

interface AdminAuthProviderProps {
  children: React.ReactNode;
  session: Session | null;
}

export function AdminAuthProvider({ children, session }: AdminAuthProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
