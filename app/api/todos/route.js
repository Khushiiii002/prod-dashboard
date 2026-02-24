import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { title, dueDate } = await req.json();

  if (!title || !dueDate) {
    return new Response("Title and dueDate required", { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return new Response("User not found", { status: 404 });

  const todo = await prisma.todo.create({
    data: {
      title,
      dueDate: new Date(dueDate),
      user: { connect: { id: user.id } },
    },
  });

  return new Response(JSON.stringify(todo), { status: 200 });
}

export async function GET() {
  const todos = await prisma.todo.findMany({ include: { user: true } });
  return new Response(JSON.stringify(todos), { status: 200 });
}