import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/auth/register
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, hotelName } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and Password are required" }, { status: 400 });
        }

        // Check availability
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name: "Admin", // Default name
                email,
                password: hashedPassword,
                hotelName
            }
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);

    } catch (error) {
        console.error("Register Error:", error);
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}
