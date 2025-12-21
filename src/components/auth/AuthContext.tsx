"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any | null;
  login: (userData?: any) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  user: null,
  login: () => {},
  logout: () => {},
  checkAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/user/clubs");
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setUser(data); // Assuming data contains user info or clubs
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData?: any) => {
    setIsAuthenticated(true);
    if (userData) {
      setUser(userData);
    } else {
      checkAuth(); // Fetch user data if not provided
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
    checkAuth(); // Verify session is cleared on server
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
