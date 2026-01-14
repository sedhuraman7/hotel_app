import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List all rooms
export async function GET() {
    try {
        const rooms = await prisma.room.findMany({
            orderBy: { id: "asc" }
        });
        return NextResponse.json(rooms);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
    }
}

// POST: Add a new room
export async function POST(req: NextRequest) {
    try {
        const body = await req.json(); // { id, type, deviceId }

        // Validation: Check if Room ID exists
        const exists = await prisma.room.findUnique({ where: { id: body.id } });
        if (exists) {
            return NextResponse.json({ error: "Room ID already exists" }, { status: 400 });
        }

        const room = await prisma.room.create({
            data: {
                id: body.id,
                type: body.type,
                deviceId: body.deviceId || null,
                status: "Vacant"
            }
        });

        return NextResponse.json(room);
    } catch (error) {
        console.error("Add Room Error:", error);
        return NextResponse.json({ error: "Failed to add room" }, { status: 500 });
    }
}

// PUT: Update Room Device ID
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json(); // { id, deviceId }

        const room = await prisma.room.update({
            where: { id: body.id },
            data: { deviceId: body.deviceId }
        });

        return NextResponse.json(room);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
    }
}
