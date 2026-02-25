import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const todos = await prisma.todo.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(todos)
}

export async function POST(req) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = await req.json()

  if (!body.title) {
    return new Response("Title required", { status: 400 })
  }

  const todo = await prisma.todo.create({
    data: {
      title: body.title,
      userId: session.user.id,
    },
  })

  return Response.json(todo)
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id } = await req.json()

  await prisma.todo.delete({
    where: {
      id,
      userId: session.user.id,
    },
  })

  return Response.json({ success: true })
}