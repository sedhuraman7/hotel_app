"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, hotelName, wifiSsid, wifiPass })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Success
      if (typeof window !== 'undefined') {
        localStorage.setItem("hotelName", data.hotelName || hotelName || "My Hotel");
        localStorage.setItem("hotelEmail", data.email);
      }
      router.push("/dashboard");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/background.png"
          alt="Hotel Background"
          fill
          className="object-cover"
          quality={100}
        />
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-slate-900/80 to-black/90 backdrop-blur-[2px]" />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative z-10 w-full max-w-[480px] p-6 sm:p-10"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden relative">

          {/* Decor Accent - Top Right */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full blur-2xl opacity-50" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500 rounded-full blur-2xl opacity-30" />

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-600/30">
                <Building2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Hotel Management Portal
              </h1>
              <p className="text-slate-500 mt-2 text-sm">
                {isLogin
                  ? "Sign in to access your dashboard"
                  : "Register your new property"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium animate-pulse">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Toggle Switch */}
            <div className="bg-slate-100 p-1.5 rounded-xl flex mb-8 relative">
              <div
                className={`absolute inset-y-1.5 w-1/2 bg-white rounded-lg shadow-sm transition-all duration-300 ease-spring ${isLogin ? 'left-1.5' : 'left-[50%]'}`}
              />
              <button
                onClick={() => { setIsLogin(true); setError(""); }}
                className={`relative z-10 flex-1 py-2.5 text-sm font-medium transition-colors duration-300 ${isLogin ? 'text-blue-700' : 'text-slate-500'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(""); }}
                className={`relative z-10 flex-1 py-2.5 text-sm font-medium transition-colors duration-300 ${!isLogin ? 'text-blue-700' : 'text-slate-500'}`}
              >
                New Hotel
              </button>
            </div>

            {/* Form Fields */}
            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
                onSubmit={(e) => { e.preventDefault(); handleAuth(); }}
              >
                {!isLogin && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Hotel Name</label>
                      <div className="relative group">
                        <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type="text"
                          placeholder="Luxury Inn"
                          required={!isLogin}
                          value={hotelName}
                          onChange={(e) => setHotelName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* WiFi Setup (Optional) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">WiFi Name (SSID)</label>
                        <input
                          type="text"
                          placeholder="Hotel_Guest"
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">WiFi Password</label>
                        <input
                          type="text"
                          placeholder="Guest123"
                          value={wifiPass}
                          onChange={(e) => setWifiPass(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      placeholder="admin@hotel.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Additional Options */}
                {isLogin ? (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center group-hover:border-blue-500 transition-colors bg-white">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {/* Note: In a real checked state, you'd toggle opacity based on state */}
                      </div>
                      <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800">Remember me</span>
                    </label>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 px-1">
                    By registering, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>.
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group mt-2"
                >
                  <span className="text-lg">{loading ? "Wait..." : (isLogin ? "Sign In" : "Create Account")}</span>
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </motion.form>
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <button className="inline-flex items-center space-x-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium">
                <HelpCircle className="w-4 h-4" />
                <span>Need help? Contact Support</span>
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
