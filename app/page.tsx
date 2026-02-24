"use client"; // ✅ MUST be the first line for client-side hooks

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

// Define types
interface Todo {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

export default function Home() {
  const { data: session } = useSession() as { data: { user: SessionUser } | null };
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Redirect to sign-in if not logged in
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <button
          onClick={() => signIn()}
          className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-500"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Fetch todos for logged-in user
  const fetchTodos = async () => {
    try {
      const res = await fetch(`/api/todos?userId=${session.user.id}`);
      if (!res.ok) throw new Error("Failed to fetch todos");
      const data: Todo[] = await res.json();
      setTodos(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [session]);

  // Add a new todo
  const addTodo = async () => {
    if (!title || !dueDate) return alert("Title and due date required");

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          dueDate: new Date(dueDate).toISOString(),
          userId: session.user.id,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("Add todo failed:", error);
        return;
      }

      setTitle("");
      setDueDate("");
      fetchTodos();
    } catch (err) {
      console.error("Add todo failed:", err);
    }
  };

  // Toggle completed status
  const toggleCompleted = async (id: string, completed: boolean) => {
    try {
      await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !completed }),
      });
      fetchTodos();
    } catch (err) {
      console.error("Toggle completed failed", err);
    }
  };

  // Delete a todo
  const deleteTodo = async (id: string) => {
    try {
      await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
      fetchTodos();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Productivity Dashboard</h1>
        <button
          onClick={() => signOut()}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-500"
        >
          Sign Out
        </button>
      </div>

      {/* Add Todo Form */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 rounded text-black flex-1"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="p-2 rounded text-black"
        />
        <button
          onClick={addTodo}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
        >
          Add
        </button>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex justify-between items-center p-4 bg-gray-800 rounded"
          >
            <div
              className={`flex items-center gap-4 cursor-pointer ${
                todo.completed ? "line-through text-gray-400" : ""
              }`}
              onClick={() => toggleCompleted(todo.id, todo.completed)}
            >
              <span>{todo.title}</span>
              <span className="text-sm text-gray-300">
                {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="bg-red-600 px-2 py-1 rounded hover:bg-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}