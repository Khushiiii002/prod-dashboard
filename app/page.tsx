"use client"

import { useEffect, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Todo {
  id: string
  title: string
  completed: boolean
  date: string
  priority: "High" | "Medium" | "Low"
}

export default function Home() {
  const { status } = useSession()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [taskDate, setTaskDate] = useState("")
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium")
  const [todos, setTodos] = useState<Todo[]>([])

  // Protect page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

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

  // Add task
  const addTask = async () => {
    if (!title.trim()) return

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        date: taskDate || new Date().toISOString(),
        priority,
      }),
    })

    if (res.ok) {
      const newTodo = await res.json()
      setTodos((prev) => [newTodo, ...prev])
      setTitle("")
      setTaskDate("")
      setPriority("Medium")
    }
  }

  // Delete task
  const deleteTask = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
    }
  }

  // Toggle complete
  const toggleComplete = async (id: string, completed: boolean) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    })

    if (res.ok) {
      const updatedTodo = await res.json()
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? updatedTodo : todo
        )
      )
    }
  }

  if (status === "loading") {
    return <p className="p-10 text-white">Loading...</p>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-6">

      {/* Header */}
      <div className="max-w-3xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Productivity Dashboard
        </h1>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
        >
          Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="max-w-3xl mx-auto grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg">
          <p className="text-gray-400 text-sm">Total Tasks</p>
          <p className="text-2xl font-bold">{todos.length}</p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg">
          <p className="text-gray-400 text-sm">Completed</p>
          <p className="text-2xl font-bold">
            {todos.filter((t) => t.completed).length}
          </p>
        </div>
      </div>

      {/* Add Task */}
      <div className="max-w-3xl mx-auto bg-gray-800/70 backdrop-blur-md p-6 rounded-2xl shadow-xl mb-10">
        <div className="flex flex-col md:flex-row gap-3">

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to do?"
            className="bg-gray-900 border border-gray-700 p-3 rounded-xl text-white flex-1 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="date"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
            className="bg-gray-900 border border-gray-700 p-3 rounded-xl text-white"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="bg-gray-900 border border-gray-700 p-3 rounded-xl text-white"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={addTask}
            className="bg-green-600 hover:bg-green-700 transition px-6 py-3 rounded-xl font-medium shadow-lg"
          >
            Add
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="max-w-3xl mx-auto space-y-4">
        {todos.map((todo, index) => {

          const isOverdue =
            !todo.completed &&
            new Date(todo.date) < new Date()

          return (
            <div
              key={todo.id}
              className={`bg-gray-800/60 backdrop-blur-md rounded-2xl p-5 flex justify-between items-center shadow-lg
              hover:scale-[1.02] transition duration-300 opacity-0 animate-fadeIn
              ${isOverdue ? "border border-red-500" : ""}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-4">

                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() =>
                    toggleComplete(todo.id, todo.completed)
                  }
                  className="w-5 h-5 mt-1 accent-green-500 cursor-pointer"
                />

                <div>
                  <p
                    className={`text-lg font-medium ${
                      todo.completed
                        ? "line-through text-gray-500"
                        : isOverdue
                        ? "text-red-400"
                        : "text-white"
                    }`}
                  >
                    {todo.title}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-sm text-gray-400">
                      📅 {new Date(todo.date).toLocaleDateString()}
                    </p>

                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        todo.priority === "High"
                          ? "bg-red-600/30 text-red-400"
                          : todo.priority === "Medium"
                          ? "bg-yellow-600/30 text-yellow-400"
                          : "bg-green-600/30 text-green-400"
                      }`}
                    >
                      {todo.priority}
                    </span>

                    {isOverdue && (
                      <span className="text-xs text-red-500 font-semibold">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteTask(todo.id)}
                className="text-red-400 hover:text-red-600 transition font-medium"
              >
                Delete
              </button>
            </div>
          )
        })}

        {todos.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No tasks yet. Add something productive ✨
          </div>
        )}
      </div>
    </div>
  )
}