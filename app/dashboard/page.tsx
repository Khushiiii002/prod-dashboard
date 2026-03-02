"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  date: string;
  priority: "High" | "Medium" | "Low";
}

export default function Dashboard() {
  const { status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [priority, setPriority] =
    useState<"High" | "Medium" | "Low">("Medium");
  const [todos, setTodos] = useState<Todo[]>([]);

  // Protect page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch todos
  useEffect(() => {
    const fetchTodos = async () => {
      const res = await fetch("/api/todos");
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      }
    };

    if (status === "authenticated") {
      fetchTodos();
    }
  }, [status]);

  const addTask = async () => {
    if (!title.trim()) return;

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        date: taskDate || new Date().toISOString(),
        priority,
      }),
    });

    if (res.ok) {
      const newTodo = await res.json();
      setTodos((prev) => [newTodo, ...prev]);
      setTitle("");
      setTaskDate("");
      setPriority("Medium");
    }
  };

  const deleteTask = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });

    if (res.ok) {
      const updatedTodo = await res.json();
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? updatedTodo : todo
        )
      );
    }
  };

  if (status === "loading") {
    return <p className="p-10 text-white">Loading...</p>;
  }

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-6">
      <div className="max-w-3xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Productivity Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl"
        >
          Sign Out
        </button>
      </div>

      {/* Add Task */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="bg-gray-800 p-3 rounded-xl flex-1"
          />

          <input
            type="date"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
            className="bg-gray-800 p-3 rounded-xl"
          />

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as any)
            }
            className="bg-gray-800 p-3 rounded-xl"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={addTask}
            className="bg-green-600 px-6 py-3 rounded-xl"
          >
            Add
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="max-w-3xl mx-auto space-y-4">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="bg-gray-800 p-5 rounded-xl flex justify-between"
          >
            <div>
              <p
                className={
                  todo.completed
                    ? "line-through text-gray-500"
                    : ""
                }
              >
                {todo.title}
              </p>
              <p className="text-sm text-gray-400">
                {new Date(todo.date).toLocaleDateString()} •{" "}
                {todo.priority}
              </p>
            </div>

            <div className="flex gap-3">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() =>
                  toggleComplete(todo.id, todo.completed)
                }
              />
              <button
                onClick={() => deleteTask(todo.id)}
                className="text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {todos.length === 0 && (
          <p className="text-center text-gray-500">
            No tasks yet.
          </p>
        )}
      </div>
    </div>
  );
}