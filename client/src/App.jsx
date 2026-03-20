import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/auth" replace />;
};

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a2e",
            color: "#e8e8f0",
            border: "1px solid rgba(124,92,252,0.3)",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#5cfca0", secondary: "#1a1a2e" } },
          error: { iconTheme: { primary: "#fc5c5c", secondary: "#1a1a2e" } },
        }}
      />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
