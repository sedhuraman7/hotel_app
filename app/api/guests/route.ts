import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Check In Guest
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // body: { name, roomId, cardId, phone, paymentStatus, totalAmount }

        const { name, roomId, cardId, phone, paymentStatus, totalAmount } = body;

        // 1. Check if Room is Vacant
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
        if (room.status !== "Vacant") return NextResponse.json({ error: "Room is not vacant" }, { status: 400 });

        // 2. Create Guest Record
        const guest = await prisma.guest.create({
            data: {
                name,
                roomId,
                rfidCardId: cardId, // Optional
                paymentStatus,
                totalAmount: parseFloat(totalAmount),
                status: "Checked In",
                currentRoomId: roomId // Bind as active guest
            }
        });

        // 3. Update Room Status
        await prisma.room.update({
            where: { id: roomId },
            data: { status: "Occupied" }
        });

        return NextResponse.json(guest);

    } catch (error) {
        console.error("Check-in Error:", error);
        return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
    }
}

// GET: List Guests (Active & History)
export async function GET(req: NextRequest) {
    try {
        const guests = await prisma.guest.findMany({
            orderBy: { checkInTime: 'desc' },
            include: { room: true }
        });
        return NextResponse.json(guests);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 });
    }
}
