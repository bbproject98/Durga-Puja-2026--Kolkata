"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setAuthToken } from "../lib/api";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, CheckCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@broomboom.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Mock validation or API request
    setTimeout(() => {
      if (email.trim() && password.length >= 4) {
        setAuthToken(`token_${Date.now()}_${Math.random().toString(36).substring(7)}`, {
          id: "adm-001",
          name: "Admin Controller",
          email: email.trim(),
          role: "Fleet & Booking Manager",
        });
        router.push("/admin");
      } else {
        setError("Invalid email or password. Minimum 4 characters required.");
        setLoading(false);
      }
    }, 600);
  };

  const handleFillDemo = () => {
    setEmail("admin@broomboom.com");
    setPassword("admin123");
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-radial from-slate-900 via-navy-900 to-navy-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200/80">
          {/* Logo & Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-navy-950 font-black text-xl mb-4 shadow-lg shadow-amber-500/30">
              BBC
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              BroomBoom Cabs
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mt-1">
              Admin &amp; Fleet Console
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Durga Puja 2026 Season Management</span>
            </div>
          </div>

          {/* Error Feedback */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@broomboom.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Quick Demo */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline"
              >
                Autofill Demo Login
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Pre-fill Notice */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Secure Chauffeur Fleet Operations Portal</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Default credentials: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">admin@broomboom.com</code> / <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">admin123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

