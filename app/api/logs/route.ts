import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const guestId = searchParams.get("guestId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!roomId && !guestId) return NextResponse.json({ error: "Missing roomId or guestId" }, { status: 400 });

    try {
        let whereCondition: any = {};

        // 1. FILTER BY GUEST ID
        if (guestId) {
            // Find Guest to get Card ID
            const guest = await prisma.guest.findUnique({
                where: { id: guestId }
            });

            if (guest && guest.rfidCardId) {
                // Fetch logs for this card
                whereCondition.cardId = guest.rfidCardId;
            } else {
                // Fallback: If no guest found, return empty
                return NextResponse.json([]);
            }
        }
        // 2. FILTER BY ROOM ID
        else if (roomId) {
            // Find Room to get Device ID
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: { currentGuest: true }
            });

            if (room && room.deviceId) {
                // Fetch logs for this device
                whereCondition.deviceId = room.deviceId;
            } else if (room?.currentGuest?.rfidCardId) {
                // Fallback: Fetch logs for current guest
                whereCondition.cardId = room.currentGuest.rfidCardId;
            } else {
                return NextResponse.json([]);
            }
        }

        // 3. Date Range Filter
        if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            endDate.setHours(23, 59, 59, 999);

            whereCondition.timestamp = {
                gte: startDate,
                lte: endDate
            };
        }

        // 4. Execute Query
        const logs = await prisma.accessLog.findMany({
            where: whereCondition,
            orderBy: { timestamp: 'desc' },
            take: 100
        });

        return NextResponse.json(logs);

    } catch (error) {
        console.error("Logs Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
