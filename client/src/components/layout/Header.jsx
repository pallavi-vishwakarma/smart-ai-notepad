import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, PanelLeft, BrainCircuit, LogOut, Sun, Moon, ChevronDown
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useNotesStore } from "../../store/notesStore";
import { useNavigate } from "react-router-dom";

function useTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains("light") ? "light" : "dark"
  );
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("light", next === "light");
    document.documentElement.classList.toggle("dark", next === "dark");
    setTheme(next);
    localStorage.setItem("theme", next);
  };
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.toggle("light", saved === "light");
    document.documentElement.classList.toggle("dark", saved === "dark");
    setTheme(saved);
  }, []);
  return { theme, toggle };
}

export default function Header({ showSidebar, onToggleSidebar, showAI, onToggleAI }) {
  const { user, logout } = useAuthStore();
  const { saving, activeNoteId } = useNotesStore();
  const { theme, toggle: toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="h-12 bg-space-900 border-b border-space-700 flex items-center px-3 gap-2 flex-shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-1">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>
        <span className="font-display font-bold text-sm text-gradient hidden sm:block">
          Smart Notepad
        </span>
      </div>

      {/* Toggle sidebar */}
      <button
        onClick={onToggleSidebar}
        title="Toggle sidebar"
        className={`p-1.5 rounded-lg transition-colors ${
          showSidebar ? "bg-space-700 text-text-primary" : "text-text-muted hover:text-text-primary hover:bg-space-800"
        }`}
      >
        <PanelLeft size={15} />
      </button>

      <div className="flex-1" />

      {/* Save indicator */}
      {activeNoteId && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted px-1">
          {saving ? (
            <><div className="w-1.5 h-1.5 rounded-full bg-accent-yellow animate-pulse" /><span className="hidden sm:inline">Saving…</span></>
          ) : (
            <><div className="w-1.5 h-1.5 rounded-full bg-accent-green" /><span className="hidden sm:inline">Saved</span></>
          )}
        </div>
      )}

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title="Toggle theme"
        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-space-800 transition-colors"
      >
        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Toggle AI */}
      <button
        onClick={onToggleAI}
        title="Toggle AI panel"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
          showAI
            ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30"
            : "text-text-muted hover:text-text-primary hover:bg-space-800"
        }`}
      >
        <BrainCircuit size={14} />
        <span className="hidden sm:block">AI</span>
      </button>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu((s) => !s)}
          className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-lg hover:bg-space-800 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="text-xs text-text-secondary hidden sm:block max-w-[72px] truncate">
            {user?.name}
          </span>
          <ChevronDown size={11} className="text-text-muted flex-shrink-0" />
        </button>

        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-1 w-44 bg-space-800 border border-space-600 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-space-700">
                <p className="text-xs font-semibold text-text-primary truncate">{user?.name}</p>
                <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-accent-red hover:bg-space-700 transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      )}
    </header>
  );
}
