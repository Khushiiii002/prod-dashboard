import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    await prisma.todo.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json({ message: "Deleted" })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const updated = await prisma.todo.update({
      where: { id },
      data: {
        completed: body.completed,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    )
  }
}