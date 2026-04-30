import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext.jsx";

export function LoginPage({ role: roleProp = "student" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const role = roleProp;
  const isTeacher = role === "teacher";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      const u = await login({
        role,
        email: email.trim(),
        password,
        name: isTeacher ? "Prof. Sarah Chen" : "Sadiq Haruna",
      });
      const dest = u?.role === "teacher" ? "/teacher" : "/";
      setLocation(dest);
    } catch (err) {
      setError(err?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-gray-800 via-gray-700 to-gray-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Classroom</h1>
          <p className="text-gray-300 mt-1">
            {isTeacher ? "Instructor portal" : "Learning management system"}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isTeacher ? "Instructor sign in" : "Sign in"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.edu"
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password reset coming soon.")}
                  className="text-sm text-gray-300 hover:text-gray-200"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-amber-300 bg-amber-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-medium text-white transition-colors bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-gray-500"
            >
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-sm mt-6">
          © Classroom • Prototype
        </p>
      </div>
    </div>
  );
}
