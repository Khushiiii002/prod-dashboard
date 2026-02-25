import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const todos = await prisma.todo.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(todos)
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const todo = await prisma.todo.create({
  data: {
    title: body.title,
    completed: false,
    date: body.date ? new Date(body.date) : new Date(),
    priority: body.priority || "Medium",
    userId: session.user.id,
  },
})

    return NextResponse.json(todo)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    )
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await req.json()

    await prisma.todo.delete({
      where: {
        id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    )
  }
}