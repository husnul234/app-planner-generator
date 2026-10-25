"use client";

import React, { useState, useEffect } from "react";
import AuthPage from "../components/auth/AuthPage";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import UserDashboard from "../components/dashboard/UserDashboard";
import { ProfileItem } from "../types";
import { Shield, ArrowLeft } from "lucide-react";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<ProfileItem | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [simulatedRole, setSimulatedRole] = useState<"admin" | "user" | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("appplanner_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email && parsed.role) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not read user from localStorage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const handleLoginSuccess = (user: ProfileItem) => {
    setCurrentUser(user);
    setSimulatedRole(null);
    try {
      localStorage.setItem("appplanner_user", JSON.stringify(user));
    } catch (e) {
      console.warn("Could not save user to localStorage:", e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSimulatedRole(null);
    try {
      localStorage.removeItem("appplanner_user");
    } catch (e) {
      console.warn("Could not remove user from localStorage:", e);
    }
  };

  // Prevent hydration flash
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-zinc-400 font-mono text-xs">
        Memuat sesi AppPlanner AI...
      </div>
    );
  }

  // 1. Not Authenticated -> Show AuthPage
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Admin User in User Simulation Mode
  if (currentUser.role === "admin" && simulatedRole === "user") {
    return (
      <div>
        {/* Floating Simulation Bar */}
        <div className="bg-amber-950/90 border-b border-amber-500/40 text-amber-300 text-xs py-2 px-3 sm:px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sticky top-0 z-50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="leading-tight">Mode Simulasi: Anda sedang melihat tampilan antarmuka Pengguna (User).</span>
          </div>
          <button
            onClick={() => setSimulatedRole(null)}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Kembali ke Admin Console</span>
          </button>
        </div>
        <UserDashboard currentUser={{ ...currentUser, role: "user" }} onLogout={handleLogout} />
      </div>
    );
  }

  // 3. Admin User -> Show Admin Dashboard
  if (currentUser.role === "admin") {
    return (
      <AdminDashboard
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchToUserView={() => setSimulatedRole("user")}
      />
    );
  }

  // 4. Regular User -> Show User Dashboard
  return <UserDashboard currentUser={currentUser} onLogout={handleLogout} />;
}
