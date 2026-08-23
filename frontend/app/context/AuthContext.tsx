"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("orana_auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (isTokenExpired(parsed.token)) {
          localStorage.removeItem("orana_auth");
        } else {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      } catch {
        localStorage.removeItem("orana_auth");
      }
    }
  }, []);

  function login(t: string, u: AuthUser) {
    setToken(t);
    setUser(u);
    localStorage.setItem("orana_auth", JSON.stringify({ token: t, user: u }));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("orana_auth");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
