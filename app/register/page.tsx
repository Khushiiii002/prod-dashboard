"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto-login after successful register
      const loginRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

     if (loginRes?.ok) {
  router.push("/dashboard");
} else {
  setError("Registered, but failed to sign in. Please login manually.");
  router.push("/login");
}
    } catch (err) {
      console.error("Request failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">

      {/* Aurora Gradient Layer */}
      <div className="absolute inset-0 aurora-bg opacity-60" />

      {/* Starfield Layers */}
      <div className="absolute inset-0 stars" />
      <div className="absolute inset-0 stars2" />
      <div className="absolute inset-0 stars3" />

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md bg-gray-900/60 backdrop-blur-2xl border border-gray-700 rounded-3xl p-10 shadow-2xl animate-fadeIn">

        <h1 className="text-3xl font-bold text-center mb-8 text-white tracking-tight">
          Create Account
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">

          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-black/60 border border-gray-700 p-4 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-black/60 border border-gray-700 p-4 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-black/60 border border-gray-700 p-4 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 transition-all duration-300 p-4 rounded-xl font-semibold shadow-lg hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-green-400 hover:underline">
              Login
            </a>
          </p>

        </form>
      </div>
    </div>
  );
}