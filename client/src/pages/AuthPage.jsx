import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // login | register
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login, register, loading, error, token, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "login") {
      const ok = await login(form.email, form.password);
      if (ok) navigate("/");
    } else {
      if (!form.name.trim()) return toast.error("Name is required");
      const ok = await register(form.name, form.email, form.password);
      if (ok) navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl" />

      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(124,92,252,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center glow-purple">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Smart Notepad
            </h1>
          </motion.div>
          <p className="text-text-secondary text-sm">
            AI-powered note-taking for the modern mind
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 border border-space-600">
          {/* Tab toggle */}
          <div className="flex bg-space-900 rounded-xl p-1 mb-6">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  mode === m
                    ? "bg-accent-purple text-white shadow-lg"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs text-text-secondary mb-1.5 font-medium">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full bg-space-900 border border-space-600 rounded-xl py-3 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30 outline-none transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-space-900 border border-space-600 rounded-xl py-3 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={mode === "register" ? "Min 6 characters" : "Your password"}
                  required
                  minLength={6}
                  className="w-full bg-space-900 border border-space-600 rounded-xl py-3 pl-10 pr-10 text-sm text-text-primary placeholder-text-muted focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-accent-purple to-accent-blue text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-purple"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-4 p-3 rounded-xl bg-space-900 border border-space-600">
            <p className="text-xs text-text-muted text-center">
              🧪 Demo: <span className="text-accent-cyan">demo@test.com</span> / <span className="text-accent-cyan">demo123</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
