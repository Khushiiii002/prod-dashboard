"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    setLoading(false)

    if (res?.ok) {
      router.push("/")
    } else {
      alert("Invalid credentials")
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">

      {/* 🌌 Aurora Gradient Layer */}
      <div className="absolute inset-0 aurora-bg opacity-60" />

      {/* 🌠 Starfield Layer */}
      <div className="absolute inset-0 stars" />
      <div className="absolute inset-0 stars2" />
      <div className="absolute inset-0 stars3" />

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md bg-gray-900/60 backdrop-blur-2xl border border-gray-700 rounded-3xl p-10 shadow-2xl animate-fadeIn">

        <h1 className="text-3xl font-bold text-center mb-8 text-white tracking-tight">
          Welcome Back
        </h1>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/60 border border-gray-700 p-4 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/60 border border-gray-700 p-4 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 transition-all duration-300 p-4 rounded-xl font-semibold shadow-lg hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login / Register"}
          </button>

        </div>

      </div>
    </div>
  )
}