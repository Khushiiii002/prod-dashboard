"use client"

import { useEffect, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Home() {

  // ✅ Hooks go here (TOP of component)
  const { status } = useSession()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [todos, setTodos] = useState([])

  // ✅ Protect page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // ✅ addTask function (NO HOOKS inside)
  const addTask = async () => {
    if (!title.trim()) return

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })

    if (res.ok) {
      const newTodo = await res.json()
      setTodos((prev) => [newTodo, ...prev])
      setTitle("")
    }
  }

  // Fetch todos
  useEffect(() => {
    const fetchTodos = async () => {
      const res = await fetch("/api/todos")
      if (res.ok) {
        const data = await res.json()
        setTodos(data)
      }
    }

    if (status === "authenticated") {
      fetchTodos()
    }
  }, [status])

  if (status === "loading") {
    return <p className="p-10">Loading...</p>
  }

  return (
    <div className="p-10">

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">My Tasks</h1>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-red-500 px-4 py-2 rounded text-white"
        >
          Sign Out
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task"
          className="border p-2 rounded text-black flex-1"
        />

        <button
          onClick={addTask}
          className="bg-green-500 px-4 py-2 rounded text-white"
        >
          Add
        </button>
      </div>

      <div className="space-y-3">
        {todos.map((todo: any) => (
          <div
            key={todo.id}
            className="bg-white text-black p-3 rounded"
          >
            {todo.title}
          </div>
        ))}
      </div>

    </div>
  )
}