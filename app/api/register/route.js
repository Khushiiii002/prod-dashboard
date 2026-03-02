import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    // Parse JSON safely
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", user: { id: newUser.id, name: newUser.name, email: newUser.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}